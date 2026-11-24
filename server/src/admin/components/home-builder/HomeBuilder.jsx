import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice } from 'adminjs'

const ADMIN_ROOT = (() => {
  if (typeof window === 'undefined') return '/tokri-backoffice'
  const cut = window.location.pathname.search(/\/(pages|resources)(\/|$)/)
  return (cut === -1 ? window.location.pathname : window.location.pathname.slice(0, cut)).replace(/\/$/, '') || '/tokri-backoffice'
})()

const API = `${ADMIN_ROOT}/home-builder`

function emptyDocument() {
  return { schemaVersion: 1, sections: [] }
}

function asDocument(value) {
  if (!value || typeof value !== 'object') return emptyDocument()
  return {
    schemaVersion: Number(value.schemaVersion) || 1,
    sections: Array.isArray(value.sections) ? value.sections : [],
  }
}

async function hbFetch(path, options = {}) {
  // AdminJS parses every admin request with formidable first. Raw JSON + express.json()
  // hits "stream is not readable". Send FormData with a JSON "payload" field instead.
  let body = options.body
  const method = String(options.method || 'GET').toUpperCase()
  const headers = { ...(options.headers || {}) }
  if (body != null && !(body instanceof FormData) && method !== 'GET' && method !== 'HEAD') {
    const formData = new FormData()
    formData.append('payload', typeof body === 'string' ? body : JSON.stringify(body))
    body = formData
  }
  if (body instanceof FormData) {
    delete headers['Content-Type']
  }
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    method,
    headers,
    body,
  })
  const contentType = String(response.headers.get('content-type') || '')
  if (!contentType.includes('application/json')) {
    const error = new Error(
      response.redirected || response.status === 401 || response.status === 403
        ? 'Admin session expired. Refresh and sign in again.'
        : `Unexpected response (${response.status}).`,
    )
    error.status = response.status
    throw error
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.errors = data.errors || []
    error.status = response.status
    throw error
  }
  return data
}

function assetUrl(path) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  return path.startsWith('/') ? path : `/${path}`
}

function sectionLabel(section, blockTypes) {
  const block = (blockTypes || []).find((item) => item.type === section.type)
  const title = String(section.title || '').trim()
  return title || block?.label || section.type
}

function LinkEditor({ value, onChange, categories, products }) {
  const link = value || { type: 'none', value: '' }
  return (
    <div className="hb-field">
      <label>Link</label>
      <select
        className="tokri-coupon-input"
        value={link.type || 'none'}
        onChange={(event) => onChange({ type: event.target.value, value: event.target.value === 'shop' || event.target.value === 'none' ? '' : link.value })}
      >
        <option value="none">None</option>
        <option value="shop">Shop</option>
        <option value="category">Category</option>
        <option value="product">Product</option>
        <option value="url">External URL</option>
      </select>
      {link.type === 'category' ? (
        <select className="tokri-coupon-input" value={link.value || ''} onChange={(event) => onChange({ ...link, value: event.target.value })}>
          <option value="">Select category</option>
          {(categories || []).map((item) => (
            <option key={item.slug} value={item.slug}>{item.label || item.slug}</option>
          ))}
        </select>
      ) : null}
      {link.type === 'product' ? (
        <select className="tokri-coupon-input" value={link.value || ''} onChange={(event) => onChange({ ...link, value: event.target.value })}>
          <option value="">Select product</option>
          {(products || []).map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
      ) : null}
      {link.type === 'url' ? (
        <input className="tokri-coupon-input" placeholder="https://" value={link.value || ''} onChange={(event) => onChange({ ...link, value: event.target.value })} />
      ) : null}
    </div>
  )
}

function ImageField({ label, hint, value, onChange, onUpload, uploading }) {
  const fileRef = useRef(null)
  return (
    <div className="hb-field">
      <label>{label}</label>
      {hint ? (
        <div className="tokri-image-suggest" role="note">
          <strong>Suggested</strong>
          <span>{hint}</span>
        </div>
      ) : (
        <div className="tokri-image-suggest" role="note">
          <strong>Suggested</strong>
          <span>Prefer JPG/WebP. For phone layouts keep files lean (often under 250KB). Hard max 5MB.</span>
        </div>
      )}
      {value ? (
        <div className="hb-image-preview">
          <img src={assetUrl(value)} alt="" />
          <button type="button" className="hb-linkish" onClick={() => onChange('')}>Remove</button>
        </div>
      ) : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={uploading}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          await onUpload(file)
          if (fileRef.current) fileRef.current.value = ''
        }}
      />
      {uploading ? <span className="tokri-field-hint">Uploading…</span> : null}
    </div>
  )
}

