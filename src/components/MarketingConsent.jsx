'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getMarketingConsent, MARKETING_CONSENT_UPDATED, setMarketingConsent } from '../lib/metaPixel'

function subscribe(listener) {
  document.addEventListener(MARKETING_CONSENT_UPDATED, listener)
  window.addEventListener('focus', listener)
  return () => {
    document.removeEventListener(MARKETING_CONSENT_UPDATED, listener)
    window.removeEventListener('focus', listener)
  }
}
const serverSnapshot = () => 'unavailable'
const OPEN_SETTINGS = 'tokriii:open-cookie-settings'

export function CookieSettings() {
  const consent = useSyncExternalStore(subscribe, getMarketingConsent, serverSnapshot)
  if (consent === 'unavailable') return null

  return (
    <button type="button" onClick={(event) => {
      event.currentTarget.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { bubbles: true }))
    }} className="min-h-11 text-left transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2">
      Cookie settings
    </button>
  )
}

export default function MarketingConsent() {
  const consent = useSyncExternalStore(subscribe, getMarketingConsent, serverSnapshot)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const settingsButton = useRef(null)
  const panelTitle = useRef(null)
  useEffect(() => {
    function openSettings(event) {
      settingsButton.current = event.target
      setEditing(true)
      requestAnimationFrame(() => panelTitle.current?.focus({ preventScroll: true }))
    }
    document.addEventListener(OPEN_SETTINGS, openSettings)
    return () => document.removeEventListener(OPEN_SETTINGS, openSettings)
  }, [])

  if (consent === 'unavailable') return null

  function choose(granted) {
    setMarketingConsent(granted)
    if (getMarketingConsent() !== (granted ? 'granted' : 'denied')) {
      setError('Your choice could not be saved. Please check your browser cookie settings.')
      return
    }
    setError('')
    setEditing(false)
    requestAnimationFrame(() => settingsButton.current?.focus({ preventScroll: true }))
  }

  const open = consent === null || editing
  return (
    <>
      {open && (
        <section aria-labelledby="marketing-consent-title" className="fixed bottom-24 left-3 right-3 z-40 max-h-[60dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-md">
          <p id="marketing-consent-title" ref={panelTitle} tabIndex={-1} className="text-base font-bold outline-none">Allow marketing cookies?</p>
          <p className="mt-2 text-sm leading-6">We use Meta Pixel to measure visits and improve our ads. You can change your choice anytime in Cookie settings.</p>
          <a href="/privacy-policy" className="mt-2 inline-block text-sm font-semibold text-brand-deep underline focus-visible:outline-2 focus-visible:outline-offset-2">Privacy policy</a>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => choose(true)} className="min-h-11 flex-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2">Allow marketing</button>
            <button type="button" onClick={() => choose(false)} className="min-h-11 flex-1 rounded-full border border-slate-400 px-4 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2">Reject</button>
          </div>
          {consent !== null && <p className="mt-3 text-xs">Marketing cookies are currently {consent === 'granted' ? 'allowed' : 'off'}.</p>}
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </section>
      )}
    </>
  )
}
