import { useEffect, useRef } from 'react'

export function useFocusTrap(isOpen, onClose) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const previousFocusedElement = document.activeElement
    const container = containerRef.current
    if (!container) return

    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const focusables = container.querySelectorAll(focusableSelectors)
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      container.focus?.()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const elements = Array.from(container.querySelectorAll(focusableSelectors))
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus()
      }
    }
  }, [isOpen, onClose])

  return containerRef
}
