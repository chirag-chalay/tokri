import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function AutocompleteInput({ value, onChange, onSelect, loadOptions, renderOption,
  label, minLength = 1, debounceMs = 0, normalizeInput = value => value,
  loadingText = 'Loading…', emptyText = 'No results found', errorText = 'Search unavailable. Enter manually.',
  renderFooter, ...inputProps
}) {
  const id = useId()
  const input = useRef(null)
  const list = useRef(null)
  const popup = useRef(null)
  const [open, setOpen] = useState(false)
  const [requestedValue, setRequestedValue] = useState('')
  const [active, setActive] = useState(-1)
  const [result, setResult] = useState(null)
  const [position, setPosition] = useState(null)
  const visible = open && requestedValue === value && value.trim().length >= minLength
  const current = result?.query === value ? result : null
  const suggestions = current?.suggestions || []

  useEffect(() => {
    if (!visible) return undefined
    let cancelled = false
    const timer = window.setTimeout(() => {
      loadOptions(value).then((data) => {
        if (!Array.isArray(data.suggestions)) throw new Error('Invalid suggestions')
        if (!cancelled) setResult({ ...data, query: value })
      }).catch(() => {
        if (!cancelled) setResult({ query: value, suggestions: [], error: true })
      })
    }, debounceMs)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [visible, value, loadOptions, debounceMs])

  useEffect(() => {
    if (!visible) return undefined
    const field = input.current
    const panel = field?.closest('[data-address-scroll]')
    const bounds = () => {
      const viewport = window.visualViewport
      const area = panel?.getBoundingClientRect()
      const top = viewport?.offsetTop || 0
      const left = viewport?.offsetLeft || 0
      return {
        top: Math.max(top, area?.top ?? top),
        bottom: Math.min(top + (viewport?.height || window.innerHeight) - 4, area?.bottom ?? Infinity),
        left, width: viewport?.width || window.innerWidth,
      }
    }
    const sync = () => {
      const rect = field?.getBoundingClientRect()
      if (!rect) return
      const { top, bottom, left, width } = bounds()
      const below = Math.max(0, bottom - rect.bottom - 4)
      const above = Math.max(0, rect.top - top - 4)
      const up = below < 200 && above > below
      const maxHeight = Math.min(240, up ? above : below)
      setPosition({
        left: Math.max(left + 8, Math.min(rect.left, left + width - rect.width - 8)),
        width: Math.min(rect.width, width - 16),
        top: up ? rect.top - 4 : rect.bottom + 4,
        transform: up ? 'translateY(-100%)' : undefined,
        maxHeight,
        visibility: rect.top < top || rect.bottom > bottom || maxHeight < 32 ? 'hidden' : 'visible',
      })
    }
    const revealAndSync = () => {
      if (panel && document.activeElement === field) {
        const rect = field.getBoundingClientRect(), { top, bottom } = bounds()
        if (rect.top < top + 8 || rect.bottom > bottom - 8) {
          // Scroll only this modal's content, never the document or footer.
          panel.scrollTop += rect.top - (top + (bottom - top - rect.height) / 2)
        }
      }
      sync()
    }
    const observer = panel && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(revealAndSync) : null
    if (observer) observer.observe(panel)
    const frame = window.requestAnimationFrame(revealAndSync)
    window.addEventListener('resize', revealAndSync)
    document.addEventListener('scroll', sync, true)
    window.visualViewport?.addEventListener('resize', revealAndSync)
    window.visualViewport?.addEventListener('scroll', revealAndSync)
    return () => {
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', revealAndSync)
      document.removeEventListener('scroll', sync, true)
      window.visualViewport?.removeEventListener('resize', revealAndSync)
      window.visualViewport?.removeEventListener('scroll', revealAndSync)
    }
  }, [visible])

  useEffect(() => {
    const option = list.current?.querySelector('[aria-selected="true"]')
    const scroller = list.current
    if (!option || !scroller) return
    const row = option.getBoundingClientRect(), box = scroller.getBoundingClientRect()
    if (row.top < box.top) scroller.scrollTop -= box.top - row.top
    else if (row.bottom > box.bottom) scroller.scrollTop += row.bottom - box.bottom
  }, [active])

  const positioned = visible && Boolean(position)
  useEffect(() => {
    const node = popup.current
    if (!positioned || !node) return undefined
    const atBoundary = delta => {
      const scroller = list.current
      return !scroller || (delta < 0 ? scroller.scrollTop <= 0
        : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1)
    }
    const wheel = event => {
      if (!list.current?.contains(event.target) || atBoundary(event.deltaY)) event.preventDefault()
    }
    let lastY = null
    const start = event => { lastY = event.touches[0]?.clientY ?? null }
    const move = event => {
      const y = event.touches[0]?.clientY
      if (lastY !== null && y !== undefined) {
        if (!list.current?.contains(event.target) || atBoundary(lastY - y)) event.preventDefault()
        lastY = y
      }
    }
    node.addEventListener('wheel', wheel, { passive: false })
    node.addEventListener('touchstart', start, { passive: true })
    node.addEventListener('touchmove', move, { passive: false })
    return () => {
      node.removeEventListener('wheel', wheel)
      node.removeEventListener('touchstart', start)
      node.removeEventListener('touchmove', move)
    }
  }, [positioned])

  const footer = current && renderFooter?.(current)
  const select = (row) => {
    setOpen(false)
    onSelect(row, value)
    setActive(-1)
  }

  return <>
    <input
      ref={input}
      id={`${id}-input`}
      aria-label={label}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={visible}
      aria-controls={visible ? `${id}-list` : undefined}
      aria-activedescendant={visible && suggestions[active] ? `${id}-${active}` : undefined}
      value={value}
      onChange={(event) => {
        const next = normalizeInput(event.target.value)
        setRequestedValue(next)
        onChange(next)
        setActive(-1)
        setResult(null)
        setOpen(true)
      }}
      onFocus={() => { setRequestedValue(value); setResult(null); setOpen(true) }}
      onBlur={() => { setOpen(false); setActive(-1) }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1) }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          setRequestedValue(value)
          setOpen(true)
          if (suggestions.length) setActive((index) => event.key === 'ArrowDown'
            ? (index + 1) % suggestions.length
            : (index <= 0 ? suggestions.length : index) - 1)
        }
        if (event.key === 'Enter' && visible && suggestions[active]) {
          event.preventDefault()
          select(suggestions[active])
        }
      }}
      {...inputProps}
      className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"

    />
    {visible && position && createPortal(
      <div
        ref={popup}
        style={position}
        className="fixed z-[90] flex flex-col overflow-hidden rounded-xl border border-line bg-panel-2 py-1 text-sm text-white shadow-2xl"
        // Keep the input focused while tapping or scrolling the suggestions.
        onMouseDown={(event) => event.preventDefault()}
      >
        <ul className="min-h-0 overflow-y-auto overscroll-contain" ref={list} id={`${id}-list`} role="listbox" aria-label={`${label} suggestions`} aria-busy={!current}>
          {suggestions.map((row, index) => <li
            id={`${id}-${index}`}
            key={row.id || row.pincode}
            role="option"
            aria-selected={active === index}
            onClick={() => select(row)}
            className={`cursor-pointer px-3 py-3 hover:bg-brand/10 ${active === index ? 'bg-brand/10 text-brand' : ''}`}
          >
            {renderOption(row, value)}
          </li>)}
        </ul>
        {!suggestions.length && <p role="status" className="px-3 py-3 text-muted">
          {!current ? loadingText : current.error ? errorText : emptyText}
        </p>}
        {footer && <div className="shrink-0">{footer}</div>}
      </div>, document.body,
    )}
  </>
}
