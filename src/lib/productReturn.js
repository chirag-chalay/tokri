// Keep the mobile header's product return independent of cached React pages.
const RESTORE_KEY = 'tokri_product_return_v1'
const ORIGIN_KEY = 'tokri_product_origin_v2'
const DOCUMENT_ID = Math.random().toString(36).slice(2)
let returning = false

export function isProductReturnPending() {
  return returning
}

export function captureProductReturn(target) {
  if (window.location.pathname !== '/' || target.origin !== window.location.origin || !target.pathname.startsWith('/product/')) return null
  return {
    href: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    top: window.scrollY,
    left: window.scrollX,
    tracks: [...document.querySelectorAll('main .overflow-x-auto')].map((track) => track.scrollLeft),
  }
}

function validHome(record) {
  if (!record || typeof record.href !== 'string') return false
  try {
    const url = new URL(record.href, window.location.origin)
    return url.origin === window.location.origin && url.pathname === '/'
  } catch { return false }
}

function readRecord(key) {
  try {
    const record = JSON.parse(sessionStorage.getItem(key) || 'null')
    return validHome(record) && Number.isFinite(record.expires) && record.expires > Date.now() ? record : null
  } catch { return null }
}

export function navigateProductDocument(target) {
  const record = captureProductReturn(target)
  if (!record) return false
  try {
    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ ...record, productPath: target.pathname, expires: Date.now() + 7200000 }))
  } catch { return false }
  // A separate product document keeps Next's cached route restoration out of
  // the Home/product round trip, while retaining ordinary browser history.
  window.location.assign(target.href)
  return true
}

export function returnFromProduct() {
  if (returning) return true
  if (!window.matchMedia('(max-width: 1023px)').matches || !window.location.pathname.startsWith('/product/')) return false
  const origin = readRecord(ORIGIN_KEY)
  const navigation = performance.getEntriesByType('navigation')[0]
  const activationEntry = window.navigation?.activation?.entry
  const originalEntry = !activationEntry || window.navigation.currentEntry?.key === activationEntry.key
  const nativeProduct = origin?.productPath === window.location.pathname &&
    originalEntry &&
    navigation && new URL(navigation.name).pathname === window.location.pathname &&
    document.referrer && new URL(document.referrer).origin === window.location.origin &&
    new URL(document.referrer).pathname === '/'
  const record = nativeProduct ? origin : window.history.state?.__tokriProductReturn
  if (!validHome(record)) return false
  // If session storage is unavailable, retain the normal Back behaviour.
  try { sessionStorage.setItem(RESTORE_KEY, JSON.stringify({ ...record, fromDocument: DOCUMENT_ID, expires: Date.now() + 120000 })) } catch { return false }
  returning = true
  if (nativeProduct && window.history.length > 1) {
    const timeout = setTimeout(() => window.location.replace(record.href), 3000)
    window.addEventListener('pagehide', () => { clearTimeout(timeout); returning = false }, { once: true })
    window.history.back()
  } else {
    // Legacy SPA product entries must bypass history traversal altogether.
    window.location.replace(record.href)
  }
  return true
}

export function installProductReturnNavigation() {
  const onShow = (event) => {
    if (!event.persisted || window.location.pathname !== '/') return
    const record = readRecord(RESTORE_KEY) || readRecord(ORIGIN_KEY)
    if (!record || record.href !== `${window.location.pathname}${window.location.search}${window.location.hash}`) return
    try {
      sessionStorage.setItem(RESTORE_KEY, JSON.stringify({ ...record, fromDocument: DOCUMENT_ID, expires: Date.now() + 120000 }))
    } catch { return }
    // A browser-cached Home has an older cart context. Refresh from storage.
    window.location.reload()
  }
  window.addEventListener('pageshow', onShow)
  return () => window.removeEventListener('pageshow', onShow)
}

export function restoreProductReturn() {
  let record
  try {
    record = JSON.parse(sessionStorage.getItem(RESTORE_KEY) || 'null')
    if (!record && window.location.pathname === '/' && performance.getEntriesByType('navigation')[0]?.type === 'back_forward') record = readRecord(ORIGIN_KEY)
    // A route update may run while this document is being replaced. Only the
    // newly loaded document may consume the restoration record.
    if (record?.fromDocument === DOCUMENT_ID) return null
    sessionStorage.removeItem(RESTORE_KEY)
  } catch { return null }
  if (!validHome(record) || !Number.isFinite(record.expires) || record.expires < Date.now() || record.href !== `${window.location.pathname}${window.location.search}${window.location.hash}`) return null
  let cancelled = false
  let frame
  const restore = () => { frame = requestAnimationFrame(() => requestAnimationFrame(() => {
    if (cancelled) return
    document.querySelectorAll('main .overflow-x-auto').forEach((track, index) => {
      track.scrollTo({ left: Number(record.tracks?.[index]) || 0, behavior: 'instant' })
    })
    window.scrollTo({ top: Number(record.top) || 0, left: Number(record.left) || 0, behavior: 'instant' })
  })) }
  // Native reload scroll restoration and font layout can finish after hydration.
  // Restore after load, and never jump the page after the shopper interacts.
  const cancel = () => { cancelled = true; cancelAnimationFrame(frame) }
  const events = ['touchstart', 'pointerdown', 'wheel', 'keydown']
  events.forEach((name) => window.addEventListener(name, cancel, { passive: true, once: true }))
  if (document.readyState === 'complete') restore()
  else window.addEventListener('load', restore, { once: true })
  return () => {
    cancel()
    window.removeEventListener('load', restore)
    events.forEach((name) => window.removeEventListener(name, cancel))
  }
}
