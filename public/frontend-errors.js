/* First-party website diagnostics. No cookies, storage, user data or request bodies. */
;(function () {
  'use strict'
  if (window.__tokriFrontendErrors || /^\/(?:tokri-backoffice|admin|partner)(?:\/|$)/.test(location.pathname)) return
  var endpoint = '/api/v1/frontend-errors'
  var originalFetch = window.fetch.bind(window)
  var queue = [], timer, sending = false, count = 0, start = Date.now()
  var seen = new Map()

  function safeUrl(value) {
    try {
      var url = new URL(String(value), location.origin)
      if (!/^https?:$/.test(url.protocol)) return '[non-http]'
      return (url.origin + url.pathname).replace(/\/(order|checkout|account|auth)(?:\/[^\s]*)?/gi, '/$1/[redacted]')
    } catch { return '[unknown]' }
  }
  function clean(value, limit) {
    return String(value || '')
      .replace(/https?:\/\/[^\s<>"')]+/gi, safeUrl)
      .replace(/\b(?:bearer\s+)[\w.+/=-]+/gi, 'Bearer [redacted]')
      .replace(/\b(token|password|secret|otp|authorization|cookie|email|phone)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
      .replace(/\b\d{6,}\b/g, '[number]').slice(0, limit)
  }
  function describe(value) {
    // Do not serialize arbitrary objects (API payloads, customer or payment data).
    if (value instanceof Error) return value.name + ': ' + value.message
    return typeof value === 'string' ? value : '[' + typeof value + ']'
  }
  function capture(kind, message, detail) {
    try {
      if (Date.now() - start > 60000) { start = Date.now(); count = 0; seen.clear() }
      if (count >= 60 || queue.length >= 20) return
      var event = Object.assign({ kind: kind, message: clean(message, 800), page: safeUrl(location.href) }, detail)
      event.stack = clean(event.stack, 3000)
      if (event.source) event.source = safeUrl(event.source)
      var key = kind + event.message + (event.source || '')
      if (Date.now() - (seen.get(key) || 0) < 5000) return
      seen.set(key, Date.now()); count++
      queue.push(event)
      if (!timer) timer = setTimeout(flush, 1000)
    } catch { /* Reporting must never interrupt the storefront. */ }
  }
  function flush() {
    clearTimeout(timer); timer = null
    if (sending || !queue.length) return
    var batch = queue.splice(0, 5)
    sending = true
    var controller = new AbortController()
    var timeout = setTimeout(function () { controller.abort() }, 5000)
    originalFetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', keepalive: true, signal: controller.signal,
      body: JSON.stringify({ events: batch }),
    }).catch(function () { /* No recursive reporting or retries. */ }).finally(function () {
      clearTimeout(timeout); sending = false
      if (queue.length && !timer) timer = setTimeout(flush, 1000)
    })
  }
  window.__tokriFrontendErrors = { capture: capture }
  window.addEventListener('error', function (event) {
    var target = event.target
    if (target && target !== window) {
      var source = target.currentSrc || target.src || target.href
      if (source) capture('resource', 'Failed to load ' + target.tagName, { source: source })
    } else capture('javascript', event.message || 'Script error', {
      stack: event.error && event.error.stack, source: event.filename,
      line: event.lineno, column: event.colno,
    })
  }, true)
  window.addEventListener('unhandledrejection', function (event) {
    capture('unhandledrejection', describe(event.reason), { stack: event.reason instanceof Error ? event.reason.stack : '' })
  })
  var originalError = console.error
  console.error = function () {
    var args = Array.from(arguments)
    capture('console', args.map(describe).join(' '), { stack: args.find(function (arg) { return arg instanceof Error })?.stack })
    return originalError.apply(console, args)
  }
  window.fetch = function (input, options) {
    var url = typeof input === 'string' || input instanceof URL ? input : input.url
    if (safeUrl(url) === safeUrl(endpoint)) return originalFetch(input, options)
    return originalFetch(input, options).then(function (response) {
      if (!response.ok) capture('http', 'Fetch HTTP ' + response.status, { source: url, status: response.status })
      return response
    }, function (error) {
      capture('network', describe(error), { source: url })
      throw error
    })
  }
  var xhrOpen = XMLHttpRequest.prototype.open
  var xhrSend = XMLHttpRequest.prototype.send
  var xhrUrls = new WeakMap()
  XMLHttpRequest.prototype.open = function (method, url) {
    xhrUrls.set(this, url)
    return xhrOpen.apply(this, arguments)
  }
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('loadend', function () {
      var url = xhrUrls.get(this)
      if (safeUrl(url) !== safeUrl(endpoint) && (this.status === 0 || this.status >= 400)) {
        capture(this.status ? 'http' : 'network', 'XHR HTTP ' + this.status, { source: url, status: this.status })
      }
    }, { once: true })
    return xhrSend.apply(this, arguments)
  }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush() })
})()
