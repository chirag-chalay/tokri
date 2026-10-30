import { useEffect, useState } from 'react'
import { Link, useSearchParams } from '../../lib/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, Download, Package } from 'lucide-react'
import { authGet, downloadOrderInvoice, resolveAssetUrl } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { formatDeliveryCharge, formatExpectedDeliveryDate } from '../../lib/delivery'

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const formatDate = (value) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const statusLabel = (status) =>
  String(status || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const statusClass = (status) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800'
    case 'paid':
    case 'packed':
    case 'shipped':
      return 'bg-sky-100 text-sky-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

function OrderCard({ order, defaultOpen = false }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(defaultOpen)
  const [downloading, setDownloading] = useState(false)
  const expectedDelivery = formatExpectedDeliveryDate(order.expectedDeliveryDate)

  const handleDownloadInvoice = async (e) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      await downloadOrderInvoice(order.orderNo, user)
    } catch (err) {
      alert(err.message || 'Could not download invoice.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-4 p-4 text-left transition hover:bg-panel sm:p-5"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-emerald-400">
          <Package size={20} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">Order #{order.orderNo}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </span>
          <span className="mt-1 block text-sm text-muted">{formatDate(order.createdAt)}</span>
          {expectedDelivery ? (
            <span className="mt-1 block text-sm text-muted">Expected delivery: {expectedDelivery}</span>
          ) : null}
          <span className="mt-1 block text-sm text-muted">
            {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} · {order.paymentMethod}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span className="text-base font-bold text-white">{formatPrice(order.grandTotal)}</span>
          <ChevronDown
            size={18}
            className={`text-muted transition ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-5 pt-4 sm:px-5">
          <div className="mb-5">
            <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
            {expectedDelivery ? (
              <p className="mt-1 text-sm text-muted">Expected delivery: {expectedDelivery}</p>
            ) : null}
          </div>
          {order.address?.formatted && (
            <div className="mb-5 rounded-xl bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Delivery address
              </p>
              <p className="mt-2 text-sm font-medium text-white">{order.address.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{order.address.formatted}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">Item</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Qty</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-line/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveAssetUrl(item.image)}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg border border-line object-cover"
                        />
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          {item.weight && (
                            <p className="text-xs text-muted">{item.weight}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{formatPrice(item.priceValue)}</td>
                    <td className="py-3 pr-4 text-muted">{item.quantity}</td>
                    <td className="py-3 text-right whitespace-nowrap font-medium text-white">
                      {formatPrice(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm text-muted">
            <div className="flex justify-between">
              <span>Items subtotal</span>
              <span>{formatPrice(order.itemsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cart handling</span>
              <span>{formatPrice(order.handlingCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery charges</span>
              <span>{formatDeliveryCharge(order.deliveryCharge)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-mint">
                <span>{order.couponCode ? `Coupon (${order.couponCode})` : 'Discount'}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-white">
              <span>Order total</span>
              <span>{formatPrice(order.grandTotal)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>Payment: {statusLabel(order.paymentStatus)}</span>
              <span>·</span>
              <span>{order.paymentMethod}</span>
            </div>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-black transition hover:bg-brand-hover active:scale-95 disabled:opacity-50"
            >
              <Download size={14} />
              {downloading ? 'Downloading...' : 'Download Invoice'}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

function OrdersPagination({ pagination, onPageChange }) {
  const { page, totalPages, totalCount, perPage, hasPrevPage, hasNextPage } = pagination

  if (totalCount <= perPage) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, totalCount)

  const pages = []
  for (let index = 1; index <= totalPages; index += 1) {
    if (
      index === 1 ||
      index === totalPages ||
      (index >= page - 1 && index <= page + 1)
    ) {
      pages.push(index)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing {start}–{end} of {totalCount} orders
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-white transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {pages.map((item, index) =>
          item === '…' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition ${
                item === page
                  ? 'bg-brand text-black'
                  : 'border border-line text-white hover:bg-panel'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-white transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default function MyOrders() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prevQuery, setPrevQuery] = useState({ page, phone: user?.phone })

  if (prevQuery.page !== page || prevQuery.phone !== user?.phone) {
    setPrevQuery({ page, phone: user?.phone })
    setLoading(true)
    setError('')
  }

  const changePage = (nextPage) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.set('section', 'orders')
        if (nextPage <= 1) {
          params.delete('page')
        } else {
          params.set('page', String(nextPage))
        }
        return params
      },
      { replace: true },
    )
  }

  useEffect(() => {
    let ignore = false

    authGet(`/account/orders?page=${page}&perPage=10`, user)
      .then((data) => {
        if (!ignore) {
          setOrders(data.orders || [])
          setPagination(data.pagination || null)
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Could not load orders.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [user, page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">My orders</h1>
      <p className="mt-1 text-sm text-muted">Track your fruit orders and delivery details.</p>

      {loading && (
        <div className="mt-8 rounded-xl border border-line bg-panel-2 px-4 py-8 text-center text-sm text-muted">
          Loading your orders...
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-panel-2 px-6 py-10 text-center">
          <p className="text-base font-semibold text-white">
            {pagination?.totalCount ? 'No orders on this page' : 'No orders yet'}
          </p>
          <p className="mt-2 text-sm text-muted">
            {pagination?.totalCount
              ? 'Try going back to the previous page.'
              : 'Your order history will appear here after your first purchase.'}
          </p>
          {pagination?.hasPrevPage ? (
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-hover"
            >
              Go to previous page
            </button>
          ) : (
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-hover"
            >
              Start shopping
            </Link>
          )}
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} defaultOpen={index === 0} />
          ))}
          {pagination && (
            <OrdersPagination pagination={pagination} onPageChange={changePage} />
          )}
        </div>
      )}
    </div>
  )
}
