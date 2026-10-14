import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text, TinyMCE } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'
import { StatusSwitch, isFlagOn } from './form-controls.jsx'

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const EDITOR_OPTIONS = {
  plugins: ['link', 'lists', 'image', 'autolink', 'code', 'wordcount'],
  toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link image | removeformat',
  height: 420,
}

function resolveImageUrl(path, appUrl) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${withoutTrailingSlash(appUrl || window.location.origin)}${path}`
}

function dateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function parseDateValue(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function DateField({ value, onChange }) {
  const selected = parseDateValue(value)
  const [open, setOpen] = useState(false)
  const [monthDate, setMonthDate] = useState(selected || new Date())
  const wrapRef = useRef(null)
  const [openUp, setOpenUp] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const update = () => {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 320 && rect.top > spaceBelow)
    }
    update()
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (selected) setMonthDate(selected)
  }, [value])

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let index = 0; index < firstDay; index += 1) cells.push(null)
  for (let day = 1; day <= totalDays; day += 1) cells.push(day)
  const selectedDay = selected && selected.getFullYear() === year && selected.getMonth() === month
    ? selected.getDate()
    : null

  const choose = (day) => {
    onChange(toDateValue(new Date(year, month, day)))
    setOpen(false)
  }

  return (
    <div className="tokri-datepicker" ref={wrapRef}>
      <button type="button" className="tokri-datepicker-control" onClick={() => setOpen((current) => !current)}>
        <span>{selected ? selected.toLocaleDateString('en-GB') : 'Select a date'}</span>
        <span aria-hidden="true">📅</span>
      </button>
      {open ? (
        <div className={`tokri-datepicker-pop${openUp ? ' is-up' : ''}`}>
          <div className="tokri-datepicker-nav">
            <button type="button" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>‹</button>
            <strong>{monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="tokri-datepicker-week">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="tokri-datepicker-grid">
            {cells.map((day, index) => (
              day ? (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  className={selectedDay === day ? 'is-selected' : ''}
                  onClick={() => choose(day)}
                >
                  {day}
                </button>
              ) : <span key={`empty-${index}`} />
            ))}
          </div>
          <div className="tokri-datepicker-actions">
            <button
              type="button"
              className="tokri-datepicker-clear"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="tokri-datepicker-clear"
              onClick={() => {
                const today = new Date()
                setMonthDate(today)
                onChange(toDateValue(today))
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

function FieldError({ error }) {
  if (!error?.message) return null
  return <span className="tokri-field-error">{error.message}</span>
}

const BlogEdit = (props) => {
  const { record: initialRecord, resource, action } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(initialRecord, resource.id)
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const params = record?.params || {}
  const isNew = action?.name === 'new' || !record?.id
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const appUrl = custom.appUrl || window.location.origin
  const errors = useMemo(() => record?.errors || {}, [record?.errors])
  const isPublished = isNew && (params.isPublished === undefined || params.isPublished === '')
    ? true
    : isFlagOn(params.isPublished)

  useEffect(() => {
    if (isNew && (params.isPublished === undefined || params.isPublished === '')) {
      handleChange('isPublished', true)
    }
    if (isNew && !params.author) handleChange('author', 'Tokriii')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew])

  useEffect(() => () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const imageUrl = useMemo(
    () => resolveImageUrl(params.coverImage, appUrl),
    [appUrl, params.coverImage],
  )
  const displayedImageUrl = previewUrl || imageUrl
  const setField = (key, value) => handleChange(key, value)

  const uploadImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('folder', 'blog')
    formData.append('file', file)
    const localPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(localPreviewUrl)
    setUploading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/media/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Image upload failed')
      }
      const media = await response.json()
      setField('coverImage', media.path)
      setPreviewUrl(resolveImageUrl(media.path, appUrl))
      addNotice({ message: 'Cover image uploaded', type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not upload image', type: 'error' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({ message: notice.message || 'Could not save blog post', type: 'error' })
          return
        }
        addNotice({ message: isNew ? 'Blog post created' : 'Blog post updated', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save the blog post. Please try again.', type: 'error' })
      })
    return false
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{isNew ? 'New blog post' : params.title || 'Blog post'}</H3>
        <Text color="white">
          Published posts appear on the website at /blog. Hidden posts stay in the admin only.
        </Text>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Website visibility</h4>
        <p>Turn this off to keep a draft without deleting it.</p>
        <StatusSwitch
          checked={isPublished}
          onLabel="Published"
          offLabel="Draft"
          title={isPublished ? 'Published' : 'Draft'}
          hint={isPublished ? 'Visible on the blog' : 'Hidden until you publish it'}
          onChange={(next) => setField('isPublished', next)}
        />
      </section>

      <section className="tokri-coupon-card">
        <h4>Post</h4>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Title
            <input
              className="tokri-coupon-input"
              required
              value={params.title || ''}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="How we pack a morning Tokriii"
            />
            <FieldError error={errors.title} />
          </label>
          <label className="tokri-coupon-label">
            URL slug
            <input
              className="tokri-coupon-input"
              value={params.slug || ''}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="Leave blank to use the title"
            />
            <span className="tokri-field-hint">The page will be /blog/this-slug</span>
            <FieldError error={errors.slug} />
          </label>
        </div>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Author
            <input
              className="tokri-coupon-input"
              value={params.author || ''}
              onChange={(event) => setField('author', event.target.value)}
              placeholder="Tokriii"
            />
          </label>
          <label className="tokri-coupon-label">
            Category
            <input
              className="tokri-coupon-input"
              value={params.category || ''}
              onChange={(event) => setField('category', event.target.value)}
              placeholder="Guides"
            />
            <span className="tokri-field-hint">Shown above the title on the blog listing and the story page.</span>
          </label>
          <label className="tokri-coupon-label">
            Publish date
            <DateField
              value={dateInputValue(params.publishedAt)}
              onChange={(next) => setField('publishedAt', next)}
            />
            <span className="tokri-field-hint">Leave blank to use today when the post is published.</span>
          </label>
        </div>
        <label className="tokri-coupon-label">
          Short summary
          <textarea
            className="tokri-coupon-input"
            rows={3}
            value={params.excerpt || ''}
            onChange={(event) => setField('excerpt', event.target.value)}
            placeholder="One or two lines for the blog listing."
          />
          <span className="tokri-field-hint">If you leave this empty, the first lines of the post are used.</span>
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Cover image</h4>
        <p>Shown on the blog listing and at the top of the story.</p>
        <label className="tokri-coupon-label">
          Cover
          <span className="tokri-upload-drop">
            {displayedImageUrl ? (
              <img src={displayedImageUrl} alt={params.title || 'Cover'} />
            ) : (
              <span>{uploading ? 'Uploading…' : 'Click to upload a cover image'}</span>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} />
          </span>
          <span className="tokri-field-hint">JPG, PNG, GIF, or WebP up to 5MB</span>
        </label>
        {displayedImageUrl ? (
          <Button
            type="button"
            variant="text"
            mt="default"
            onClick={() => {
              setField('coverImage', '')
              setPreviewUrl('')
            }}
          >
            Remove cover
          </Button>
        ) : null}
      </section>

      <section className="tokri-coupon-card">
        <h4>Story</h4>
        <TinyMCE
          value={params.body || ''}
          onChange={(next) => setField('body', next)}
          options={EDITOR_OPTIONS}
        />
        <FieldError error={errors.body} />
      </section>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading || uploading}>
          {loading || uploading ? <Icon icon="Loader" spin /> : null}
          {isNew ? 'Publish post' : 'Save post'}
        </Button>
      </Box>
    </Box>
  )
}

export default BlogEdit
