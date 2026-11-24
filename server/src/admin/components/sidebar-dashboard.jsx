import React, { useMemo, useState } from 'react'
import { Icon, Navigation } from '@adminjs/design-system'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'

const GROUP_ORDER = [
  'Product management',
  'Sales & orders',
  'Customer management',
  'Delivery management',
  'Website & content',
  'Configuration',
]

const CHILD_ORDER = {
  'Product management': ['Products', 'Categories', 'Media', 'Reviews'],
  'Sales & orders': ['Orders', 'Coupons'],
  'Customer management': ['Customers', 'Users', 'Team'],
  'Delivery management': ['Delivery Partners', 'Serviceable Pincodes'],
  'Website & content': ['Home Builder', 'Page', 'Blog Post'],
  Configuration: ['Settings', 'App Release Policy', 'Logs'],
}

const RESOURCE_LABELS = {
  Page: 'Page',
  Pages: 'Page',
  BlogPost: 'Blog Post',
  'Blog Posts': 'Blog Post',
}

const PAGE_PLACEMENTS = {
  homeBuilder: { group: 'Website & content', label: 'Home Builder', icon: 'Home' },
  logs: { group: 'Configuration', label: 'Logs', icon: 'Activity' },
}

function adminRoot(pathname) {
  const cut = pathname.search(/\/(resources|pages)(\/|$)/)
  const root = cut === -1 ? pathname : pathname.slice(0, cut)
  return root.replace(/\/$/, '') || '/'
}

function isPathSelected(href, pathname) {
  if (!href) return false
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${escaped}($|/)`).test(pathname)
}

function sortChildren(groupName, elements) {
  const order = CHILD_ORDER[groupName]
  if (!order?.length) return elements
  const rank = new Map(order.map((label, index) => [label.toLowerCase(), index]))
  return [...elements].sort((a, b) => {
    const ai = rank.has(a.label?.toLowerCase()) ? rank.get(a.label.toLowerCase()) : 999
    const bi = rank.has(b.label?.toLowerCase()) ? rank.get(b.label.toLowerCase()) : 999
    if (ai !== bi) return ai - bi
    return String(a.label || '').localeCompare(String(b.label || ''))
  })
}

/**
 * Dashboard link + resource groups in a fixed order.
 * Injects Home Builder under Website & content and Logs under Configuration.
 */
export default function SidebarResourceSection(props) {
  const resources = props.resources || []
  const pages = useSelector((state) => state.pages || [])
  const location = useLocation()
  const navigate = useNavigate()
  const root = adminRoot(location.pathname)
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(GROUP_ORDER.map((name) => [name, true])),
  )

  const dashboardSelected =
    location.pathname.replace(/\/$/, '') === root.replace(/\/$/, '') ||
    location.pathname === `${root}/`

  const elements = useMemo(() => {
    const groups = new Map()

    const ensureGroup = (name, icon) => {
      if (!groups.has(name)) {
        groups.set(name, {
          id: name,
          label: name,
          icon,
          elements: [],
          onClick: () => {
            setOpenGroups((current) => ({ ...current, [name]: !current[name] }))
          },
        })
      } else if (icon && !groups.get(name).icon) {
        groups.get(name).icon = icon
      }
      return groups.get(name)
    }

    const makeResourceItem = (resource) => ({
      id: resource.id,
      label: RESOURCE_LABELS[resource.id] || RESOURCE_LABELS[resource.name] || resource.name,
      icon: resource.navigation?.icon,
      href: resource.href || undefined,
      isSelected: isPathSelected(resource.href, location.pathname),
      onClick: (event) => {
        if (!resource.href) return
        event.preventDefault()
        navigate(resource.href)
      },
    })

    for (const resource of resources) {
      if (!resource?.href || resource.navigation?.show === false) continue
      const nav = resource.navigation
      if (!nav || nav.name == null) {
        // Top-level resource — keep after known groups.
        groups.set(`resource-${resource.name}`, makeResourceItem(resource))
        continue
      }
      const group = ensureGroup(nav.name, nav.icon)
      group.elements.push(makeResourceItem(resource))
    }

    for (const page of pages) {
      const placement = PAGE_PLACEMENTS[page.name]
      if (!placement) continue
      const href = `${root}/pages/${page.name}`
      const group = ensureGroup(placement.group, page.icon || placement.icon)
      const exists = group.elements.some((item) => item.id === page.name)
      if (exists) continue
      group.elements.push({
        id: page.name,
        label: placement.label,
        icon: page.icon || placement.icon,
        href,
        isSelected: isPathSelected(href, location.pathname),
        onClick: (event) => {
          event.preventDefault()
          navigate(href)
        },
      })
    }

    const ordered = []
    for (const name of GROUP_ORDER) {
      const group = groups.get(name)
      if (!group) continue
      group.elements = sortChildren(name, group.elements)
      group.isOpen = openGroups[name] !== false
      ordered.push(group)
      groups.delete(name)
    }
    for (const leftover of groups.values()) {
      if (leftover.elements) {
        leftover.isOpen = openGroups[leftover.id] !== false
      }
      ordered.push(leftover)
    }
    return ordered
  }, [resources, pages, location.pathname, navigate, root, openGroups])

  return (
    <>
      <a
        className={`tokri-sidebar-dashboard${dashboardSelected ? ' is-active' : ''}`}
        href={root}
        onClick={(event) => {
          event.preventDefault()
          navigate(root)
        }}
      >
        <Icon icon="Grid" />
        <span>Dashboard</span>
      </a>
      <Navigation label="" elements={elements} />
    </>
  )
}
