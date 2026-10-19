import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { BasePropertyComponent, useNotice, useRecord } from 'adminjs'
import { FlagCard, isFlagOn, SearchableMultiSelect, StatusSwitch } from './form-controls.jsx'

const normalizeSlugInput = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const PRODUCT_DETAILS_HTML = `<h3>Product Details</h3>
<div class="product-info">
<div class="product-info-item">
<p class="product-info-label">Health Benefits</p>
<p>Rich in Antioxidants</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Description</p>
<p>Write the fruit description here. Mention taste, how to use it, and what makes it special.</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Unit</p>
<p>125 g</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Shelf Life</p>
<p>4 days</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Taste Profile</p>
<p>Sweet</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Disclaimer</p>
<p>The image shown is for representation purposes only and may vary slightly from the actual product. Every effort is made to ensure the accuracy of all information displayed.</p>
</div>
<div class="product-info-item">
<p class="product-info-label">Customer Care Details</p>
<p>Email: <a href="mailto:support@tokriii.com">support@tokriii.com</a></p>
</div>
<div class="product-info-item">
<p class="product-info-label">Country of Origin</p>
<p>India</p>
</div>
</div>`

function parseSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parseSlugs(parsed)
    } catch {
      // ignore
    }
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const ProductEdit = (props) => {
  const { record: initialRecord, resource } = props
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const addNotice = useNotice()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [slugEdited, setSlugEdited] = useState(Boolean(initialRecord?.params?.slug))
  const [previewUrl, setPreviewUrl] = useState('')
  const [categories, setCategories] = useState([])

  const params = record?.params || {}
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const productUrlBase = withoutTrailingSlash(
    custom.productUrlBase || `${window.location.origin}/product`,
  )
  const slugInput = params.slug ?? ''
  const previewSlug = normalizeSlugInput(slugInput) || normalizeSlugInput(params.name)
  const productUrl = previewSlug ? `${productUrlBase}/${previewSlug}` : null
  const selectedCategorySlugs = parseSlugs(params.categoryIds)
  const isActive = params.isActive !== false && params.isActive !== 'false'

  const imageUrl = useMemo(() => {
    if (!params.image) return ''
    if (/^(https?:|data:|blob:)/.test(params.image)) return params.image
    return `${withoutTrailingSlash(custom.appUrl || window.location.origin)}${params.image}`
  }, [custom.appUrl, params.image])

  const displayedImageUrl = previewUrl || imageUrl

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    let ignore = false
    fetch(`${apiBaseUrl}/categories`)
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!ignore) setCategories([])
      })
    return () => {
      ignore = true
    }
  }, [apiBaseUrl])

  const setField = (key, value) => handleChange(key, value)

  const onPropertyChange = (propertyPath, value, ...rest) => {
    if (propertyPath === 'slug') {
      setSlugEdited(true)
      handleChange(propertyPath, normalizeSlugInput(value), ...rest)
      return
    }
    handleChange(propertyPath, value, ...rest)
    if (propertyPath === 'name' && !slugEdited) {
      handleChange('slug', normalizeSlugInput(value))
    }
  }

  const setSelectedCategories = (slugs) => setField('categoryIds', JSON.stringify(slugs))

  const uploadImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('folder', 'products')
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
      handleChange('image', media.path)
      handleChange('mediaId', media.id)
      setPreviewUrl(
        /^(https?:|data:|blob:)/.test(media.path)
          ? media.path
          : `${withoutTrailingSlash(custom.appUrl || window.location.origin)}${media.path}`,
      )
      addNotice({ message: 'Image uploaded successfully', type: 'success' })
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
          addNotice({ message: notice.message || 'Could not save product', type: 'error' })
          return
        }
        addNotice({ message: 'Product saved', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save product', type: 'error' })
      })
  }

  const descriptionProperty = resource.editProperties.find(
    (property) => property.propertyPath === 'description',
  )

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{params.name || 'New product'}</H3>
        <Text color="white">Add photos, prices, and one or more categories for the website and app.</Text>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Product details</h4>
          <label className="tokri-coupon-label">
            Name
            <input
              className="tokri-coupon-input"
              value={params.name || ''}
              onChange={(event) => onPropertyChange('name', event.target.value)}
              placeholder="Alphonso Mango"
              required
            />
          </label>
          <label className="tokri-coupon-label">
            Slug
            <input
              className="tokri-coupon-input"
              value={slugInput}
              onChange={(event) => onPropertyChange('slug', event.target.value)}
              placeholder="auto-generated from name"
            />
          </label>
          <Text mt="sm" opacity={0.7}>
            Preview:{' '}
            {productUrl ? (
              <a href={productUrl} target="_blank" rel="noreferrer">
                {productUrl}
              </a>
            ) : (
              'Generated from product name when saved'
            )}
          </Text>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              Price (₹)
              <input
                className="tokri-coupon-input"
                type="number"
                min="0"
                step="0.01"
                value={params.priceValue ?? ''}
                onChange={(event) => setField('priceValue', event.target.value)}
                required
              />
            </label>
            <label className="tokri-coupon-label">
              Old price (₹)
              <input
                className="tokri-coupon-input"
                type="number"
                min="0"
                step="0.01"
                value={params.oldPriceValue ?? ''}
                onChange={(event) => setField('oldPriceValue', event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              Weight
              <input
                className="tokri-coupon-input"
                value={params.weight || ''}
                onChange={(event) => setField('weight', event.target.value)}
                placeholder="1 kg"
              />
            </label>
            <label className="tokri-coupon-label">
              Badge
              <input
                className="tokri-coupon-input"
                value={params.badge || ''}
                onChange={(event) => setField('badge', event.target.value)}
                placeholder="Fresh"
              />
            </label>
          </div>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              Stock
              <input
                className="tokri-coupon-input"
                type="number"
                min="0"
                value={params.stock ?? 100}
                onChange={(event) => setField('stock', event.target.value)}
              />
            </label>
            <label className="tokri-coupon-label">
              Sort order
              <input
                className="tokri-coupon-input"
                type="number"
                value={params.sortOrder ?? 0}
                onChange={(event) => setField('sortOrder', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="tokri-coupon-card">
          <h4>Tax & GST</h4>
          <div style={{ marginBottom: 12 }}>
            <StatusSwitch
              checked={isFlagOn(params.isTaxable)}
              title="Taxable"
              hint={isFlagOn(params.isTaxable) ? 'GST will be charged at checkout' : 'No GST on this product'}
              onLabel="Yes"
              offLabel="No"
              onChange={(next) => {
                setField('isTaxable', next)
                if (next && Number(params.gstRate || 0) === 0) setField('gstRate', 5)
                if (!next) setField('gstRate', 0)
              }}
            />
          </div>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              HSN Code
              <input
                className="tokri-coupon-input"
                value={params.hsnCode ?? '0808'}
                onChange={(event) => setField('hsnCode', event.target.value)}
                placeholder="0802 or 0808"
              />
            </label>
            <label className="tokri-coupon-label">
              GST %
              <input
                className="tokri-coupon-input"
                type="number"
                step="0.01"
                min="0"
                value={params.gstRate ?? 0}
                onChange={(event) => setField('gstRate', Number(event.target.value) || 0)}
                placeholder="5"
              />
            </label>
          </div>
        </section>

        <section className="tokri-coupon-card">
          <h4>Product image</h4>
          <label className="tokri-upload-drop">
            {displayedImageUrl ? (
              <img src={displayedImageUrl} alt={params.name || 'Product preview'} />
            ) : (
              <span>Click to upload a square product photo</span>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} />
          </label>
          <Text mt="sm" opacity={0.7}>
            JPG, PNG, GIF, or WebP up to 5MB.
          </Text>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Categories</h4>
        <p>A product can appear in more than one category on the website and app.</p>
        <label className="tokri-coupon-label">
          Select categories
          <SearchableMultiSelect
            options={categories.map((item) => ({ value: item.slug, label: item.label }))}
            selected={selectedCategorySlugs}
            onChange={setSelectedCategories}
            placeholder="Search and select categories"
            searchPlaceholder="Search categories"
          />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Store placement</h4>
        <div style={{ marginBottom: 12 }}>
          <StatusSwitch
            checked={isActive}
            title={isActive ? 'Active' : 'Inactive'}
            hint={isActive ? 'Visible to customers' : 'Hidden from the website and app'}
            onChange={(next) => setField('isActive', next)}
          />
        </div>
        <div className="tokri-choice-row">
          <FlagCard
            selected={params.isBestSeller === true || params.isBestSeller === 'true'}
            title="Bestseller"
            hint="Show in bestsellers"
            onClick={() => setField('isBestSeller', !(params.isBestSeller === true || params.isBestSeller === 'true'))}
          />
          <FlagCard
            selected={params.isImported === true || params.isImported === 'true'}
            title="Imported"
            hint="Show in imported fruits"
            onClick={() => setField('isImported', !(params.isImported === true || params.isImported === 'true'))}
          />
          <FlagCard
            selected={params.isFeatured === true || params.isFeatured === 'true'}
            title="Featured"
            hint="Highlight this fruit"
            onClick={() => setField('isFeatured', !(params.isFeatured === true || params.isFeatured === 'true'))}
          />
        </div>
      </section>

      <section className="tokri-coupon-card">
        <h4>Description</h4>
        <p>
          Click Insert details template, then edit the text for this fruit. Only Product Details
          stays bold. The rest stays normal text, like the store product page.
        </p>
        <Button
          type="button"
          variant="outlined"
          mb="lg"
          onClick={() => setField('description', PRODUCT_DETAILS_HTML)}
        >
          Insert details template
        </Button>
        {descriptionProperty ? (
          <Box style={{ minHeight: 220 }}>
            <BasePropertyComponent
              where="edit"
              onChange={onPropertyChange}
              property={descriptionProperty}
              resource={resource}
              record={record}
            />
          </Box>
        ) : null}
      </section>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading || uploading}>
          {loading || uploading ? <Icon icon="Loader" spin /> : null}
          Save product
        </Button>
      </Box>
    </Box>
  )
}

export default ProductEdit
