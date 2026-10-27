import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authDelete, authGet, authPatch, authPost, authPut, fetchJson, formatPrice, normalizeLineItem, normalizeProduct, postJson, resolveAssetUrl } from '../lib/api'
import { useAuth } from './AuthContext'
import { useAddress } from './AddressContext'
import {
  DEFAULT_DELIVERY,
  defaultOptionForAddress,
  mergeDeliveryConfig,
} from '../lib/delivery'

const CartContext = createContext(null)
const STORAGE_KEY = 'tokri_mobile_cart'

function withTotals(items, _rates, discount = 0) {
  const safeItems = Array.isArray(items) ? items : []
  const itemsTotal = safeItems.reduce((sum, item) => sum + Number(item.priceValue) * Number(item.quantity), 0)
  const hasItems = safeItems.length > 0
  const safeDiscount = hasItems ? Math.max(0, Number(discount) || 0) : 0

  return {
    items: safeItems,
    itemsTotal,
    deliveryCharge: 0,
    handlingCharge: 0,
    smallCartCharge: 0,
    discount: safeDiscount,
    grandTotal: 0,
    totalCount: safeItems.reduce((sum, item) => sum + Number(item.quantity), 0),
  }
}

function moneyValue(value) {
  if (value == null || value === '') return 0
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function lineOldPriceValue(item) {
  return moneyValue(item?.oldPriceValue) || moneyValue(item?.oldPrice)
}

function withItemPricing(item, source) {
  if (!item) return item
  const oldPriceValue = lineOldPriceValue(item) || lineOldPriceValue(source)
  return normalizeLineItem({
    ...item,
    oldPrice: item.oldPrice || source?.oldPrice || (oldPriceValue ? formatPrice(oldPriceValue) : null),
    oldPriceValue,
  })
}

function mergeCartItems(incoming, previous = [], product) {
  const prev = new Map((previous || []).map((item) => [item.slug, item]))
  return (incoming || []).map((item) => {
    const extra = product && (product.slug === item.slug || product.id === item.slug) ? product : null
    const merged = withItemPricing(withItemPricing(normalizeLineItem(item), prev.get(item.slug)), extra)
    // Prefer a resolved product image when server still sends staging upload host
    if (extra?.image) merged.image = resolveAssetUrl(extra.image) || merged.image
    return merged
  })
}

function toLineItem(product, quantity) {
  const normalized = normalizeProduct(product)
  const oldPriceValue = moneyValue(normalized.oldPriceValue) || moneyValue(normalized.oldPrice)
  return {
    id: normalized.slug,
    slug: normalized.slug,
    name: normalized.name,
    price: normalized.price || formatPrice(normalized.priceValue),
    priceValue: Number(normalized.priceValue) || 0,
    image: normalized.image,
    weight: normalized.weight,
    category: normalized.category,
    oldPrice: normalized.oldPrice || (oldPriceValue ? formatPrice(oldPriceValue) : null),
    oldPriceValue,
    quantity,
  }
}

export function CartProvider({ children }) {
  const { token, isLoggedIn, booting } = useAuth()
  const { selectedAddress } = useAddress()
  const [rates, setRates] = useState({
    option: 'morning',
    delivery: DEFAULT_DELIVERY,
  })
  const [quoteState, setQuoteState] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [deliveryOption, setDeliveryOption] = useState('morning')
  const [cart, setCart] = useState(withTotals([]))
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const itemsRef = useRef([])
  const sessionRef = useRef(null)
  itemsRef.current = cart.items

  const quoteKey = JSON.stringify({
    items: cart.items.map((item) => [item.slug, item.quantity]),
    option: rates.option || deliveryOption,
    discount: coupon?.discount || 0,
    customer: isLoggedIn ? token : null,
  })
  const quote = quoteState?.key === quoteKey ? quoteState.data : null
  const quoteLoading = cart.items.length > 0 && !quote

  useEffect(() => {
    if (!cart.items.length) return undefined
    let ignore = false
    const body = {
      items: cart.items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      deliveryOption: rates.option || deliveryOption,
      discount: coupon?.discount || 0,
    }
    const request = isLoggedIn && token
      ? authPost('/checkout/quote', token, body)
      : postJson('/checkout/quote', body)
    request.then((data) => {
      if (ignore) return
      setQuoteState({ key: quoteKey, data })
      setQuoteError('')
    }).catch((error) => {
      if (!ignore) setQuoteError(error.message || 'Could not calculate delivery charges.')
    })
    return () => { ignore = true }
  }, [quoteKey, token])

  const refreshDeliveryQuote = useCallback(async () => {
    if (!cart.items.length) return null
    const body = {
      items: cart.items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      deliveryOption: rates.option || deliveryOption,
      discount: coupon?.discount || 0,
    }
    try {
      const data = isLoggedIn && token
        ? await authPost('/checkout/quote', token, body)
        : await postJson('/checkout/quote', body)
      setQuoteState({ key: quoteKey, data })
      setQuoteError('')
      return data
    } catch (error) {
      setQuoteError(error.message || 'Could not calculate delivery charges.')
      throw error
    }
  }, [cart.items, coupon?.discount, deliveryOption, isLoggedIn, quoteKey, rates.option, token])

  const persist = useCallback(async (nextCart) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart))
  }, [])

  const applyLocal = useCallback(
    async (updater) => {
      let next
      setCart((current) => {
        next = withTotals(updater(current.items || []), rates, coupon?.discount || 0)
        return next
      })
      if (next) await persist(next)
      return next
    },
    [persist, rates, coupon?.discount],
  )

  const stampItems = useCallback(
    (incoming, product) => withTotals(mergeCartItems(incoming, itemsRef.current, product), rates, coupon?.discount || 0),
    [rates, coupon?.discount],
  )

  useEffect(() => {
    let ignore = false
    fetchJson('/app/bootstrap')
      .then((data) => {
        if (ignore || !data?.charges) return
        setRates((current) => ({
          ...current,
          delivery: mergeDeliveryConfig(data.charges.delivery || data.settings?.charges?.delivery),
        }))
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const next = defaultOptionForAddress(selectedAddress)
    setDeliveryOption(next)
    setRates((current) => ({ ...current, option: next }))
  }, [selectedAddress?.id, selectedAddress?.delivery?.defaultOption])

  useEffect(() => {
    setCart((current) => withTotals(current.items || [], rates, coupon?.discount || 0))
  }, [rates, coupon?.discount])

  useEffect(() => {
    let ignore = false
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (ignore) return
        if (raw) {
          const stored = JSON.parse(raw)
          if (Array.isArray(stored?.items)) {
            setCart(withTotals(stored.items.map(normalizeLineItem), rates, coupon?.discount || 0))
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setHydrated(true)
      })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated || booting) return undefined
    if (!isLoggedIn || !token) {
      sessionRef.current = 'guest'
      return undefined
    }
    if (sessionRef.current === token) return undefined

    let ignore = false
    const justLoggedIn = sessionRef.current === 'guest'
    sessionRef.current = token

    async function syncCart() {
      const localItems = itemsRef.current || []
      let serverItems = []
      try {
        const data = await authGet('/account/cart', token)
        serverItems = data.cart?.items || []
      } catch {
        serverItems = []
      }
      if (ignore) return

      if (!justLoggedIn) {
        const next = stampItems(serverItems)
        setCart(next)
        await persist(next)
        return
      }

      if (!localItems.length) {
        if (serverItems.length) {
          const next = stampItems(serverItems)
          setCart(next)
          await persist(next)
        }
        return
      }

      const merged = new Map()
      for (const item of serverItems) merged.set(item.slug, { ...item })
      for (const item of localItems) {
        const existing = merged.get(item.slug)
        if (existing) {
          existing.quantity = Math.min(99, Number(existing.quantity || 0) + Number(item.quantity || 0))
        } else {
          merged.set(item.slug, item)
        }
      }
      const items = [...merged.values()]
      try {
        const data = await authPut('/account/cart', token, {
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        })
        if (ignore) return
        const next = stampItems(data.cart?.items || items)
        setCart(next)
        await persist(next)
      } catch {
        if (!ignore) {
          const next = stampItems(items)
          setCart(next)
          await persist(next)
        }
      }
    }

    syncCart()
    return () => {
      ignore = true
    }
  }, [hydrated, booting, isLoggedIn, token, stampItems, persist])

  useEffect(() => {
    if (!hydrated) return undefined
    const missing = (itemsRef.current || []).filter((item) => !lineOldPriceValue(item) && !item.priceChecked)
    if (!missing.length) return undefined

    let ignore = false
    Promise.all(
      missing.map((item) =>
        fetchJson(`/products/${encodeURIComponent(item.slug)}`)
          .then((product) => [item.slug, product])
          .catch(() => [item.slug, null]),
      ),
    ).then((pairs) => {
      if (ignore) return
      const catalog = Object.fromEntries(pairs)
      setCart((current) => {
        const items = current.items.map((item) => {
          if (lineOldPriceValue(item) || item.priceChecked) return item
          const product = catalog[item.slug]
          const oldPriceValue = moneyValue(product?.oldPriceValue) || moneyValue(product?.oldPrice)
          return {
            ...item,
            oldPrice: product?.oldPrice || (oldPriceValue ? formatPrice(oldPriceValue) : null),
            oldPriceValue,
            priceChecked: true,
          }
        })
        const next = withTotals(items, rates, coupon?.discount || 0)
        persist(next)
        return next
      })
    })

    return () => {
      ignore = true
    }
  }, [hydrated, cart.items.map((item) => item.slug).join('|'), rates, coupon?.discount, persist])

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn || !token) return null
    setLoading(true)
    try {
      const data = await authGet('/account/cart', token)
      if (data.cart) {
        const next = stampItems(data.cart.items || [])
        setCart(next)
        await persist(next)
        return next
      }
    } catch {
      // Keep the local cart if the live cart API is down.
    } finally {
      setLoading(false)
    }
    return null
  }, [isLoggedIn, token, persist, stampItems])

  const addItem = useCallback(
    async (slug, quantity = 1, product) => {
      if (token) {
        try {
          const data = await authPost('/account/cart/items', token, { slug, quantity })
          const next = stampItems(data.cart?.items || [], product)
          setCart(next)
          await persist(next)
          return next
        } catch {
          // Fall back to a local cart so shopping still works.
        }
      }

      let details = product
      if (!details?.slug) {
        details = await fetchJson(`/products/${encodeURIComponent(slug)}`)
      }

      return applyLocal((items) => {
        const existing = items.find((item) => item.slug === slug)
        if (existing) {
          return items.map((item) =>
            item.slug === slug ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item,
          )
        }
        return [...items, toLineItem(details, quantity)]
      })
    },
    [token, persist, applyLocal, stampItems],
  )

  const updateQuantity = useCallback(
    async (slug, quantity) => {
      if (token) {
        try {
          const data = await authPatch(`/account/cart/items/${slug}`, token, { quantity })
          const next = stampItems(data.cart?.items || [])
          setCart(next)
          await persist(next)
          return next
        } catch {
          // Fall back locally.
        }
      }

      return applyLocal((items) => {
        if (quantity <= 0) return items.filter((item) => item.slug !== slug)
        return items.map((item) => (item.slug === slug ? { ...item, quantity } : item))
      })
    },
    [token, persist, applyLocal, stampItems],
  )

  const removeItem = useCallback(
    async (slug) => {
      if (token) {
        try {
          const data = await authDelete(`/account/cart/items/${slug}`, token)
          const next = stampItems(data.cart?.items || [])
          setCart(next)
          await persist(next)
          return next
        } catch {
          // Fall back locally.
        }
      }

      return applyLocal((items) => items.filter((item) => item.slug !== slug))
    },
    [token, persist, applyLocal, stampItems],
  )

  const clearCart = useCallback(async () => {
    if (token) {
      try {
        await authDelete('/account/cart', token)
      } catch {
        // Ignore live-cart failures; still clear locally.
      }
    }
    const empty = withTotals([], rates, 0)
    setCart(empty)
    setCoupon(null)
    setCouponError('')
    await persist(empty)
    return empty
  }, [token, persist, rates])

  const applyCoupon = useCallback(
    async (rawCode) => {
      const code = String(rawCode || '').trim().toUpperCase()
      if (!code) throw new Error('Enter a coupon code')
      if (!cart.items.length) throw new Error('Add items to your cart first')

      setCouponLoading(true)
      setCouponError('')
      try {
        const body = {
          code,
          items: cart.items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
          deliveryOption: rates.option || deliveryOption,
        }
        const data = token
          ? await authPost('/checkout/preview-coupon', token, body)
          : await postJson('/checkout/preview-coupon', body)
        setCoupon(data.coupon)
        setCart((current) => withTotals(current.items || [], rates, data.coupon?.discount || 0))
        return data.coupon
      } catch (error) {
        setCoupon(null)
        setCouponError(error.message || 'This coupon could not be applied')
        throw error
      } finally {
        setCouponLoading(false)
      }
    },
    [cart.items, token, rates, deliveryOption],
  )

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setCouponError('')
    setCart((current) => withTotals(current.items || [], rates, 0))
  }, [rates])

  useEffect(() => {
    const items = itemsRef.current || []
    if (!coupon?.code || !items.length) return undefined
    let ignore = false
    const body = {
      code: coupon.code,
      items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      deliveryOption: rates.option || deliveryOption,
    }
    const request = token
      ? authPost('/checkout/preview-coupon', token, body)
      : postJson('/checkout/preview-coupon', body)
    request
      .then((data) => {
        if (!ignore) {
          setCoupon(data.coupon)
          setCart((current) => withTotals(current.items || [], rates, data.coupon?.discount || 0))
        }
      })
      .catch((error) => {
        if (ignore) return
        setCoupon(null)
        setCouponError(error.message || 'Coupon is no longer valid for this cart')
      })
    return () => {
      ignore = true
    }
  }, [deliveryOption, rates.option, coupon?.code, token])

  const assignCart = useCallback(
    (next) => {
      if (!next || !Array.isArray(next.items)) {
        const empty = withTotals([], rates, 0)
        setCart(empty)
        setCoupon(null)
        setCouponError('')
        persist(empty)
        return empty
      }
      const mapped = withTotals(next.items, rates, coupon?.discount || 0)
      setCart(mapped)
      persist(mapped)
      return mapped
    },
    [rates, coupon?.discount, persist],
  )

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      totalCount: cart.totalCount,
      grandTotal: quote?.totals?.grandTotal ?? 0,
      itemsTotal: quote?.totals?.itemsTotal ?? cart.itemsTotal,
      deliveryCharge: quote?.totals?.deliveryCharge ?? 0,
      handlingCharge: quote?.totals?.handlingCharge ?? 0,
      quote,
      quoteLoading,
      quoteError,
      refreshDeliveryQuote,
      smallCartCharge: cart.smallCartCharge,
      discount: cart.discount,
      deliveryOption: rates.option || deliveryOption,
      setDeliveryOption: (next) => {
        setDeliveryOption(next)
        setRates((current) => ({ ...current, option: next }))
      },
      deliveryConfig: rates.delivery || DEFAULT_DELIVERY,
      setDeliveryConfig: (next) => {
        setRates((current) => ({ ...current, delivery: mergeDeliveryConfig(next) }))
      },
      pinDelivery: selectedAddress?.delivery
        || (selectedAddress
          ? {
              serviceable: selectedAddress.serviceable !== false,
              morning: {
                enabled: selectedAddress.serviceable !== false,
                comingSoon: selectedAddress.serviceable === false,
              },
              express: { enabled: false, comingSoon: true },
              defaultOption: selectedAddress.serviceable !== false ? 'morning' : null,
            }
          : null),
      coupon,
      couponError,
      couponLoading,
      applyCoupon,
      removeCoupon,
      loading,
      hydrated,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setCart: assignCart,
    }),
    [
      cart,
      quote,
      quoteLoading,
      quoteError,
      refreshDeliveryQuote,
      rates,
      deliveryOption,
      selectedAddress,
      coupon,
      couponError,
      couponLoading,
      applyCoupon,
      removeCoupon,
      loading,
      hydrated,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      assignCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
