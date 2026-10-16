import React, { useEffect, useMemo, useState } from 'react'
import { ApiClient, useNotice, useRecord } from 'adminjs'
import { LocalSelect, SearchableSelect, useAnchoredMenu } from './form-controls'
import { getFulfillmentBadge, getPaymentBadge } from './order-list-badges.jsx'

const api = new ApiClient()

const FULFILLMENT = [
  { value: 'pending', label: 'Waiting for fulfillment' },
  { value: 'paid', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

function CopyId({ label, value, href }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <div className="tokri-order-rzp-row">
      <span>{label}</span>
      <code>{value}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value)?.then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          }).catch(() => {})
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          Open in Razorpay
        </a>
      ) : null}
    </div>
  )
}

function deliveryChoiceLabel(option) {
  if (option === 'express') return 'Express'
  if (option === 'morning') return 'Morning'
  return ''
}

function formatExpectedDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

const formatMoney = (value) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '₹0'
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const resolveImage = (value) => {
  if (!value) return ''
  if (/^(https?:|data:|blob:)/.test(value)) return value
  if (value.startsWith('/')) return `${window.location.origin}${value}`
  return value
}

function MoreMenu({ unpaid, canSyncRazorpay, busy, onCash, onQr, onSyncRazorpay, onResendPartner }) {
  const [open, setOpen] = useState(false)
  const { wrapRef, openUp } = useAnchoredMenu(open)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  return (
    <div className="tokri-order-more" ref={wrapRef}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        More actions
        <span>{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-order-more-menu${openUp ? ' is-up' : ''}`}>
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => {
              setOpen(false)
              onResendPartner()
            }}
          >
            {busy === 'resendPartnerWhatsapp' ? 'Sending…' : 'Resend message to delivery partner'}
          </button>
          {unpaid ? (
            <>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => {
                  setOpen(false)
                  onCash()
                }}
              >
                {busy === 'collectCash' ? 'Saving…' : 'Mark cash collected'}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => {
                  setOpen(false)
                  onQr()
                }}
              >
                {busy === 'generateQr' ? 'Creating…' : 'Generate payment QR'}
              </button>
            </>
          ) : null}
          {canSyncRazorpay ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => {
                setOpen(false)
                onSyncRazorpay()
              }}
            >
              {busy === 'syncRazorpay' ? 'Checking Razorpay…' : 'Sync Razorpay payment'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function snapshot(params = {}) {
  return {
    status: params.status || '',
    paymentStatus: params.paymentStatus || '',
    deliveryPartnerId: params.deliveryPartnerId || '',
    contactName: params.contactName || '',
    contactPhone: params.contactPhone || '',
    addressLine1: params.addressLine1 || '',
    addressLine2: params.addressLine2 || '',
    addressCity: params.addressCity || '',
    addressState: params.addressState || '',
    addressPincode: params.addressPincode || '',
    addressLandmark: params.addressLandmark || '',
  }
}

const OrderDetail = (props) => {
  const { record: initialRecord, resource, action } = props
  const addNotice = useNotice()
  const { record, handleChange, submit, loading, setRecord } = useRecord(initialRecord, resource.id)
  const params = record?.params || {}
  const [saving, setSaving] = useState(false)
  const [actionBusy, setActionBusy] = useState('')
  const [partners, setPartners] = useState([{ value: '', label: 'Unassigned' }])
  const [baseline, setBaseline] = useState(() => snapshot(initialRecord?.params))
  const [editContact, setEditContact] = useState(false)
  const [editAddress, setEditAddress] = useState(false)

  useEffect(() => {
    if (action?.name !== 'show') return undefined
    const next = window.location.pathname.replace(/\/show\/?$/, '/edit')
    if (next !== window.location.pathname) window.location.replace(next)
    return undefined
  }, [action?.name])

  useEffect(() => {
    let ignore = false
    api
      .resourceAction({ resourceId: 'DeliveryPartner', actionName: 'list', params: { perPage: 200 } })
      .then((response) => {
        if (ignore) return
        const records = response.data?.records || []
        setPartners([
          { value: '', label: 'Unassigned' },
          ...records.map((item) => ({
            value: item.id || item.params?.id,
            label: item.params?.isActive === false
              ? `${item.params?.name || 'Partner'} (inactive)`
              : item.params?.name || 'Partner',
          })),
        ])
      })
      .catch(() => {
        if (!ignore) setPartners([{ value: '', label: 'Unassigned' }])
      })
    return () => {
      ignore = true
    }
  }, [])

  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(params.itemsJson || '[]')
      return parsed.map((item) => ({ ...item, image: resolveImage(item.image) }))
    } catch {
      return []
    }
  }, [params.itemsJson])

  const current = snapshot(params)
  const dirty = Object.keys(current).some((key) => current[key] !== baseline[key])
  const listUrl = window.location.pathname.replace(/\/records\/.*$/, '')
  const unpaid = params.paymentStatus !== 'paid'
  const canSyncRazorpay = unpaid && params.paymentMode === 'online'

  useEffect(() => {
    if (!canSyncRazorpay || !record?.id) return undefined
    let ignore = false
    api
      .recordAction({
        resourceId: resource.id,
        recordId: record.id,
        actionName: 'syncRazorpay',
      })
      .then((response) => {
        if (ignore) return
        if (response.data?.record) {
          setRecord(response.data.record)
          setBaseline(snapshot(response.data.record.params))
        }
        const notice = response.data?.notice
        if (notice?.type === 'success') addNotice(notice)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [canSyncRazorpay, record?.id, resource.id, setRecord])

  const handleSave = async (event) => {
    event.preventDefault()
    const phone = String(params.contactPhone || '').replace(/\D/g, '')
    const pin = String(params.addressPincode || '').replace(/\D/g, '')
    if (!String(params.contactName || '').trim() || phone.length < 10) {
      addNotice({ message: 'Enter the customer name and a 10-digit contact number.', type: 'error' })
      return
    }
    if (!String(params.addressLine1 || '').trim() || !String(params.addressCity || '').trim() || !String(params.addressState || '').trim() || pin.length !== 6) {
      addNotice({ message: 'Enter the house, city, state, and a 6-digit pincode.', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const response = await submit()
      const next = response?.data?.record?.params
      if (next) {
        setBaseline(snapshot(next))
        setEditContact(false)
        setEditAddress(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const runPaymentAction = async (actionName) => {
    if (actionName === 'collectCash' && !window.confirm('Mark this order as paid in cash?')) return
    setActionBusy(actionName)
    try {
      const response = await api.recordAction({
        resourceId: resource.id,
        recordId: record.id,
        actionName,
      })
      if (response.data?.record) {
        setRecord(response.data.record)
        setBaseline(snapshot(response.data.record.params))
      }
      addNotice(response.data?.notice || { message: 'Updated.', type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not complete this action.', type: 'error' })
    } finally {
      setActionBusy('')
    }
  }

  if (action?.name === 'show') return null

  const fulfillment = getFulfillmentBadge(params.status)
  const payment = getPaymentBadge(params)
  const statusLabel = fulfillment.label
  const restoreFields = (keys, close) => {
    keys.forEach((key) => handleChange(key, baseline[key] || ''))
    close(false)
  }
  const addressText = [
    params.addressLine1,
    params.addressLine2,
    [params.addressCity, params.addressState, params.addressPincode].filter(Boolean).join(', '),
    params.addressLandmark ? `Landmark: ${params.addressLandmark}` : '',
  ].filter(Boolean)
  const paymentLabel = payment.label
  const partnerName = params.deliveryPartnerName
    ? `${params.deliveryPartnerName}${params.deliveryPartnerPhone ? ` · ${params.deliveryPartnerPhone}` : ''}`
    : 'No delivery partner yet'
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const deliveryName = deliveryChoiceLabel(params.deliveryOption)
  const expectedDelivery = formatExpectedDate(params.expectedDeliveryDate)

  return (
    <form className="tokri-order" onSubmit={handleSave}>
      <header className="tokri-order-top">
        <div className="tokri-order-title">
          <a className="tokri-order-back" href={listUrl} aria-label="Back to orders">←</a>
          <div>
            <div className="tokri-order-title-row">
              <h2>#{params.orderNo}</h2>
              <span className={`tokri-order-pill is-${payment.tone}`}>{paymentLabel}</span>
              <span className={`tokri-order-pill is-${fulfillment.tone}`}>{statusLabel}</span>
            </div>
            <p>{formatDateTime(params.createdAt)}</p>
          </div>
        </div>
        <div className="tokri-order-actions">
          <a
            className="tokri-order-invoice"
            href={`/tokri-backoffice/orders/${record.id}/invoice?download=1`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download PDF invoice"
          >
            Download Invoice
          </a>
          <button className="tokri-order-save" type="submit" disabled={!dirty || loading || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <MoreMenu
            unpaid={unpaid}
            canSyncRazorpay={canSyncRazorpay}
            busy={actionBusy}
            onCash={() => runPaymentAction('collectCash')}
            onQr={() => runPaymentAction('generateQr')}
            onSyncRazorpay={() => runPaymentAction('syncRazorpay')}
            onResendPartner={() => runPaymentAction('resendPartnerWhatsapp')}
          />
        </div>
      </header>

      <div className="tokri-order-layout">
        <div className="tokri-order-main">
          <section className="tokri-order-card">
            <div className="tokri-order-card-head">
              <span className={`tokri-order-mark is-${fulfillment.tone}`} />
              <div>
                <strong>{statusLabel}</strong>
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} · {partnerName}</span>
              </div>
              <div className="tokri-order-select">
                <LocalSelect
                  value={params.status || 'pending'}
                  options={FULFILLMENT}
                  onChange={(value) => handleChange('status', value)}
                />
              </div>
            </div>
            {items.length === 0 ? (
              <p className="tokri-order-empty">No items on this order.</p>
            ) : (
              <div className="tokri-order-items">
                {items.map((item) => (
                  <article key={item.id}>
                    <div className="tokri-order-thumb-wrap">
                      {item.image ? <img src={item.image} alt="" /> : <span className="tokri-order-thumb" />}
                      <em>{item.quantity}</em>
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      {item.weight ? <span>{item.weight}</span> : null}
                    </div>
                    <span className="tokri-order-qty">{formatMoney(item.priceValue)} × {item.quantity}</span>
                    <b>{formatMoney(item.lineTotal)}</b>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="tokri-order-card">
            <div className="tokri-order-card-head">
              <span className={`tokri-order-mark is-${payment.tone}`} />
              <div>
                <strong>{paymentLabel}</strong>
                <span>{params.paymentMethod || 'Cash on delivery'}</span>
              </div>
              <div className="tokri-order-select">
                <LocalSelect
                  value={params.paymentStatus || 'pending'}
                  options={PAYMENT_OPTIONS}
                  onChange={(value) => handleChange('paymentStatus', value)}
                />
              </div>
            </div>
            <dl className="tokri-order-totals">
              <div><dt>Subtotal</dt><dd>{itemCount} {itemCount === 1 ? 'item' : 'items'}</dd><dd>{formatMoney(params.itemsTotal)}</dd></div>
              <div>
                <dt>Delivery{deliveryName ? ` - ${deliveryName}` : ''}</dt>
                <dd>{expectedDelivery ? `Expected ${expectedDelivery}` : ''}</dd>
                <dd>{params.freeDeliveryApplied || Number(params.deliveryCharge) === 0 ? 'Free (Welcome offer)' : formatMoney(params.deliveryCharge)}</dd>
              </div>
              <div><dt>Handling</dt><dd /><dd>{formatMoney(params.handlingCharge)}</dd></div>
              {Number(params.taxTotal) > 0 ? (
                <div>
                  <dt>Taxes (GST){params.isInterState ? ' · IGST' : ' · CGST+SGST'}</dt>
                  <dd />
                  <dd>{formatMoney(params.taxTotal)}</dd>
                </div>
              ) : null}
              {Number(params.smallCartCharge) > 0 ? (
                <div><dt>Small cart</dt><dd /><dd>{formatMoney(params.smallCartCharge)}</dd></div>
              ) : null}
              {Number(params.discount) > 0 ? (
                <div><dt>Discount{params.couponCode ? ` · ${params.couponCode}` : ''}</dt><dd /><dd>-{formatMoney(params.discount)}</dd></div>
              ) : null}
              <div className="is-total"><dt>Total</dt><dd /><dd>{formatMoney(params.grandTotal)}</dd></div>
            </dl>
            <div className="tokri-order-collected">
              <span>{params.paymentStatus === 'paid' ? 'Paid by customer' : 'Still to collect'}</span>
              <b>{formatMoney(params.grandTotal)}</b>
            </div>
            {params.paymentCollectedAs ? <p className="tokri-order-meta">Collected as {params.paymentCollectedAs}</p> : null}
            {params.paymentMode === 'online' || params.razorpayPaymentId || params.razorpayOrderId ? (
              <div className="tokri-order-rzp">
                <CopyId
                  label="Payment ID"
                  value={params.razorpayPaymentId}
                  href={params.razorpayPaymentId
                    ? `https://dashboard.razorpay.com/app/payments/${encodeURIComponent(params.razorpayPaymentId)}`
                    : ''}
                />
                <CopyId
                  label="Razorpay order"
                  value={params.razorpayOrderId}
                  href={params.razorpayOrderId
                    ? `https://dashboard.razorpay.com/app/orders/${encodeURIComponent(params.razorpayOrderId)}`
                    : ''}
                />
                {!params.razorpayPaymentId ? (
                  <p className="tokri-order-meta">No Razorpay payment ID yet. Use Sync Razorpay payment if money was captured.</p>
                ) : null}
              </div>
            ) : null}
            {params.razorpayQrUrl ? (
              <img className="tokri-order-qr" src={params.razorpayQrUrl} alt="Doorstep payment QR" />
            ) : null}
          </section>
        </div>

        <aside className="tokri-order-side">
          <section className="tokri-order-card">
            <div className="tokri-order-section-head">
              <h3>Customer</h3>
            </div>
            <div className="tokri-order-section-head">
              <h4>Contact</h4>
              {editContact ? (
                <button
                  type="button"
                  className="tokri-order-edit"
                  onClick={() => restoreFields(['contactName', 'contactPhone'], setEditContact)}
                >
                  Cancel
                </button>
              ) : (
                <button type="button" className="tokri-order-edit" onClick={() => setEditContact(true)}>
                  Edit
                </button>
              )}
            </div>
            {editContact ? (
              <div className="tokri-order-edit-fields">
                <label className="tokri-order-field">
                  Name
                  <input
                    className="tokri-order-input"
                    value={params.contactName || ''}
                    onChange={(event) => handleChange('contactName', event.target.value)}
                  />
                </label>
                <label className="tokri-order-field">
                  Phone number
                  <input
                    className="tokri-order-input"
                    inputMode="numeric"
                    value={params.contactPhone || ''}
                    onChange={(event) => handleChange('contactPhone', event.target.value)}
                  />
                </label>
              </div>
            ) : (
              <div className="tokri-order-read">
                <strong>{params.contactName || '—'}</strong>
                <p>{params.contactPhone ? `+91 ${params.contactPhone}` : '—'}</p>
              </div>
            )}

            <div className="tokri-order-section-head">
              <h4>Shipping address</h4>
              {editAddress ? (
                <button
                  type="button"
                  className="tokri-order-edit"
                  onClick={() => restoreFields(
                    ['addressLine1', 'addressLine2', 'addressCity', 'addressState', 'addressPincode', 'addressLandmark'],
                    setEditAddress,
                  )}
                >
                  Cancel
                </button>
              ) : (
                <button type="button" className="tokri-order-edit" onClick={() => setEditAddress(true)}>
                  Edit
                </button>
              )}
            </div>
            {editAddress ? (
              <div className="tokri-order-edit-fields">
                <label className="tokri-order-field">
                  House / flat
                  <input
                    className="tokri-order-input"
                    value={params.addressLine1 || ''}
                    onChange={(event) => handleChange('addressLine1', event.target.value)}
                  />
                </label>
                <label className="tokri-order-field">
                  Street / area
                  <input
                    className="tokri-order-input"
                    value={params.addressLine2 || ''}
                    onChange={(event) => handleChange('addressLine2', event.target.value)}
                  />
                </label>
                <div className="tokri-order-address-grid">
                  <label className="tokri-order-field">
                    City
                    <input
                      className="tokri-order-input"
                      value={params.addressCity || ''}
                      onChange={(event) => handleChange('addressCity', event.target.value)}
                    />
                  </label>
                  <label className="tokri-order-field">
                    State
                    <input
                      className="tokri-order-input"
                      value={params.addressState || ''}
                      onChange={(event) => handleChange('addressState', event.target.value)}
                    />
                  </label>
                  <label className="tokri-order-field">
                    Pincode
                    <input
                      className="tokri-order-input"
                      inputMode="numeric"
                      value={params.addressPincode || ''}
                      onChange={(event) => handleChange('addressPincode', event.target.value)}
                    />
                  </label>
                  <label className="tokri-order-field">
                    Landmark
                    <input
                      className="tokri-order-input"
                      value={params.addressLandmark || ''}
                      onChange={(event) => handleChange('addressLandmark', event.target.value)}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="tokri-order-read">
                {addressText.length ? addressText.map((line) => <p key={line}>{line}</p>) : <p>—</p>}
              </div>
            )}
            <h4>Delivery partner</h4>
            <SearchableSelect
              value={params.deliveryPartnerId || ''}
              options={partners}
              onChange={(value) => handleChange('deliveryPartnerId', value)}
              placeholder="Unassigned"
              searchPlaceholder="Search partners"
            />
          </section>
        </aside>
      </div>
    </form>
  )
}

export default OrderDetail
