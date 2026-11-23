import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, H3, Icon, Text } from '@adminjs/design-system'
import { ApiClient } from 'adminjs'
import { getFulfillmentBadge, getPaymentBadge } from './order-list-badges.jsx'

const api = new ApiClient()

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All order statuses' },
  { value: 'pending', label: 'Waiting for fulfillment' },
  { value: 'paid', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All payment statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date: Newest first' },
  { value: 'date_asc', label: 'Date: Oldest first' },
  { value: 'total_desc', label: 'Amount: High to low' },
  { value: 'total_asc', label: 'Amount: Low to high' },
]

const PER_PAGE_OPTIONS = [10, 25, 50]

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

export default function CustomerOrders({ resource, record }) {
  const params = record?.params || {}
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const adminRoot = useMemo(() => getAdminRoot(), [])

  const fetchHistory = useCallback(async () => {
    if (!record?.id) return
    setLoading(true)
    setError('')
    try {
      const response = await api.recordAction({
        resourceId: resource.id,
        recordId: record.id,
        actionName: 'viewOrders',
        params: {
          load: '1',
          status,
          paymentStatus,
          from: from || undefined,
          to: to || undefined,
          sort,
          page: String(page),
          perPage: String(perPage),
        },
      })
      if (response?.data?.history) {
        setHistory(response.data.history)
      } else {
        setError('Could not load customer order history.')
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load customer orders.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [resource.id, record?.id, status, paymentStatus, from, to, sort, page, perPage])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const hasFilters = status !== 'all' || paymentStatus !== 'all' || Boolean(from) || Boolean(to)
  const customerInfo = history?.customer || {
    name: params.name,
    phone: params.phone,
    email: null,
  }
  const summary = history?.summary || {
    totalOrders: 0,
    totalOrderValue: 0,
    completedValue: 0,
    completedCount: 0,
    cancelledRefundedValue: 0,
    cancelledRefundedCount: 0,
    latestOrderAt: null,
  }
  const orders = history?.orders || []
  const meta = history?.meta || { page, perPage, total: 0 }
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.perPage || perPage)))
  const fromRow = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1
  const toRow = Math.min(meta.page * meta.perPage, meta.total)

  const resetFilters = () => {
    setStatus('all')
    setPaymentStatus('all')
    setFrom('')
    setTo('')
    setSort('date_desc')
    setPage(1)
  }

  return (
    <Box className="tokri-coupon-form">
      <Box className="tokri-coupon-hero" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <H3 color="white" style={{ margin: 0 }}>{customerInfo.name || 'Customer'}</H3>
          <Text color="white" style={{ marginTop: 4 }}>
            Mobile: {customerInfo.phone ? `+91 ${customerInfo.phone}` : '—'} · Email: {customerInfo.email || 'Not available'}
          </Text>
        </div>
        <a
          href={`${adminRoot}/resources/${resource.id}/records/${record.id}/viewCart`}
          className="tokri-order-invoice"
          style={{ background: '#ffffff', color: '#047857', borderColor: '#ffffff' }}
        >
          View Cart
        </a>
      </Box>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div className="tokri-order-card" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total orders</p>
          <strong style={{ display: 'block', marginTop: 6, fontSize: 22, color: '#0f172a' }}>
            {summary.totalOrders}
          </strong>
        </div>
        <div className="tokri-order-card" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total order value</p>
          <strong style={{ display: 'block', marginTop: 6, fontSize: 22, color: '#0f172a' }}>
            {formatInr(summary.totalOrderValue)}
          </strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>Excludes cancelled/refunded</span>
        </div>
        <div className="tokri-order-card" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Completed / delivered</p>
          <strong style={{ display: 'block', marginTop: 6, fontSize: 22, color: '#047857' }}>
            {formatInr(summary.completedValue)}
          </strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {summary.completedCount} delivered order{summary.completedCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="tokri-order-card" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Cancelled / refunded</p>
          <strong style={{ display: 'block', marginTop: 6, fontSize: 22, color: '#b91c1c' }}>
            {formatInr(summary.cancelledRefundedValue)}
          </strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {summary.cancelledRefundedCount} order{summary.cancelledRefundedCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="tokri-order-card" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Latest order date</p>
          <strong style={{ display: 'block', marginTop: 6, fontSize: 16, color: '#0f172a' }}>
            {formatDateTime(summary.latestOrderAt)}
          </strong>
        </div>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
        Totals cover all orders; filters apply to the list.
      </p>

      <section className="tokri-order-card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'flex-end',
            marginBottom: 16,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 170, flex: '1 1 170px' }}>
            Order status
            <select
              className="tokri-coupon-input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 160, flex: '1 1 160px' }}>
            Payment status
            <select
              className="tokri-coupon-input"
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value)
                setPage(1)
              }}
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 140, flex: '1 1 140px' }}>
            From date
            <input
              type="date"
              className="tokri-coupon-input"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 140, flex: '1 1 140px' }}>
            To date
            <input
              type="date"
              className="tokri-coupon-input"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 170, flex: '1 1 170px' }}>
            Sort by
            <select
              className="tokri-coupon-input"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <button type="button" className="tokri-order-invoice" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {error ? (
          <div style={{ padding: 16, borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>
            {error}
          </div>
        ) : loading && !history ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
            <Icon icon="Loader" spin /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
            {hasFilters
              ? 'No orders match these filters.'
              : 'This customer has not placed any orders yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Order ID</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Products</th>
                  <th style={{ padding: '10px 12px' }}>Qty</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Payment</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const fulfillment = getFulfillmentBadge(order.status)
                  const payment = getPaymentBadge(order)
                  const itemQtyTotal = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', fontSize: 13 }}>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 700 }}>
                        <a
                          href={`${adminRoot}/resources/Order/records/${order.id}/show`}
                          style={{ color: '#047857', textDecoration: 'none' }}
                        >
                          #{order.orderNo}
                        </a>
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', color: '#334155' }}>
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>
                        {(order.items || []).length ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {order.items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`}>
                                {item.name}
                                {item.weight ? ` (${item.weight})` : ''} × {item.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {itemQtyTotal}
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a' }}>
                        {formatInr(order.grandTotal)}
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        <span className={`tokri-order-pill tokri-list-pill is-${payment.tone}`}>
                          {payment.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        <span className={`tokri-order-pill tokri-list-pill is-${fulfillment.tone}`}>
                          {fulfillment.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="tokri-list-pagination">
          <span className="tokri-list-pagination-summary">
            {meta.total === 0 ? 'No records' : `Showing ${fromRow}–${toRow} of ${meta.total}`}
          </span>

          <div className="tokri-list-pagination-size">
            <span>Rows</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
            >
              {PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="tokri-list-pagination-pages">
            <button
              type="button"
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <button type="button" className="is-current" disabled>
              {meta.page} / {totalPages}
            </button>
            <button
              type="button"
              disabled={meta.page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </Box>
  )
}
