'use client'

/* Preserve the existing DOM-measurement and reset behavior of the product details. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

function hasStructuredDetails(html) {
  const text = String(html || '')
  if (/class=["'][^"']*\bproduct-(details|info-item)\b/.test(text)) return true
  return /<h3[\s>]/i.test(text) && /<div[\s>]/i.test(text)
}

export default function ProductDetailsBlock({ html, fallback }) {
  const [open, setOpen] = useState(false)
  const [canToggle, setCanToggle] = useState(false)
  const bodyRef = useRef(null)
  const structured = hasStructuredDetails(html)

  useEffect(() => {
    setOpen(false)
  }, [html])

  useLayoutEffect(() => {
    const root = bodyRef.current
    if (!root) {
      setCanToggle(false)
      return
    }
    const items = root.querySelectorAll('.product-info-item')
    const extras = root.querySelectorAll('.product-disclaimer, .customer-care')
    const groups = [...root.children].filter((node) => node.tagName === 'DIV')
    if (items.length > 1 || extras.length > 0 || groups.length > 1) {
      setCanToggle(true)
      return
    }
    const blocks = [...root.children].filter((node) => !/^H[1-4]$/.test(node.tagName))
    const nested = blocks.length === 1 ? [...blocks[0].children] : blocks
    setCanToggle(nested.length > 1)
  }, [html, fallback])

  return (
    <section className="mt-12 border-t border-line pt-10">
      {!structured ? <h2 className="text-lg font-bold text-white">Product Details</h2> : null}
      {html ? (
        <div
          ref={bodyRef}
          className={`product-details${structured ? '' : ' is-plain'}${open ? '' : ' is-collapsed'}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          ref={bodyRef}
          className={`product-details is-plain${open ? '' : ' is-collapsed'}`}
        >
          <p>{fallback}</p>
        </div>
      )}
      {canToggle ? (
        <button
          type="button"
          className="product-details-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'View less details' : 'View more details'}
          <ChevronDown size={16} className={open ? 'rotate-180' : ''} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  )
}

