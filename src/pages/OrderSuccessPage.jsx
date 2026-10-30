import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { authGet } from '../lib/api'
import { formatExpectedDeliveryDate } from '../lib/delivery'

const POLL_MS = 2000
const POLL_LIMIT = 15
const SUCCESS_REDIRECT_MS = 3000
const PENDING_REDIRECT_MS = 8000

function isConfirmed(data) {
  return data?.paymentMode === 'cod' || data?.paymentStatus === 'paid'
}

function StatusMark({ variant }) {
  if (variant === 'waiting') {
    return (
      <div className="tokri-order-mark tokri-order-mark--waiting" aria-hidden>
        <span className="tokri-order-mark-spinner" />
      </div>
    )
  }

  if (variant === 'pending') {
    return (
      <div className="tokri-order-mark tokri-order-mark--pending" aria-hidden>
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="2.5" />
          <path d="M24 16v9l6 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className="tokri-order-mark tokri-order-mark--success" aria-hidden>
      <svg viewBox="0 0 48 48" fill="none">
        <circle className="tokri-order-mark-ring" cx="24" cy="24" r="22" />
        <path className="tokri-order-mark-check" d="M14 24.5l7 7L35 16.5" />
      </svg>
    </div>
  )
}

export default function OrderSuccessPage() {
  const { orderNo } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn } = useAuth()
  const { clearCart, refreshFreeDelivery } = useCart()
  const navState = location.state || {}
  const knownConfirmed = navState.confirmed === true || navState.paymentMode === 'cod'
  const token = user?.token
  const userRef = useRef(user)

  const [order, setOrder] = useState(() =>
    knownConfirmed
      ? {
          orderNo,
          paymentMode: navState.paymentMode || 'cod',
          paymentStatus: navState.paymentMode === 'online' ? 'paid' : 'pending',
          expectedDeliveryDate: navState.expectedDeliveryDate || null,
        }
      : null,
  )
  const [phase, setPhase] = useState(knownConfirmed ? 'success' : 'waiting')
  const confirmedRef = useRef(knownConfirmed)
  const cleared = useRef(false)
  const helpersRef = useRef({ clearCart, refreshFreeDelivery })

  useEffect(() => {
    userRef.current = user
    helpersRef.current = { clearCart, refreshFreeDelivery }
  }, [user, clearCart, refreshFreeDelivery])

  const markConfirmed = (data) => {
    confirmedRef.current = true
    setOrder(data)
    setPhase('success')
    if (!cleared.current) {
      cleared.current = true
      helpersRef.current.clearCart()
      helpersRef.current.refreshFreeDelivery?.()
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true, state: { openLogin: true } })
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (knownConfirmed && !cleared.current) {
      cleared.current = true
      helpersRef.current.clearCart()
      helpersRef.current.refreshFreeDelivery?.()
    }
  }, [knownConfirmed])

  useEffect(() => {
    if (!isLoggedIn || !token || !orderNo || order?.expectedDeliveryDate) return undefined
    let cancelled = false
    authGet(`/checkout/status/${encodeURIComponent(orderNo)}`, userRef.current)
      .then((data) => {
        if (cancelled || !data?.expectedDeliveryDate) return
        setOrder((current) => ({ ...(current || {}), expectedDeliveryDate: data.expectedDeliveryDate }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, order?.expectedDeliveryDate, orderNo, token])

  useEffect(() => {
    if (!isLoggedIn || !token || !orderNo || confirmedRef.current) return undefined
    let stopped = false

    const failedAuth = (error) => {
      const message = String(error?.message || '')
      return /log in/i.test(message) || /failed \(401\)/.test(message)
    }
    const missingOrder = (error) => {
      const message = String(error?.message || '')
      return /not found/i.test(message) || /failed \(404\)/.test(message)
    }

    const load = async () => {
      for (let attempt = 0; attempt < POLL_LIMIT; attempt += 1) {
        if (stopped || confirmedRef.current) return
        try {
          const data = await authGet(`/checkout/status/${encodeURIComponent(orderNo)}`, userRef.current)
          if (stopped) return
          if (isConfirmed(data)) {
            markConfirmed(data)
            return
          }
          setOrder(data)
          if (!confirmedRef.current) setPhase('waiting')
        } catch (error) {
          if (stopped || confirmedRef.current) return
          if (failedAuth(error)) {
            navigate('/', { replace: true, state: { openLogin: true } })
            return
          }
          if (missingOrder(error)) {
            setPhase('pending')
            return
          }
        }
        if (attempt < POLL_LIMIT - 1) {
          await new Promise((resolve) => setTimeout(resolve, POLL_MS))
        }
      }

      if (stopped || confirmedRef.current) return
      setPhase('pending')

      while (!stopped && !confirmedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, POLL_MS))
        if (stopped || confirmedRef.current) return
        try {
          const data = await authGet(`/checkout/status/${encodeURIComponent(orderNo)}`, userRef.current)
          if (stopped) return
          if (isConfirmed(data)) markConfirmed(data)
        } catch (error) {
          if (stopped || confirmedRef.current) return
          if (failedAuth(error) || missingOrder(error)) return
        }
      }
    }

    load()
    return () => {
      stopped = true
    }
  }, [isLoggedIn, navigate, orderNo, token])

  useEffect(() => {
    if (phase !== 'success') return undefined
    const timer = window.setTimeout(() => navigate('/', { replace: true }), SUCCESS_REDIRECT_MS)
    return () => window.clearTimeout(timer)
  }, [navigate, phase])

  useEffect(() => {
    if (phase !== 'pending') return undefined
    const timer = window.setTimeout(() => navigate('/', { replace: true }), PENDING_REDIRECT_MS)
    return () => window.clearTimeout(timer)
  }, [navigate, phase])

  const goHome = () => navigate('/', { replace: true })
  const paymentMode = order?.paymentMode || navState.paymentMode
  const primaryBtn =
    'inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover'
  const secondaryBtn =
    'inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-white hover:bg-panel'

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        {phase === 'waiting' ? (
          <>
            <StatusMark variant="waiting" />
            <h1 className="mt-6 text-2xl font-bold text-white">Confirming your payment</h1>
            <p className="mt-3 text-muted">This usually takes a few seconds. Please don’t close this tab.</p>
          </>
        ) : null}

        {phase === 'success' ? (
          <>
            <StatusMark variant="success" />
            <h1 className="mt-6 text-2xl font-bold text-white">Your order is confirmed</h1>
            <p className="mt-3 text-muted">Order #{orderNo}</p>
            {formatExpectedDeliveryDate(order?.expectedDeliveryDate) ? (
              <p className="mt-1 text-muted">
                Expected delivery: {formatExpectedDeliveryDate(order.expectedDeliveryDate)}
              </p>
            ) : null}
            <p className="mt-1 text-muted">
              {paymentMode === 'cod' ? 'Pay cash on delivery' : 'Payment received'}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/account?section=orders" className={primaryBtn}>
                View order
              </Link>
              <button type="button" onClick={goHome} className={secondaryBtn}>
                Continue shopping
              </button>
            </div>
          </>
        ) : null}

        {phase === 'pending' ? (
          <>
            <StatusMark variant="pending" />
            <h1 className="mt-6 text-2xl font-bold text-white">We’re still confirming your payment</h1>
            <p className="mt-3 text-muted">
              Your order will appear under My Orders once the bank confirms it.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={goHome} className={primaryBtn}>
                Continue shopping
              </button>
              <Link to="/account?section=orders" className={secondaryBtn}>
                View My Orders
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
