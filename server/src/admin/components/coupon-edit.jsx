import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

function parseSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parseSlugs(parsed)
    } catch {
      // ignore
    }
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function pad(num) {
  return String(num).padStart(2, '0')
}

function toDatetimeValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDatetimeLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function useAnchoredMenu(open) {
  const wrapRef = useRef(null)
  const [openUp, setOpenUp] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const update = () => {
      const node = wrapRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 240 && rect.top > spaceBelow)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  return { wrapRef, openUp }
}

function ChoiceCard({ selected, title, hint, onClick }) {
  return (
    <button
      type="button"
      className={`tokri-choice-card${selected ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{hint}</span>
    </button>
  )
}

function AnchoredSelect({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const { wrapRef, openUp } = useAnchoredMenu(open)
  const selected = options.find((item) => item.value === value)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  return (
    <div className="tokri-multiselect" ref={wrapRef}>
      <button type="button" className="tokri-multiselect-control" onClick={() => setOpen((current) => !current)}>
        <span>{selected?.label || placeholder}</span>
        <span className="tokri-multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-multiselect-menu${openUp ? ' is-up' : ''}`}>
          {options.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`tokri-multiselect-option${item.value === value ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(item.value)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SearchableMultiSelect({ options, selected, onChange, placeholder, searchPlaceholder }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { wrapRef, openUp } = useAnchoredMenu(open)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const selectedOptions = options.filter((item) => selectedSet.has(item.value))
  const filtered = options.filter((item) =>
    `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const toggle = (value) => {
    if (selectedSet.has(value)) onChange(selected.filter((item) => item !== value))
    else onChange([...selected, value])
  }

  return (
    <div className="tokri-multiselect" ref={wrapRef}>
      <button type="button" className="tokri-multiselect-control" onClick={() => setOpen((value) => !value)}>
        {selectedOptions.length ? (
          <span className="tokri-multiselect-chips">
            {selectedOptions.map((item) => (
              <span key={item.value} className="tokri-multiselect-chip">
                {item.label}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggle(item.value)
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </span>
        ) : (
          <span className="tokri-multiselect-placeholder">{placeholder}</span>
        )}
        <span className="tokri-multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-multiselect-menu${openUp ? ' is-up' : ''}`}>
          <input
            className="tokri-coupon-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="tokri-multiselect-list">
            {filtered.length ? (
              filtered.map((item) => {
                const checked = selectedSet.has(item.value)
                return (
                  <label key={item.value} className={`tokri-multiselect-option${checked ? ' is-selected' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(item.value)} />
                    <span>{item.label}</span>
                  </label>
                )
              })
            ) : (
              <div className="tokri-multiselect-empty">No matches</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DateTimePicker({ value, onChange, placeholder }) {
  const parsed = value ? new Date(value) : null
  const valid = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
  const [open, setOpen] = useState(false)
  const [monthDate, setMonthDate] = useState(valid || new Date())
  const [hours, setHours] = useState(valid ? pad(valid.getHours()) : '00')
  const [minutes, setMinutes] = useState(valid ? pad(valid.getMinutes()) : '00')
  const { wrapRef, openUp } = useAnchoredMenu(open)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  useEffect(() => {
    if (!valid) return
    setMonthDate(valid)
    setHours(pad(valid.getHours()))
    setMinutes(pad(valid.getMinutes()))
  }, [value])

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i += 1) cells.push(null)
  for (let day = 1; day <= totalDays; day += 1) cells.push(day)

  const apply = (day, nextHours = hours, nextMinutes = minutes) => {
    const next = `${year}-${pad(month + 1)}-${pad(day)}T${pad(Number(nextHours) || 0)}:${pad(Number(nextMinutes) || 0)}`
    onChange(next)
  }

  const selectedDay =
    valid && valid.getFullYear() === year && valid.getMonth() === month ? valid.getDate() : null

  return (
    <div className="tokri-datepicker" ref={wrapRef}>
      <button type="button" className="tokri-datepicker-control" onClick={() => setOpen((current) => !current)}>
        <span>{valid ? formatDatetimeLabel(valid) : placeholder}</span>
        <span>📅</span>
      </button>
      {open ? (
        <div className={`tokri-datepicker-pop${openUp ? ' is-up' : ''}`}>
          <div className="tokri-datepicker-nav">
            <button type="button" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>
              ‹
            </button>
            <strong>
              {monthDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </strong>
            <button type="button" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>
              ›
            </button>
          </div>
          <div className="tokri-datepicker-week">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="tokri-datepicker-grid">
            {cells.map((day, index) =>
              day ? (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  className={selectedDay === day ? 'is-selected' : ''}
                  onClick={() => apply(day)}
                >
                  {day}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>
          <div className="tokri-datepicker-time">
            <label>
              Hour
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(event) => {
                  const next = pad(Math.min(23, Math.max(0, Number(event.target.value) || 0)))
                  setHours(next)
                  if (selectedDay) apply(selectedDay, next, minutes)
                }}
              />
            </label>
            <label>
              Minute
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(event) => {
                  const next = pad(Math.min(59, Math.max(0, Number(event.target.value) || 0)))
                  setMinutes(next)
                  if (selectedDay) apply(selectedDay, hours, next)
                }}
              />
            </label>
            <button
              type="button"
              className="tokri-datepicker-clear"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const CouponEdit = (props) => {
  const { record: initialRecord, resource } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const params = record?.params || {}
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const selectedSlugs = parseSlugs(params.targetSlugs)
  const targetType = params.targetType || 'all'
  const applyOn = params.applyOn || 'cart'
  const usageType = params.usageType || 'unlimited'
  const couponType = params.type || 'percent'
  const isActive = params.isActive !== false && params.isActive !== 'false'

  useEffect(() => {
    let ignore = false

    async function loadCatalog() {
      try {
        const categoryData = await fetch(`${apiBaseUrl}/categories`).then((response) => response.json())
        const allProducts = []
        let page = 1
        let hasMore = true
        while (hasMore && page <= 20) {
          const productData = await fetch(`${apiBaseUrl}/products?page=${page}&limit=100`).then((response) =>
            response.json(),
          )
          allProducts.push(...(productData.products || []))
          hasMore = Boolean(productData.hasMore)
          page += 1
        }
        if (ignore) return
        setProducts(allProducts)
        setCategories(Array.isArray(categoryData) ? categoryData : [])
      } catch {
        if (!ignore) {
          setProducts([])
          setCategories([])
        }
      }
    }

    loadCatalog()
    return () => {
      ignore = true
    }
  }, [apiBaseUrl])

  const setField = (key, value) => handleChange(key, value)

  const setSelectedSlugs = (next) => setField('targetSlugs', JSON.stringify(next))

  const productOptions = useMemo(
    () => products.map((item) => ({ value: item.slug, label: item.name })),
    [products],
  )
  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item.slug, label: item.label })),
    [categories],
  )

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({ message: notice.message || 'Could not save coupon', type: 'error' })
          return
        }
        addNotice({ message: 'Coupon saved', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save coupon. Please try again.', type: 'error' })
      })
    return false
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">Create a store coupon</H3>
        <Text color="white">
          Set who gets the discount, where it applies, and how many times it can be used.
        </Text>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Coupon code</h4>
          <p>Customers will type this at checkout on the website and app.</p>
          <input
            className="tokri-coupon-input tokri-coupon-code"
            value={params.code || ''}
            onChange={(event) => setField('code', event.target.value.toUpperCase())}
            placeholder="WELCOME10"
            required
          />
          <label className="tokri-coupon-toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setField('isActive', event.target.checked)}
            />
            Coupon is active
          </label>
        </section>

        <section className="tokri-coupon-card">
          <h4>Discount</h4>
          <label className="tokri-coupon-toggle">
            <input type="checkbox" checked={params.showAtCheckout === true || params.showAtCheckout === 'true'} onChange={(event) => setField('showAtCheckout', event.target.checked)} />
            Show publicly in checkout Available Coupons
          </label>
          <div className="tokri-choice-row">
            <ChoiceCard
              selected={couponType === 'percent'}
              title="Percent off"
              hint="e.g. 10% off"
              onClick={() => setField('type', 'percent')}
            />
            <ChoiceCard
              selected={couponType === 'flat'}
              title="Flat amount"
              hint="e.g. ₹50 off"
              onClick={() => setField('type', 'flat')}
            />
          </div>
          <label className="tokri-coupon-label">
            {couponType === 'percent' ? 'Percent value' : 'Amount (₹)'}
            <input
              className="tokri-coupon-input"
              type="number"
              min="0"
              step="0.01"
              value={params.value ?? ''}
              onChange={(event) => setField('value', event.target.value)}
              required
            />
          </label>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              Min cart (₹)
              <input
                className="tokri-coupon-input"
                type="number"
                min="0"
                step="0.01"
                value={params.minCart ?? ''}
                onChange={(event) => setField('minCart', event.target.value)}
                placeholder="0"
              />
            </label>
            <label className="tokri-coupon-label">
              Max discount (₹)
              <input
                className="tokri-coupon-input"
                type="number"
                min="0"
                step="0.01"
                value={params.maxDiscount ?? ''}
                onChange={(event) => setField('maxDiscount', event.target.value)}
                placeholder="No cap"
              />
            </label>
          </div>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Apply discount on</h4>
        <div className="tokri-choice-row">
          <ChoiceCard
            selected={applyOn === 'cart'}
            title="Cart total"
            hint="Reduce the items subtotal"
            onClick={() => setField('applyOn', 'cart')}
          />
          <ChoiceCard
            selected={applyOn === 'shipping'}
            title="Shipping fee"
            hint="Reduce delivery charges"
            onClick={() => setField('applyOn', 'shipping')}
          />
        </div>
      </section>

      <section className="tokri-coupon-card">
        <h4>Who can get this discount</h4>
        <label className="tokri-coupon-label">
          Apply to
          <AnchoredSelect
            value={targetType}
            placeholder="Choose who this coupon applies to"
            onChange={(next) => {
              setField('targetType', next)
              setSelectedSlugs([])
            }}
            options={[
              { value: 'all', label: 'All products' },
              { value: 'products', label: 'Selected products' },
              { value: 'categories', label: 'Selected categories' },
            ]}
          />
        </label>

        {targetType === 'products' ? (
          <label className="tokri-coupon-label">
            Products
            <SearchableMultiSelect
              options={productOptions}
              selected={selectedSlugs}
              onChange={setSelectedSlugs}
              placeholder="Select products"
              searchPlaceholder="Search products"
            />
          </label>
        ) : null}

        {targetType === 'categories' ? (
          <label className="tokri-coupon-label">
            Categories
            <SearchableMultiSelect
              options={categoryOptions}
              selected={selectedSlugs}
              onChange={setSelectedSlugs}
              placeholder="Select categories"
              searchPlaceholder="Search categories"
            />
          </label>
        ) : null}
      </section>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Usage</h4>
          <div className="tokri-choice-row">
            <ChoiceCard
              selected={usageType === 'unlimited'}
              title="Unlimited"
              hint="Customers can reuse it"
              onClick={() => setField('usageType', 'unlimited')}
            />
            <ChoiceCard
              selected={usageType === 'single'}
              title="Single use"
              hint="One use per customer"
              onClick={() => setField('usageType', 'single')}
            />
          </div>
          {usageType === 'unlimited' ? (
            <label className="tokri-coupon-label">
              Optional global cap
              <input
                className="tokri-coupon-input"
                type="number"
                min="1"
                value={params.usageLimit ?? ''}
                onChange={(event) => setField('usageLimit', event.target.value)}
                placeholder="Leave blank for unlimited"
              />
            </label>
          ) : (
            <Text>Each logged-in customer can use this coupon once.</Text>
          )}
          {params.usedCount ? <Text mt="default">Used {params.usedCount} time(s) so far.</Text> : null}
        </section>

        <section className="tokri-coupon-card">
          <h4>Schedule</h4>
          <label className="tokri-coupon-label">
            Starts at
            <DateTimePicker
              value={toDatetimeValue(params.startsAt)}
              onChange={(next) => setField('startsAt', next || null)}
              placeholder="Select start date and time"
            />
          </label>
          <label className="tokri-coupon-label">
            Expires at
            <DateTimePicker
              value={toDatetimeValue(params.expiresAt)}
              onChange={(next) => setField('expiresAt', next || null)}
              placeholder="Select expiry date and time"
            />
          </label>
        </section>
      </Box>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          Save coupon
        </Button>
      </Box>
    </Box>
  )
}

export default CouponEdit