function SettingsPanel({
  section,
  platform,
  blockTypes,
  categories,
  products,
  errors,
  onChange,
  onUpload,
  uploading,
}) {
  if (!section) {
    return <div className="hb-panel"><Text>Select a section to edit its settings.</Text></div>
  }
  const block = (blockTypes || []).find((item) => item.type === section.type)
  const sectionErrors = (errors || []).filter((error) => error.sectionId === section.id)
  const isMobileApp = platform === 'mobile'

  const patchSettings = (patch) => onChange({ ...section, settings: { ...section.settings, ...patch } })
  const patchSlide = (index, patch) => {
    const slides = [...(section.settings.slides || [])]
    slides[index] = { ...slides[index], ...patch }
    patchSettings({ slides })
  }

  return (
    <div className="hb-panel">
      <h4>{block?.label || section.type}</h4>
      {block?.description ? <p className="hb-muted">{block.description}</p> : null}
      {sectionErrors.length ? (
        <ul className="hb-errors">
          {sectionErrors.map((error) => (
            <li key={`${error.field}-${error.message}`}>{error.message}</li>
          ))}
        </ul>
      ) : null}

      <div className="hb-field">
        <label>Title</label>
        <input
          className="tokri-coupon-input"
          value={section.title || ''}
          onChange={(event) => onChange({ ...section, title: event.target.value })}
        />
      </div>

      <div className="hb-field">
        <label>Starting date</label>
        <input
          className="tokri-coupon-input"
          type="datetime-local"
          value={section.schedule?.startAt ? String(section.schedule.startAt).slice(0, 16) : ''}
          onChange={(event) => onChange({
            ...section,
            schedule: { ...section.schedule, startAt: event.target.value ? new Date(event.target.value).toISOString() : null },
          })}
        />
      </div>
      <div className="hb-field">
        <label>Ending date</label>
        <input
          className="tokri-coupon-input"
          type="datetime-local"
          value={section.schedule?.endAt ? String(section.schedule.endAt).slice(0, 16) : ''}
          onChange={(event) => onChange({
            ...section,
            schedule: { ...section.schedule, endAt: event.target.value ? new Date(event.target.value).toISOString() : null },
          })}
        />
      </div>

      {section.type === 'banner_slider' ? (
        <>
          <div className="hb-field">
            <label>Autoplay (seconds)</label>
            <input
              className="tokri-coupon-input"
              type="number"
              min="0"
              max="60"
              value={section.settings?.autoplaySeconds ?? 5}
              onChange={(event) => patchSettings({ autoplaySeconds: Number(event.target.value) })}
            />
          </div>
          {(section.settings?.slides || []).map((slide, index) => (
            <div className="hb-card" key={slide.id || index}>
              <div className="hb-card-head">
                <strong>Slide {index + 1}</strong>
                <button
                  type="button"
                  className="hb-linkish danger"
                  onClick={() => patchSettings({
                    slides: (section.settings?.slides || []).filter((_, i) => i !== index),
                  })}
                >
                  Remove
                </button>
              </div>
              {isMobileApp ? (
                <ImageField
                  label="Image"
                  hint={block?.recommended?.mobile || block?.recommended?.desktop}
                  value={slide.image}
                  uploading={uploading}
                  onChange={(image) => patchSlide(index, { image, mobileImage: '' })}
                  onUpload={async (file) => {
                    const media = await onUpload(file)
                    patchSlide(index, { image: media.path, mobileImage: '' })
                  }}
                />
              ) : (
                <>
                  <ImageField
                    label="Desktop image"
                    hint={block?.recommended?.desktop}
                    value={slide.image}
                    uploading={uploading}
                    onChange={(image) => patchSlide(index, { image })}
                    onUpload={async (file) => {
                      const media = await onUpload(file)
                      patchSlide(index, { image: media.path })
                    }}
                  />
                  <ImageField
                    label="Mobile image"
                    hint={block?.recommended?.mobile}
                    value={slide.mobileImage}
                    uploading={uploading}
                    onChange={(mobileImage) => patchSlide(index, { mobileImage })}
                    onUpload={async (file) => {
                      const media = await onUpload(file)
                      patchSlide(index, { mobileImage: media.path })
                    }}
                  />
                </>
              )}
              <div className="hb-field">
                <label>Alt text</label>
                <input
                  className="tokri-coupon-input"
                  value={slide.alt || ''}
                  onChange={(event) => patchSlide(index, { alt: event.target.value })}
                />
              </div>
              <LinkEditor
                value={slide.link}
                categories={categories}
                products={products}
                onChange={(link) => patchSlide(index, { link })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outlined"
            disabled={(section.settings?.slides || []).length >= 10}
            onClick={() => {
              const slides = section.settings?.slides || []
              if (slides.length >= 10) return
              patchSettings({
                slides: [
                  ...slides,
                  {
                    id: `slide_${Math.random().toString(36).slice(2, 8)}`,
                    image: '',
                    mobileImage: '',
                    alt: '',
                    link: { type: 'none', value: '' },
                  },
                ],
              })
            }}
          >
            Add slide
          </Button>
        </>
      ) : null}

      {section.type === 'category_strip' || section.type === 'category_rails' ? (
        <>
          <div className="hb-field">
            <label>Categories</label>
            <select
              className="tokri-coupon-input"
              value={section.settings?.mode || 'all'}
              onChange={(event) => patchSettings({ mode: event.target.value })}
            >
              <option value="all">All active categories</option>
              <option value="picked">Hand-picked</option>
            </select>
          </div>
          {section.settings?.mode === 'picked' ? (
            <div className="hb-field">
              <label>Pick categories</label>
              <div className="hb-checklist">
                {(categories || []).map((item) => {
                  const checked = (section.settings.categorySlugs || []).includes(item.slug)
                  return (
                    <label key={item.slug} className="hb-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = section.settings.categorySlugs || []
                          patchSettings({
                            categorySlugs: checked
                              ? current.filter((slug) => slug !== item.slug)
                              : [...current, item.slug],
                          })
                        }}
                      />
                      {item.label || item.slug}
                    </label>
                  )
                })}
              </div>
            </div>
          ) : null}
          {section.type === 'category_rails' ? (
            <div className="hb-field">
              <label>Products per row</label>
              <input
                className="tokri-coupon-input"
                type="number"
                min="1"
                max="48"
                value={section.settings?.limitPerRow ?? 12}
                onChange={(event) => patchSettings({ limitPerRow: Number(event.target.value) })}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {section.type === 'product_rail' ? (
        <>
          <div className="hb-field">
            <label>Source</label>
            <select
              className="tokri-coupon-input"
              value={section.settings?.source || 'bestSeller'}
              onChange={(event) => patchSettings({ source: event.target.value })}
            >
              <option value="bestSeller">Bestsellers</option>
              <option value="featured">Featured / seasonal</option>
              <option value="imported">Imported</option>
              <option value="category">One category</option>
              <option value="picked">Hand-picked products</option>
            </select>
          </div>
          {section.settings?.source === 'category' ? (
            <div className="hb-field">
              <label>Category</label>
              <select
                className="tokri-coupon-input"
                value={section.settings?.categorySlug || ''}
                onChange={(event) => patchSettings({ categorySlug: event.target.value })}
              >
                <option value="">Select category</option>
                {(categories || []).map((item) => (
                  <option key={item.slug} value={item.slug}>{item.label || item.slug}</option>
                ))}
              </select>
            </div>
          ) : null}
          {section.settings?.source === 'picked' ? (
            <div className="hb-field">
              <label>Products</label>
              <div className="hb-checklist">
                {(products || []).map((item) => {
                  const checked = (section.settings.productSlugs || []).includes(item.slug)
                  return (
                    <label key={item.slug} className="hb-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = section.settings.productSlugs || []
                          patchSettings({
                            productSlugs: checked
                              ? current.filter((slug) => slug !== item.slug)
                              : [...current, item.slug],
                          })
                        }}
                      />
                      {item.name}
                    </label>
                  )
                })}
              </div>
            </div>
          ) : null}
          <div className="hb-field hb-two">
            <label>
              Limit
              <input
                className="tokri-coupon-input"
                type="number"
                min="1"
                max="100"
                value={section.settings?.limit ?? 12}
                onChange={(event) => patchSettings({ limit: Number(event.target.value) })}
              />
            </label>
            <label>
              Layout
              <select
                className="tokri-coupon-input"
                value={section.settings?.layout || 'grid'}
                onChange={(event) => patchSettings({ layout: event.target.value })}
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
              </select>
            </label>
          </div>
          <label className="hb-check">
            <input
              type="checkbox"
              checked={Boolean(section.settings?.seeAll)}
              onChange={(event) => patchSettings({ seeAll: event.target.checked })}
            />
            Show “See all” button
          </label>
          {section.settings?.seeAll ? (
            <LinkEditor
              value={section.settings?.seeAllLink}
              categories={categories}
              products={products}
              onChange={(seeAllLink) => patchSettings({ seeAllLink })}
            />
          ) : null}
        </>
      ) : null}

      {section.type === 'image_banner' ? (
        <>
          <ImageField
            label="Desktop image"
            hint={block?.recommended?.desktop}
            value={section.settings?.image}
            uploading={uploading}
            onChange={(image) => patchSettings({ image })}
            onUpload={async (file) => {
              const media = await onUpload(file)
              patchSettings({ image: media.path })
            }}
          />
          <ImageField
            label="Mobile image (optional)"
            hint={block?.recommended?.mobile}
            value={section.settings?.mobileImage}
            uploading={uploading}
            onChange={(mobileImage) => patchSettings({ mobileImage })}
            onUpload={async (file) => {
              const media = await onUpload(file)
              patchSettings({ mobileImage: media.path })
            }}
          />
          <div className="hb-field">
            <label>Alt text</label>
            <input
              className="tokri-coupon-input"
              value={section.settings?.alt || ''}
              onChange={(event) => patchSettings({ alt: event.target.value })}
            />
          </div>
          <LinkEditor
            value={section.settings?.link}
            categories={categories}
            products={products}
            onChange={(link) => patchSettings({ link })}
          />
        </>
      ) : null}

      {section.type === 'mobile_banner' ? (
        <>
          <ImageField
            label="Image"
            hint={block?.recommended?.mobile}
            value={section.settings?.image}
            uploading={uploading}
            onChange={(image) => patchSettings({ image })}
            onUpload={async (file) => {
              const media = await onUpload(file)
              patchSettings({ image: media.path })
            }}
          />
          <label className="hb-check">
            <input
              type="checkbox"
              checked={Boolean(section.settings?.fullWidth)}
              onChange={(event) => patchSettings({ fullWidth: event.target.checked })}
            />
            Full width (edge to edge, no rounded corners)
          </label>
          <div className="hb-field">
            <label>Alt text</label>
            <input
              className="tokri-coupon-input"
              value={section.settings?.alt || ''}
              onChange={(event) => patchSettings({ alt: event.target.value })}
            />
          </div>
          <LinkEditor
            value={section.settings?.link}
            categories={categories}
            products={products}
            onChange={(link) => patchSettings({ link })}
          />
        </>
      ) : null}

      {section.type === 'promo_slider' ? (
        <>
          <div className="hb-field">
            <label>Autoplay (seconds)</label>
            <input
              className="tokri-coupon-input"
              type="number"
              min="0"
              max="60"
              value={section.settings?.autoplaySeconds ?? 3}
              onChange={(event) => patchSettings({ autoplaySeconds: Number(event.target.value) })}
            />
          </div>
          {(section.settings?.slides || []).map((slide, index) => (
            <div className="hb-card" key={slide.id || index}>
              <div className="hb-card-head">
                <strong>Slide {index + 1}</strong>
                <button
                  type="button"
                  className="hb-linkish danger"
                  onClick={() => patchSettings({
                    slides: (section.settings?.slides || []).filter((_, i) => i !== index),
                  })}
                >
                  Remove
                </button>
              </div>
              <ImageField
                label="Image"
                hint={block?.recommended?.mobile}
                value={slide.image}
                uploading={uploading}
                onChange={(image) => patchSlide(index, { image })}
                onUpload={async (file) => {
                  const media = await onUpload(file)
                  patchSlide(index, { image: media.path })
                }}
              />
              <div className="hb-field">
                <label>Alt text</label>
                <input
                  className="tokri-coupon-input"
                  value={slide.alt || ''}
                  onChange={(event) => patchSlide(index, { alt: event.target.value })}
                />
              </div>
              <LinkEditor
                value={slide.link}
                categories={categories}
                products={products}
                onChange={(link) => patchSlide(index, { link })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outlined"
            disabled={(section.settings?.slides || []).length >= 10}
            onClick={() => {
              const slides = section.settings?.slides || []
              if (slides.length >= 10) return
              patchSettings({
                slides: [
                  ...slides,
                  {
                    id: `slide_${Math.random().toString(36).slice(2, 8)}`,
                    image: '',
                    alt: '',
                    link: { type: 'none', value: '' },
                  },
                ],
              })
            }}
          >
            Add slide
          </Button>
        </>
      ) : null}

      {section.type === 'reviews' || section.type === 'blog_posts' ? (
        <div className="hb-field">
          <label>Limit</label>
          <input
            className="tokri-coupon-input"
            type="number"
            min="1"
            max="50"
            value={section.settings?.limit ?? 10}
            onChange={(event) => patchSettings({ limit: Number(event.target.value) })}
          />
        </div>
      ) : null}
    </div>
  )
}

function previewImageSrc(platform, desktopImage, mobileImage) {
  if (platform === 'web') return desktopImage || mobileImage || ''
  return mobileImage || desktopImage || ''
}

function PreviewPane({ preview, platform, loading }) {
  if (loading) return <div className="hb-preview-empty">Loading preview…</div>
  if (!preview?.sections?.length) {
    return <div className="hb-preview-empty">Nothing to preview yet. Add sections and save a draft.</div>
  }
  return (
    <div className={`hb-preview-frame is-${platform}`}>
      {preview.sections.map((section) => (
        <div className="hb-preview-section" key={section.id}>
          {section.title ? <div className="hb-preview-title">{section.title}</div> : null}
          {section.type === 'banner_slider' ? (
            <div className="hb-preview-banner">
              {(section.slides || []).slice(0, 1).map((slide) => (
                <img
                  key={slide.id}
                  src={previewImageSrc(platform, slide.image, slide.mobileImage)}
                  alt={slide.alt || ''}
                />
              ))}
              <span>{section.slides?.length || 0} slide(s)</span>
            </div>
          ) : null}
          {section.type === 'category_strip' ? (
            <div className="hb-preview-row">
              {(section.categories || []).slice(0, 6).map((category) => (
                <div key={category.slug} className="hb-preview-chip">
                  {category.image ? <img src={category.image} alt="" /> : null}
                  <span>{category.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          {section.type === 'product_rail' ? (
            <div className="hb-preview-products">
              {(section.products || []).slice(0, 6).map((product) => (
                <div key={product.slug} className="hb-preview-product">
                  {product.image ? <img src={product.image} alt="" /> : <div className="hb-preview-ph" />}
                  <span>{product.name}</span>
                </div>
              ))}
            </div>
          ) : null}
          {section.type === 'category_rails' ? (
            (section.rows || []).slice(0, 2).map((row) => (
              <div key={row.category.slug} className="hb-preview-rail">
                <strong>{row.category.label}</strong>
                <div className="hb-preview-products">
                  {(row.products || []).slice(0, 4).map((product) => (
                    <div key={product.slug} className="hb-preview-product">
                      {product.image ? <img src={product.image} alt="" /> : <div className="hb-preview-ph" />}
                      <span>{product.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : null}
          {section.type === 'image_banner' || section.type === 'mobile_banner' ? (
            <div className={`hb-preview-banner${section.type === 'mobile_banner' && section.fullWidth ? ' hb-preview-banner-flush' : ''}`}>
              <img
                src={previewImageSrc(platform, section.image, section.mobileImage)}
                alt={section.alt || ''}
              />
            </div>
          ) : null}
          {section.type === 'promo_slider' ? (
            <div className="hb-preview-banner">
              {(section.slides || []).slice(0, 1).map((slide) => (
                <img key={slide.id} src={slide.image || ''} alt={slide.alt || ''} />
              ))}
              <span>{section.slides?.length || 0} promo card(s)</span>
            </div>
          ) : null}
          {section.type === 'reviews' ? <div className="hb-muted">{section.reviews?.length || 0} reviews</div> : null}
          {section.type === 'blog_posts' ? <div className="hb-muted">{section.posts?.length || 0} posts</div> : null}
        </div>
      ))}
    </div>
  )
}

export default function HomeBuilder() {
  const addNotice = useNotice()
  const [platform, setPlatform] = useState('web')
  const [state, setState] = useState(null)
  const [document, setDocument] = useState(emptyDocument())
  const [selectedId, setSelectedId] = useState('')
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const dragIndex = useRef(null)
  const savedSnapshot = useRef('')

  const blockTypes = state?.blockTypes || []
  const sections = Array.isArray(document?.sections) ? document.sections : []
  const selected = sections.find((section) => section.id === selectedId) || null

  const markDirty = useCallback((nextDoc) => {
    const safe = asDocument(nextDoc)
    setDocument(safe)
    setDirty(JSON.stringify(safe) !== savedSnapshot.current)
  }, [])

  const applyState = useCallback((data, { resetSelection = false } = {}) => {
    const draft = asDocument(data?.draft)
    setState(data || null)
    setDocument(draft)
    savedSnapshot.current = JSON.stringify(draft)
    setDirty(false)
    setSelectedId((prev) => {
      if (resetSelection) return draft.sections[0]?.id || ''
      if (prev && draft.sections.some((section) => section.id === prev)) return prev
      return draft.sections[0]?.id || ''
    })
    return draft
  }, [])

  const loadState = useCallback(async (nextPlatform = platform) => {
    setLoading(true)
    try {
      const data = await hbFetch(`/state?platform=${encodeURIComponent(nextPlatform)}`)
      if (!data?.draft) {
        throw new Error('Homepage builder returned an incomplete response. Refresh and try again.')
      }
      applyState(data, { resetSelection: true })
      setErrors([])
      setPlatform(nextPlatform)
    } catch (error) {
      setDocument(emptyDocument())
      addNotice({ message: error.message || 'Could not load homepage builder', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addNotice, applyState, platform])

  useEffect(() => {
    loadState('web')
    hbFetch('/categories?limit=100').then(setCategories).catch(() => setCategories([]))
    hbFetch('/products?limit=100').then(setProducts).catch(() => setProducts([]))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const refreshPreview = useCallback(async () => {
    setPreviewLoading(true)
    try {
      // Preview reads the saved draft. Autosave quietly; keep local selection/UI intact.
      if (dirty) {
        const saved = await hbFetch('/draft', {
          method: 'POST',
          body: JSON.stringify({ platform, document: asDocument(document) }),
        })
        const draft = asDocument(saved?.draft)
        savedSnapshot.current = JSON.stringify(draft)
        setDirty(false)
        setState(saved)
        if (saved.errors) setErrors(saved.errors)
        const localJson = JSON.stringify(asDocument(document))
        const remoteJson = JSON.stringify(draft)
        if (localJson !== remoteJson) {
          setDocument(draft)
          setSelectedId((prev) => (
            prev && draft.sections.some((section) => section.id === prev)
              ? prev
              : (draft.sections[0]?.id || '')
          ))
        }
      }
      const data = await hbFetch(`/preview?platform=${encodeURIComponent(platform)}`)
      setPreview(data)
    } catch (error) {
      addNotice({ message: error.message || 'Preview failed', type: 'error' })
    } finally {
      setPreviewLoading(false)
    }
  }, [addNotice, dirty, document, platform])

  useEffect(() => {
    if (!state || loading) return undefined
    const timer = setTimeout(() => {
      refreshPreview()
    }, 500)
    return () => clearTimeout(timer)
  }, [document, platform]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateSection = (nextSection) => {
    markDirty({
      ...document,
      sections: sections.map((section) => (section.id === nextSection.id ? nextSection : section)),
    })
  }

  const moveSection = (from, to) => {
    if (to < 0 || to >= sections.length) return
    const nextSections = [...sections]
    const [item] = nextSections.splice(from, 1)
    nextSections.splice(to, 0, item)
    markDirty({ ...document, sections: nextSections })
  }

  const addSection = async (type) => {
    const block = blockTypes.find((item) => item.type === type)
    if (!block) return
    const section = {
      id: `s_${Math.random().toString(36).slice(2, 10)}`,
      type,
      visible: true,
      title: block.label === 'Product rail' ? 'Bestsellers' : block.label === 'Category strip' ? 'Shop By Categories' : block.label === 'Reviews' ? 'What customers say' : block.label === 'Blog posts' ? 'From the blog' : '',
      settings: defaultSettingsFor(type),
      schedule: { startAt: null, endAt: null },
    }
    markDirty({ ...document, sections: [...sections, section] })
    setSelectedId(section.id)
    setShowPalette(false)
  }

  const uploadFile = async (file) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      return await hbFetch('/upload', { method: 'POST', body: formData })
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      const saved = await hbFetch('/draft', {
        method: 'POST',
        body: JSON.stringify({ platform, document: asDocument(document) }),
      })
      const draft = applyState(saved)
      const validated = await hbFetch('/validate', {
        method: 'POST',
        body: JSON.stringify({ platform, document: draft }),
      })
      setErrors(validated.errors || [])
      addNotice({ message: 'Draft saved', type: 'success' })
      const data = await hbFetch(`/preview?platform=${encodeURIComponent(platform)}`)
      setPreview(data)
    } catch (error) {
      setErrors(error.errors || [])
      addNotice({ message: error.message || 'Could not save draft', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    if (!window.confirm('Publish this homepage layout? Visitors will see it immediately.')) return
    setBusy(true)
    try {
      const saved = await hbFetch('/publish', {
        method: 'POST',
        body: JSON.stringify({ platform, document: asDocument(document) }),
      })
      applyState(saved)
      setErrors([])
      addNotice({ message: `Published version ${saved.version}`, type: 'success' })
      const data = await hbFetch(`/preview?platform=${encodeURIComponent(platform)}`)
      setPreview(data)
    } catch (error) {
      setErrors(error.errors || [])
      addNotice({ message: error.message || 'Publish failed', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const discard = async () => {
    if (!window.confirm('Discard unpublished changes and restore the last published layout?')) return
    setBusy(true)
    try {
      const saved = await hbFetch('/discard', {
        method: 'POST',
        body: JSON.stringify({ platform }),
      })
      applyState(saved)
      setErrors([])
      addNotice({ message: 'Draft discarded', type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not discard draft', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const restore = async (version) => {
    if (!window.confirm(`Restore version ${version} into the draft?`)) return
    setBusy(true)
    try {
      const saved = await hbFetch('/restore', {
        method: 'POST',
        body: JSON.stringify({ platform, version }),
      })
      applyState(saved)
      setDirty(true)
      setShowHistory(false)
      addNotice({ message: `Version ${version} restored to draft`, type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not restore', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const switchPlatform = async (next) => {
    if (next === platform) return
    if (dirty && !window.confirm('You have unsaved changes. Switch platform and lose them?')) return
    await loadState(next)
  }

  const openRealPreview = () => {
    const token = state?.previewToken
    if (!token) return
    const url = platform === 'web'
      ? `/?homePreview=${encodeURIComponent(token)}`
      : `/api/v1/home?platform=mobile&previewToken=${encodeURIComponent(token)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const errorCount = errors.length
  const unpublished = dirty || state?.hasUnpublishedChanges

  return (
    <Box className="hb-root">
      <div className="hb-top">
        <div className="hb-title-block">
          <span className="hb-eyebrow">Storefront content</span>
          <H3>Home page builder</H3>
          <Text className="hb-subtitle">Arrange sections for the website and mobile app. Draft changes stay private until you publish.</Text>
        </div>
        <div className="hb-top-actions">
          <div className="hb-top-meta">
            <div className="hb-tabs" aria-label="Homepage platform">
              <button type="button" className={platform === 'web' ? 'is-on' : ''} onClick={() => switchPlatform('web')}>Website</button>
              <button type="button" className={platform === 'mobile' ? 'is-on' : ''} onClick={() => switchPlatform('mobile')}>Mobile app</button>
            </div>
            <div className="hb-statuses">
              {unpublished ? <span className="hb-badge">Unpublished changes</span> : <span className="hb-badge is-clean">Published</span>}
              {errorCount ? <span className="hb-badge is-error">{errorCount} issue{errorCount === 1 ? '' : 's'}</span> : null}
            </div>
          </div>
          <div className="hb-action-group hb-action-primary">
            <Button type="button" variant="outlined" disabled={busy || loading} onClick={save}>Save draft</Button>
            <Button type="button" variant="contained" disabled={busy || loading || errorCount > 0} onClick={publish}>Publish</Button>
          </div>
          <div className="hb-action-group hb-action-secondary">
            <Button type="button" variant="text" disabled={busy || loading} onClick={discard}>Discard draft</Button>
            <Button type="button" variant="text" disabled={busy || loading} onClick={() => setShowHistory((value) => !value)}>History</Button>
            <Button type="button" variant="text" disabled={busy || loading || !state?.previewToken} onClick={openRealPreview}>Open real preview</Button>
          </div>
        </div>
      </div>

      {showHistory ? (
        <div className="hb-history">
          <strong>Published versions</strong>
          {(state?.revisions || []).length ? (
            <ul>
              {(state.revisions || []).map((revision) => (
                <li key={revision.id}>
                  <span>v{revision.version} · {revision.createdAt ? new Date(revision.createdAt).toLocaleString('en-IN') : ''}</span>
                  <button type="button" className="hb-linkish" onClick={() => restore(revision.version)}>Restore to draft</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hb-muted">No published versions yet.</p>
          )}
        </div>
      ) : null}

      {loading ? (
        <Text>Loading builder…</Text>
      ) : (
        <div className="hb-layout">
          <aside className="hb-col hb-sections">
            <div className="hb-col-head">
              <div>
                <span className="hb-col-kicker">Structure</span>
                <strong>Sections</strong>
              </div>
              <span className="hb-count">{sections.length}</span>
              <Button type="button" size="sm" variant="contained" onClick={() => setShowPalette((value) => !value)}>+ Add</Button>
            </div>
            {showPalette ? (
              <div className="hb-palette">
                <div className="hb-palette-title">
                  <strong>Add a section</strong>
                  <span>Choose a content block</span>
                </div>
                {blockTypes.map((block) => (
                  <button key={block.type} type="button" onClick={() => addSection(block.type)}>
                    <strong>{block.label}</strong>
                    <span>{block.description}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <ul className="hb-section-list">
              {sections.map((section, index) => (
                <li
                  key={section.id}
                  className={`${selectedId === section.id ? 'is-selected' : ''} ${section.visible === false ? 'is-hidden' : ''}`}
                  draggable
                  onDragStart={() => { dragIndex.current = index }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current == null || dragIndex.current === index) return
                    moveSection(dragIndex.current, index)
                    dragIndex.current = null
                  }}
                >
                  <button type="button" className="hb-section-main" onClick={() => setSelectedId(section.id)}>
                    <span className="hb-drag">⠿</span>
                    <span className="hb-section-copy">
                      <strong>{sectionLabel(section, blockTypes)}</strong>
                      <small>{section.type.replaceAll('_', ' ')}</small>
                    </span>
                    {section.visible === false ? <span className="hb-hidden-badge">Hidden</span> : null}
                  </button>
                  <div className="hb-section-actions">
                    <button type="button" title="Move up" onClick={() => moveSection(index, index - 1)}>↑</button>
                    <button type="button" title="Move down" onClick={() => moveSection(index, index + 1)}>↓</button>
                    <button
                      type="button"
                      title={section.visible === false ? 'Show' : 'Hide'}
                      onClick={() => updateSection({ ...section, visible: section.visible === false })}
                    >
                      {section.visible === false ? '👁' : '◎'}
                    </button>
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={() => {
                        const copy = {
                          ...JSON.parse(JSON.stringify(section)),
                          id: `s_${Math.random().toString(36).slice(2, 10)}`,
                        }
                        const nextSections = [...sections]
                        nextSections.splice(index + 1, 0, copy)
                        markDirty({ ...document, sections: nextSections })
                        setSelectedId(copy.id)
                      }}
                    >
                      <Icon icon="Copy" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className="danger"
                      onClick={() => {
                        if (!window.confirm('Delete this section?')) return
                        const nextSections = sections.filter((item) => item.id !== section.id)
                        markDirty({ ...document, sections: nextSections })
                        if (selectedId === section.id) setSelectedId(nextSections[0]?.id || '')
                      }}
                    >
                      <Icon icon="Trash" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <section className="hb-col hb-preview-col">
            <div className="hb-col-head">
              <div>
                <span className="hb-col-kicker">Canvas</span>
                <strong>Live preview</strong>
              </div>
              <span className="hb-device-badge">{platform === 'web' ? 'Website' : 'Mobile app'}</span>
              <Button type="button" size="sm" variant="outlined" onClick={refreshPreview} disabled={previewLoading}>Refresh</Button>
            </div>
            <PreviewPane preview={preview} platform={platform} loading={previewLoading} />
          </section>

          <aside className="hb-col hb-settings hb-settings-col">
            <div className="hb-col-head">
              <div>
                <span className="hb-col-kicker">Inspector</span>
                <strong>Settings</strong>
              </div>
              {selected ? <span className="hb-device-badge">{sectionLabel(selected, blockTypes)}</span> : null}
            </div>
            <SettingsPanel
              section={selected}
              platform={platform}
              blockTypes={blockTypes}
              categories={categories}
              products={products}
              errors={errors}
              uploading={uploading}
              onChange={updateSection}
              onUpload={uploadFile}
            />
          </aside>
        </div>
      )}
    </Box>
  )
}

function defaultSettingsFor(type) {
  switch (type) {
    case 'banner_slider':
      return {
        autoplaySeconds: 5,
        slides: [{ id: `slide_${Math.random().toString(36).slice(2, 8)}`, image: '', mobileImage: '', alt: '', link: { type: 'none', value: '' } }],
      }
    case 'promo_slider':
      return {
        autoplaySeconds: 3,
        slides: [{ id: `slide_${Math.random().toString(36).slice(2, 8)}`, image: '', alt: '', link: { type: 'none', value: '' } }],
      }
    case 'category_strip':
      return { mode: 'all', categorySlugs: [] }
    case 'product_rail':
      return { source: 'bestSeller', categorySlug: '', productSlugs: [], limit: 12, layout: 'grid', seeAll: false, seeAllLink: { type: 'none', value: '' } }
    case 'category_rails':
      return { mode: 'picked', categorySlugs: [], limitPerRow: 12 }
    case 'image_banner':
      return { image: '', mobileImage: '', alt: '', link: { type: 'none', value: '' } }
    case 'mobile_banner':
      return { image: '', alt: '', link: { type: 'none', value: '' }, fullWidth: false }
    case 'reviews':
    case 'blog_posts':
      return { limit: type === 'blog_posts' ? 6 : 10 }
    default:
      return {}
  }
}
