import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useAddress } from './AddressContext'
import { authDelete, authGet, authPost, authPut, fetchJson, PLACEHOLDER_IMAGE, postJson } from '../lib/api'
import {
  DEFAULT_DELIVERY,
  defaultOptionForAddress,
  mergeDeliveryConfig,
} from '../lib/delivery'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'tokri_cart_v1'

const parsePrice = (price) => {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ''))
  return Number.isNaN(numeric) ? 0 : numeric
}

function categorySlugFrom(product) {
  if (!product) return null
  if (Array.isArray(product.categories) && product.categories.length) {
    const first = product.categories[0]
    return typeof first === 'string' ? first : first.slug || first.id || null
  }
  if (typeof product.category === 'string') return product.category
  return product.category?.slug || product.category?.id || product.categoryId || product.categorySlug || null
}

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (!item?.id || !item?.name) return null
        const quantity = Math.max(1, Number(item.quantity) || 1)
        const priceValue = Number(item.priceValue) || parsePrice(item.price)
        const oldPriceValue = Number(item.oldPriceValue) || parsePrice(item.oldPrice)
        return {
          id: String(item.id),
          name: String(item.name),
          price: item.price || `₹${priceValue}`,
          priceValue,
          oldPrice: item.oldPrice || (oldPriceValue > priceValue ? `₹${oldPriceValue}` : null),
          oldPriceValue: oldPriceValue > priceValue ? oldPriceValue : 0,
          image: item.image || PLACEHOLDER_IMAGE,
          weight: item.weight || '250 g',
          quantity,
          categorySlug: item.categorySlug || null,
          categories: Array.isArray(item.categories) ? item.categories : [],
          isTaxable: item.isTaxable !== undefined ? Boolean(item.isTaxable) : false,
          gstRate: Number(item.gstRate ?? 0),
          hsnCode: item.hsnCode || '0808',
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function mapServerCartItem(item) {
  const slug = String(item?.slug || item?.id || '').trim()
  if (!slug || !item?.name) return null
  const priceValue = Number(item.priceValue) || parsePrice(item.price)
  const oldPriceValue = Number(item.oldPriceValue) || parsePrice(item.oldPrice)
  return {
    id: slug,
    name: String(item.name),
    price: item.price || `₹${priceValue}`,
    priceValue,
    oldPrice: item.oldPrice || (oldPriceValue > priceValue ? `₹${oldPriceValue}` : null),
    oldPriceValue: oldPriceValue > priceValue ? oldPriceValue : 0,
    image: item.image || PLACEHOLDER_IMAGE,
    weight: item.weight || '250 g',
    quantity: Math.max(1, Number(item.quantity) || 1),
    categorySlug: item.category?.slug || item.categorySlug || null,
    categories: Array.isArray(item.categories) ? item.categories : [],
    isTaxable: item.isTaxable !== undefined ? Boolean(item.isTaxable) : false,
    gstRate: Number(item.gstRate ?? 0),
    hsnCode: item.hsnCode || '0808',
  }
}

function toServerCartItems(items) {
  return items.map((item) => ({ slug: item.id, quantity: item.quantity }))
}

export function CartProvider({ children }) {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const { selectedAddress } = useAddress()
  const [cartItems, setCartItems] = useState(readStoredCart)
  const [showDrawer, setShowDrawer] = useState(false)
  const [deliveryConfig, setDeliveryConfig] = useState(DEFAULT_DELIVERY)
  const [deliveryOption, setDeliveryOption] = useState('morning')
  const [freeDelivery, setFreeDelivery] = useState(null)
  const [quoteState, setQuoteState] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const cartItemsRef = useRef(cartItems)
  cartItemsRef.current = cartItems
  const skipServerPush = useRef(true)
  const wasGuest = useRef(!isLoggedIn)

  const refreshFreeDelivery = useCallback(async () => {
    if (isLoggedIn && user?.token) {
      try {
        const [bootstrapData, authData] = await Promise.all([
          authGet('/app/bootstrap', user).catch(() => null),
          refreshUser ? refreshUser() : null,
        ])
        if (bootstrapData?.freeDelivery) {
          setFreeDelivery(bootstrapData.freeDelivery)
        } else if (authData?.freeDelivery) {
          setFreeDelivery(authData.freeDelivery)
        }
      } catch (e) {
        console.error('refreshFreeDelivery failed:', e)
      }
    }
  }, [isLoggedIn, user, refreshUser])

  useEffect(() => {
    try {
      if (!cartItems.length) localStorage.removeItem(CART_STORAGE_KEY)
      else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // Private mode / quota — cart still works for this session.
    }
  }, [cartItems])

  useEffect(() => {
    if (!isLoggedIn || !user?.token) {
      wasGuest.current = true
      skipServerPush.current = false
      return undefined
    }

    let ignore = false
    skipServerPush.current = true
    authGet('/account/cart', user)
      .then(async (data) => {
        if (ignore) return
        const serverItems = (data.cart?.items || []).map(mapServerCartItem).filter(Boolean)
        const localItems = cartItemsRef.current
        if (wasGuest.current && !serverItems.length && localItems.length) {
          await authPut('/account/cart', user, { items: toServerCartItems(localItems) }).catch(() => {})
        } else {
          setCartItems(serverItems)
        }
        wasGuest.current = false
      })
      .catch(() => {
        wasGuest.current = false
      })
      .finally(() => {
        window.setTimeout(() => {
          skipServerPush.current = false
        }, 0)
      })

    return () => {
      ignore = true
    }
  }, [isLoggedIn, user?.id, user?.token])

  useEffect(() => {
    if (!isLoggedIn || !user?.token || skipServerPush.current) return undefined
    const timer = window.setTimeout(() => {
      authPut('/account/cart', user, { items: toServerCartItems(cartItems) }).catch(() => {})
    }, 400)
    return () => window.clearTimeout(timer)
  }, [cartItems, isLoggedIn, user])

  // Hydrate tax data for cart items if missing (e.g. from older localStorage)
  useEffect(() => {
    const missingTax = cartItems.some((item) => item.isTaxable === undefined || item.gstRate === undefined)
    if (missingTax && cartItems.length > 0) {
      let isMounted = true
      Promise.all(
        cartItems.map(async (item) => {
          if (item.isTaxable !== undefined && item.gstRate !== undefined) return item
          try {
            const p = await fetchJson(`/products/${item.id}`)
            if (p) {
              return {
                ...item,
                isTaxable: Boolean(p.isTaxable),
                gstRate: Number(p.gstRate ?? 0),
                hsnCode: p.hsnCode || item.hsnCode || '0808',
              }
            }
          } catch {
            // fallback
          }
          return item
        }),
      ).then((hydrated) => {
        if (isMounted) setCartItems(hydrated)
      })
      return () => {
        isMounted = false
      }
    }
  }, [cartItems])

  useEffect(() => {
    let ignore = false
    const loadBootstrap = async () => {
      try {
        const data = isLoggedIn && user?.token
          ? await authGet('/app/bootstrap', user)
          : await fetchJson('/app/bootstrap')
        if (ignore || !data?.charges) return
        if (data.charges.delivery || data.settings?.charges?.delivery) {
          setDeliveryConfig(mergeDeliveryConfig(data.charges.delivery || data.settings.charges.delivery))
        }
        if (data.freeDelivery) {
          setFreeDelivery(data.freeDelivery)
        }
      } catch {
        if (isLoggedIn) {
          fetchJson('/app/bootstrap')
            .then((data) => {
              if (ignore || !data?.charges) return
              if (data.freeDelivery) setFreeDelivery(data.freeDelivery)
            })
            .catch(() => {})
        }
      }
    }
    loadBootstrap()
    return () => {
      ignore = true
    }
  }, [user?.id, user?.token, isLoggedIn])

  useEffect(() => {
    setDeliveryOption(defaultOptionForAddress(selectedAddress))
  }, [selectedAddress?.id, selectedAddress?.delivery?.defaultOption])

  const addItem = (product) => {
    const priceValue = parsePrice(product.price ?? product.priceValue)
    const oldPriceValue = parsePrice(product.oldPriceValue ?? product.oldPrice)
    const oldPrice = product.oldPrice || (oldPriceValue > priceValue ? `₹${oldPriceValue}` : null)
    const isTaxable = Boolean(product.isTaxable)
    const gstRate = Number(product.gstRate ?? 0)
    const hsnCode = product.hsnCode || '0808'
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                oldPriceValue: item.oldPriceValue || (oldPriceValue > priceValue ? oldPriceValue : 0),
                oldPrice: item.oldPrice || oldPrice,
                isTaxable,
                gstRate,
                hsnCode,
              }
            : item,
        )
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          priceValue,
          oldPrice,
          oldPriceValue: oldPriceValue > priceValue ? oldPriceValue : 0,
          image: product.image || PLACEHOLDER_IMAGE,
          weight: product.weight || '250 g',
          quantity: 1,
          categorySlug: categorySlugFrom(product),
          categories: Array.isArray(product.categories) ? product.categories : [],
          isTaxable,
          gstRate,
          hsnCode,
        },
      ]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (productId) => {
    setCartItems((items) => items.filter((item) => item.id !== productId))
  }

  const clearCart = useCallback(() => {
    skipServerPush.current = true
    setCartItems([])
    setCoupon(null)
    setCouponError('')
    if (isLoggedIn && user?.token) {
      authDelete('/account/cart', user).catch(() => {})
    }
    window.setTimeout(() => {
      skipServerPush.current = false
    }, 500)
  }, [isLoggedIn, user])

  const getItemQuantity = (productId) => {
    const found = cartItems.find((item) => item.id === productId)
    return found ? found.quantity : 0
  }

  const openDrawer = () => setShowDrawer(true)
  const closeDrawer = () => setShowDrawer(false)

  const totalCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const localItemsTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0),
    [cartItems],
  )

  const hasItems = cartItems.length > 0
  const pinDelivery = selectedAddress?.delivery
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
      : null)
  const activeOption =
    pinDelivery && !pinDelivery[deliveryOption]?.enabled
      ? defaultOptionForAddress(selectedAddress)
      : deliveryOption
  const discount = coupon?.discount ? Number(coupon.discount) : 0
  const quoteKey = JSON.stringify({
    items: cartItems.map((item) => [item.id, item.quantity]),
    option: activeOption,
    discount,
    customer: isLoggedIn ? user?.id : null,
  })
  const quote = quoteState?.key === quoteKey ? quoteState.data : null
  const quoteLoading = hasItems && !quote
  const itemsTotal = quote?.totals?.itemsTotal ?? localItemsTotal

  useEffect(() => {
    if (!hasItems) return undefined
    let ignore = false
    const payload = {
      items: cartItems.map((item) => ({ slug: item.id, quantity: item.quantity })),
      deliveryOption: activeOption,
      discount,
    }
    const request = isLoggedIn && user?.token
      ? authPost('/checkout/quote', user, payload)
      : postJson('/checkout/quote', payload)
    request.then((data) => {
      if (ignore) return
      setQuoteState({ key: quoteKey, data })
      setQuoteError('')
    }).catch((error) => {
      if (!ignore) setQuoteError(error.message || 'Could not calculate delivery charges.')
    })
    return () => { ignore = true }
  }, [quoteKey, user?.token])

  const refreshDeliveryQuote = useCallback(async () => {
    if (!hasItems) return null
    const payload = {
      items: cartItems.map((item) => ({ slug: item.id, quantity: item.quantity })),
      deliveryOption: activeOption,
      discount,
    }
    try {
      const data = isLoggedIn && user?.token
        ? await authPost('/checkout/quote', user, payload)
        : await postJson('/checkout/quote', payload)
      setQuoteState({ key: quoteKey, data })
      setQuoteError('')
      return data
    } catch (error) {
      setQuoteError(error.message || 'Could not calculate delivery charges.')
      throw error
    }
  }, [activeOption, cartItems, discount, hasItems, isLoggedIn, quoteKey, user])

  const activeFreeDelivery = freeDelivery || user?.freeDelivery
  const deliveryCharge = quote?.totals?.deliveryCharge ?? 0
  const handlingCharge = quote?.totals?.handlingCharge ?? 0
  const taxTotal = quote?.totals?.taxTotal ?? 0
  const grandTotal = quote?.totals?.grandTotal ?? 0

  const previewPayload = useCallback(
    () => ({
      code: coupon?.code,
      items: cartItems.map((item) => ({ slug: item.id, quantity: item.quantity })),
      deliveryOption: activeOption,
    }),
    [activeOption, cartItems, coupon?.code],
  )

  const applyCoupon = useCallback(
    async (rawCode) => {
      const code = String(rawCode || '').trim().toUpperCase()
      if (!code) {
        setCouponError('Enter a coupon code')
        return null
      }
      if (!cartItems.length) {
        setCouponError('Add items to your cart first')
        return null
      }

      setCouponLoading(true)
      setCouponError('')
      try {
        const body = {
          code,
          items: cartItems.map((item) => ({ slug: item.id, quantity: item.quantity })),
          deliveryOption: activeOption,
        }
        const data = isLoggedIn
          ? await authPost('/checkout/preview-coupon', user, body)
          : await postJson('/checkout/preview-coupon', body)
        setCoupon(data.coupon)
        return data.coupon
      } catch (error) {
        setCoupon(null)
        setCouponError(error.message || 'This coupon could not be applied')
        throw error
      } finally {
        setCouponLoading(false)
      }
    },
    [activeOption, cartItems, isLoggedIn, user],
  )

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setCouponError('')
  }, [])

  useEffect(() => {
    if (!coupon?.code) return undefined
    if (!cartItems.length) {
      setCoupon(null)
      return undefined
    }

    let ignore = false
    const body = previewPayload()
    const request = isLoggedIn
      ? authPost('/checkout/preview-coupon', user, body)
      : postJson('/checkout/preview-coupon', body)

    request
      .then((data) => {
        if (!ignore) setCoupon(data.coupon)
      })
      .catch((error) => {
        if (ignore) return
        setCoupon(null)
        setCouponError(error.message || 'Coupon is no longer valid for this cart')
      })

    return () => {
      ignore = true
    }
  }, [activeOption, cartItems, coupon?.code, isLoggedIn, previewPayload, user])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
        totalCount,
        itemsTotal,
        taxTotal,
        deliveryCharge,
        handlingCharge,
        discount,
        grandTotal,
        quote,
        quoteLoading,
        quoteError,
        refreshDeliveryQuote,
        deliveryOption: activeOption,
        setDeliveryOption,
        deliveryConfig,
        setDeliveryConfig,
        pinDelivery,
        coupon,
        couponError,
        couponLoading,
        applyCoupon,
        removeCoupon,
        showDrawer,
        openDrawer,
        closeDrawer,
        freeDelivery: activeFreeDelivery,
        refreshFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
