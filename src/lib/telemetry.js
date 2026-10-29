const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()

function measurementId() {
  return /^G-[A-Z0-9]+$/.test(MEASUREMENT_ID) ? MEASUREMENT_ID : ''
}

export function installAnalytics() {
  const id = measurementId()
  if (!id || window.__tokriAnalytics) return
  window.__tokriAnalytics = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
}

export function trackPageView(path) {
  if (!measurementId() || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}
