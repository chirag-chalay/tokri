import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'

function maskDob(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function toDisplayDate(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }
  return maskDob(value)
}

function toIsoDate(value) {
  const masked = maskDob(value)
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfToday() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function DobPicker({ value, onChange }) {
  const selected = toIsoDate(value)
  const selectedDate = selected ? new Date(`${selected}T00:00:00`) : null
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(selectedDate || startOfToday())
  const wrapRef = useRef(null)
  const today = startOfToday()
  const minDate = new Date(1920, 0, 1)
  const years = []
  for (let year = today.getFullYear(); year >= 1920; year -= 1) years.push(year)

  useEffect(() => {
    if (!open) return undefined
    const place = () => {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 340 && rect.top > spaceBelow)
    }
    place()
    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]

  const choose = (day) => {
    const next = new Date(year, month, day)
    if (next < minDate || next > today) return
    const iso = `${next.getFullYear()}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(toDisplayDate(iso))
    setOpen(false)
  }

  return (
    <div className="pointer-events-none absolute inset-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setVisibleMonth(selectedDate || startOfToday())
          setOpen((current) => !current)
        }}
        className="pointer-events-auto absolute top-1/2 right-3 z-10 -translate-y-1/2 text-brand"
        aria-label="Open date picker"
        aria-expanded={open}
      >
        <Calendar size={20} />
      </button>
      {open ? (
        <div
          className={`pointer-events-auto absolute z-30 w-[280px] rounded-2xl border border-line bg-panel p-3 shadow-2xl ${
            openUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0`}
        >
          <div className="mb-3 flex gap-2">
            <select
              aria-label="Month"
              value={month}
              onChange={(event) => setVisibleMonth(new Date(year, Number(event.target.value), 1))}
              className="min-w-0 flex-1 rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-white outline-none"
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={year}
              onChange={(event) => setVisibleMonth(new Date(Number(event.target.value), month, 1))}
              className="w-24 rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-white outline-none"
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-muted">
            {WEEKDAYS.map((label, index) => (
              <span key={`${label}-${index}`} className="py-1">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center text-sm">
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />
              const date = new Date(year, month, day)
              const disabled = date < minDate || date > today
              const isSelected = selected === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(day)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                    isSelected ? 'bg-brand font-semibold text-black' : 'text-white hover:bg-panel-2'
                  } disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <button
              type="button"
              className="text-muted hover:text-white"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-brand hover:text-white"
              onClick={() => {
                setVisibleMonth(today)
                onChange(toDisplayDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`))
                setOpen(false)
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [dateOfBirth, setDateOfBirth] = useState(toDisplayDate(user?.dateOfBirth))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setDateOfBirth(toDisplayDate(user?.dateOfBirth))
  }, [user?.name, user?.dateOfBirth])

  const handleSave = async (event) => {
    event.preventDefault()
    const nextName = name.trim()
    if (!nextName) {
      Swal.fire({ icon: 'error', title: 'Name required', text: 'Please enter your name.', confirmButtonColor: '#047857' })
      return
    }

    setSaving(true)
    try {
      await updateProfile({ name: nextName, dateOfBirth: toIsoDate(dateOfBirth) || null })
      Swal.fire({
        icon: 'success',
        title: 'Profile saved',
        timer: 1400,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Could not save',
        text: error.message || 'Please try again.',
        confirmButtonColor: '#047857',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-md">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p className="mt-2 text-sm text-muted">Update your name and date of birth.</p>

      <label className="mt-6 block text-sm font-semibold text-white" htmlFor="profile-name">
        Name
      </label>
      <input
        id="profile-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={80}
        className="mt-2 w-full rounded-xl border border-line bg-panel-2 px-4 py-3 text-white outline-none focus:border-brand"
        placeholder="Your name"
      />

      <label className="mt-5 block text-sm font-semibold text-white" htmlFor="profile-dob">
        Date of birth
      </label>
      <div className="relative mt-2">
        <input
          id="profile-dob"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(maskDob(event.target.value))}
          inputMode="numeric"
          maxLength={10}
          placeholder="DD/MM/YYYY"
          className="w-full rounded-xl border border-line bg-panel-2 py-3 pr-12 pl-4 text-white outline-none focus:border-brand"
        />
        <DobPicker value={dateOfBirth} onChange={setDateOfBirth} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
