import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, H3, Icon, Text } from '@adminjs/design-system'
import { ApiClient } from 'adminjs'

const api = new ApiClient()

function getAdminRoot() {
  const match = window.location.pathname.match(/^(.*)\/resources\//)
  return match ? match[1] : window.location.pathname.replace(/\/$/, '')
}

function formatInr(value) {
  const num = Number(value) || 0
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

export default function CustomerCart({ resource, record }) {
  const params = record?.params || {}
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const adminRoot = useMemo(() => getAdminRoot(), [])

  const fetchCart = useCallback(async () => {
    if (!record?.id) return
    setLoading(true)
    setError('')
    try {
      const response = await api.recordAction({
        resourceId: resource.id,
        recordId: record.id,
        actionName: 'viewCart',
        params: { load: '1' },
      })
      if (response?.data?.cart) {
        setCart(response.data.cart)
      } else {
        setError('Could not load customer cart.')
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load customer cart.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [resource.id, record?.id])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const items = cart?.items || []
  const unavailableItems = cart?.unavailableItems || []
  const totalQuantity = cart?.totalQuantity ?? 0
  const cartTotal = cart?.itemsTotal ?? 0

  return (
    <Box className="tokri-coupon-form">
      <Box
        className="tokri-coupon-hero"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <H3 color="white" style={{ margin: 0 }}>{params.name || 'Customer'}</H3>
          <Text color="white" style={{ marginTop: 4 }}>
            Mobile: {params.phone ? `+91 ${params.phone}` : '—'} · Last updated: {formatDateTime(cart?.updatedAt)}
          </Text>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="tokri-order-invoice"
            onClick={fetchCart}
            disabled={loading}
          >
            {loading ? <Icon icon="Loader" spin /> : null}
            Refresh
          </button>
          <a
            href={`${adminRoot}/resources/${resource.id}/records/${record.id}/viewOrders`}
            className="tokri-order-invoice"
            style={{ background: '#ffffff', color: '#047857', borderColor: '#ffffff' }}
          >
            View Orders
          </a>
        </div>
      </Box>

      <section className="tokri-order-card">
        {error ? (
          <div style={{ padding: 16, borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>
            {error}
          </div>
        ) : loading && !cart ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
            <Icon icon="Loader" spin /> Loading cart...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
            Cart is empty.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px', width: 64 }}>Image</th>
                    <th style={{ padding: '10px 12px' }}>Product</th>
                    <th style={{ padding: '10px 12px' }}>Variant / Weight</th>
                    <th style={{ padding: '10px 12px' }}>Qty</th>
                    <th style={{ padding: '10px 12px' }}>Unit Price</th>
                    <th style={{ padding: '10px 12px' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id || item.slug} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <td style={{ padding: '10px 12px' }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {item.weight || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {formatInr(item.priceValue)}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a' }}>
                        {formatInr(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: 14, color: '#334155' }}>
                Total quantity: <strong>{totalQuantity}</strong>
              </div>
              <div style={{ fontSize: 16, color: '#0f172a' }}>
                Total cart value: <strong style={{ color: '#047857' }}>{formatInr(cartTotal)}</strong>
              </div>
            </div>
          </>
        )}
      </section>

      {unavailableItems.length ? (
        <section className="tokri-order-card" style={{ background: '#f8fafc' }}>
          <h4 style={{ marginTop: 0 }}>Unavailable (not counted)</h4>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: '#64748b', fontSize: 13 }}>
            {unavailableItems.map((item) => (
              <li key={item.slug || item.id}>
                {item.name}
                {item.weight ? ` (${item.weight})` : ''} × {item.quantity}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Box>
  )
}
