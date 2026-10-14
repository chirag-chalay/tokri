import React, { useEffect, useMemo, useRef, useState } from 'react'

export function useAnchoredMenu(open) {
  const wrapRef = useRef(null)
  const [openUp, setOpenUp] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const update = () => {
      const node = wrapRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 240 && rect.top > spaceBelow)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  return { wrapRef, openUp }
}

export function SearchableMultiSelect({ options, selected, onChange, placeholder, searchPlaceholder }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { wrapRef, openUp } = useAnchoredMenu(open)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const selectedOptions = options.filter((item) => selectedSet.has(item.value))
  const filtered = options.filter((item) =>
    `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const toggle = (value) => {
    if (selectedSet.has(value)) onChange(selected.filter((item) => item !== value))
    else onChange([...selected, value])
  }

  return (
    <div className="tokri-multiselect" ref={wrapRef}>
      <button type="button" className="tokri-multiselect-control" onClick={() => setOpen((value) => !value)}>
        {selectedOptions.length ? (
          <span className="tokri-multiselect-chips">
            {selectedOptions.map((item) => (
              <span key={item.value} className="tokri-multiselect-chip">
                {item.label}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggle(item.value)
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </span>
        ) : (
          <span className="tokri-multiselect-placeholder">{placeholder}</span>
        )}
        <span className="tokri-multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-multiselect-menu${openUp ? ' is-up' : ''}`}>
          <input
            className="tokri-coupon-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="tokri-multiselect-list">
            {filtered.length ? (
              filtered.map((item) => {
                const checked = selectedSet.has(item.value)
                return (
                  <label key={item.value} className={`tokri-multiselect-option${checked ? ' is-selected' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(item.value)} />
                    <span>{item.label}</span>
                  </label>
                )
              })
            ) : (
              <div className="tokri-multiselect-empty">No matches</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FlagCard({ selected, title, hint, onClick }) {
  return (
    <button
      type="button"
      className={`tokri-choice-card${selected ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{hint}</span>
    </button>
  )
}

export function isFlagOn(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

export function StatusSwitch({
  checked,
  onChange,
  disabled,
  title,
  hint,
  compact = false,
  onLabel = 'Active',
  offLabel = 'Inactive',
}) {
  return (
    <button
      type="button"
      className={`tokri-switch${checked ? ' is-on' : ''}${compact ? ' is-compact' : ''}`}
      disabled={disabled}
      aria-pressed={checked}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!disabled) onChange(!checked)
      }}
    >
      <span className="tokri-switch-track" aria-hidden="true">
        <span className="tokri-switch-thumb" />
      </span>
      {title || hint ? (
        <span className="tokri-switch-copy">
          {title ? <strong>{title}</strong> : null}
          {hint ? <span>{hint}</span> : null}
        </span>
      ) : (
        <span className={`tokri-status-pill${checked ? ' is-on' : ''}`}>
          {checked ? onLabel : offLabel}
        </span>
      )}
    </button>
  )
}

export function SearchableSelect({ value, options, onChange, placeholder, searchPlaceholder, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { wrapRef, openUp } = useAnchoredMenu(open)
  const justPicked = useRef(false)
  const selected = options.find((item) => item.value === value)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  const filtered = options.filter((item) =>
    `${item.label} ${item.value}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="tokri-multiselect" ref={wrapRef}>
      <button
        type="button"
        className="tokri-multiselect-control"
        disabled={disabled}
        onClick={() => {
          if (justPicked.current) {
            justPicked.current = false
            setOpen(false)
            return
          }
          if (!disabled) setOpen((current) => !current)
        }}
      >
        <span className={selected ? '' : 'tokri-multiselect-placeholder'}>
          {selected?.label || placeholder}
        </span>
        <span className="tokri-multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-multiselect-menu${openUp ? ' is-up' : ''}`}>
          <input
            className="tokri-coupon-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="tokri-multiselect-list">
            {filtered.length ? (
              filtered.map((item) => {
                const active = item.value === value
                return (
                  <button
                    type="button"
                    key={item.value || 'empty'}
                    className={`tokri-multiselect-option${active ? ' is-selected' : ''}`}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      justPicked.current = true
                      onChange(item.value)
                      setOpen(false)
                      setQuery('')
                      window.setTimeout(() => {
                        justPicked.current = false
                      }, 0)
                    }}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                  >
                    {item.label}
                  </button>
                )
              })
            ) : (
              <div className="tokri-multiselect-empty">No matches</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LocalSelect({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const { wrapRef, openUp } = useAnchoredMenu(open)
  const selected = options.find((item) => String(item.value) === String(value))

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [wrapRef])

  return (
    <div className="tokri-local-select" ref={wrapRef}>
      <button
        type="button"
        className="tokri-local-select-control"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((current) => !current)
        }}
      >
        <span>{selected?.label || value}</span>
        <span className="tokri-multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className={`tokri-local-select-menu${openUp ? ' is-up' : ''}`}>
          {options.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`tokri-multiselect-option${String(item.value) === String(value) ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(item.value)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
