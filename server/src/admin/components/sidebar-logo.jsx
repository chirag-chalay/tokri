import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@adminjs/design-system'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'tokri-sidebar-collapsed'

/**
 * Primary Tokriii wordmark for the admin sidebar.
 */
export default function SidebarBranding() {
  const rowRef = useRef(null)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const { href, src } = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        href: '/tokri-backoffice',
        src: '/tokri-backoffice/assets/tokri-logo.png?v=primary-fullcolor',
      }
    }
    const parts = window.location.pathname.split('/').filter(Boolean)
    const root = parts.length ? `/${parts[0]}` : '/tokri-backoffice'
    return { href: root, src: `${root}/assets/tokri-logo.png?v=primary-fullcolor` }
  }, [])

  useEffect(() => {
    const sidebar = rowRef.current?.closest('[data-css="sidebar"]')
    if (!sidebar) return undefined
    sidebar.classList.toggle('tokri-sidebar-collapsed', collapsed)
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
    return () => sidebar.classList.remove('tokri-sidebar-collapsed')
  }, [collapsed])

  return (
    <div className="tokri-sidebar-brand-row" ref={rowRef}>
      <Link className="tokri-sidebar-brand" to={href} data-css="sidebar-logo" aria-label="Tokriii">
        <img
          className="tokri-sidebar-brand-img"
          src={src}
          alt="tokriii"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
            const fallback = event.currentTarget.nextElementSibling
            if (fallback) fallback.hidden = false
          }}
        />
        <span className="tokri-sidebar-brand-text" hidden>
          tokriii
        </span>
      </Link>
      <button
        className="tokri-sidebar-collapse"
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed((current) => !current)}
      >
        <Icon icon={collapsed ? 'ChevronRight' : 'ChevronLeft'} />
      </button>
    </div>
  )
}
