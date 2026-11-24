import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { BasePropertyComponent, useNotice, useRecord } from 'adminjs'
import { FlagCard } from './form-controls.jsx'

const normalizeSlugInput = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const CategoryEdit = (props) => {
  const { record: initialRecord, resource } = props
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const addNotice = useNotice()
  const fileRef = useRef(null)
  const bannerFileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [slugEdited, setSlugEdited] = useState(Boolean(initialRecord?.params?.slug))
  const [previewUrl, setPreviewUrl] = useState('')
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('')

  const params = record?.params || {}
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const categoryUrlBase = withoutTrailingSlash(
    custom.categoryUrlBase || `${window.location.origin}/category`,
  )
  const slugInput = params.slug ?? ''
  const previewSlug = normalizeSlugInput(slugInput) || normalizeSlugInput(params.label)
  const categoryUrl = previewSlug ? `${categoryUrlBase}/${previewSlug}` : null

  const imageUrl = useMemo(() => {
    if (!params.image) return ''
    if (/^(https?:|data:|blob:)/.test(params.image)) return params.image
    return `${withoutTrailingSlash(custom.appUrl || window.location.origin)}${params.image}`
  }, [custom.appUrl, params.image])

  const displayedImageUrl = previewUrl || imageUrl

  const bannerImageUrl = useMemo(() => {
    if (!params.bannerImage) return ''
    if (/^(https?:|data:|blob:)/.test(params.bannerImage)) return params.bannerImage
    return `${withoutTrailingSlash(custom.appUrl || window.location.origin)}${params.bannerImage}`
  }, [custom.appUrl, params.bannerImage])

  const displayedBannerUrl = bannerPreviewUrl || bannerImageUrl

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(bannerPreviewUrl)
    }
  }, [bannerPreviewUrl])

  const setField = (key, value) => handleChange(key, value)

  const onPropertyChange = (propertyPath, value, ...rest) => {
    if (propertyPath === 'slug') {
      setSlugEdited(true)
      handleChange(propertyPath, normalizeSlugInput(value), ...rest)
      return
    }
    handleChange(propertyPath, value, ...rest)
    if (propertyPath === 'label' && !slugEdited) {
      handleChange('slug', normalizeSlugInput(value))
    }
  }

  const uploadTo = async (file, field, setLocalPreview, setBusy, successMessage) => {
    const formData = new FormData()
    formData.append('folder', 'categories')
    formData.append('file', file)
    setLocalPreview(URL.createObjectURL(file))
    setBusy(true)
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
      onPropertyChange(field, media.path)
      setLocalPreview(
        /^(https?:|data:|blob:)/.test(media.path)
          ? media.path
          : `${withoutTrailingSlash(custom.appUrl || window.location.origin)}${media.path}`,
      )
      addNotice({ message: successMessage, type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not upload image', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({ message: notice.message || 'Could not save category', type: 'error' })
          return
        }
        addNotice({ message: 'Category saved', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save category', type: 'error' })
      })
  }

  const descriptionProperty = resource.editProperties.find(
    (property) => property.propertyPath === 'description',
  )

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{params.label || 'New category'}</H3>
        <Text color="white">Create a shop section with a thumbnail, banner, and page copy.</Text>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Category details</h4>
          <label className="tokri-coupon-label">
            Label
            <input
              className="tokri-coupon-input"
              value={params.label || ''}
              onChange={(event) => onPropertyChange('label', event.target.value)}
              placeholder="Fresh Fruits"
              required
            />
          </label>
          <label className="tokri-coupon-label">
            Page heading
            <input
              className="tokri-coupon-input"
              value={params.title || ''}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Same as label if empty"
            />
          </label>
          <label className="tokri-coupon-label">
            Subtitle
            <input
              className="tokri-coupon-input"
              value={params.subtitle || ''}
              onChange={(event) => setField('subtitle', event.target.value)}
              placeholder="Short line under the heading"
            />
          </label>
          <label className="tokri-coupon-label">
            Slug
            <input
              className="tokri-coupon-input"
              value={slugInput}
              onChange={(event) => onPropertyChange('slug', event.target.value)}
              placeholder="auto-generated from label"
            />
          </label>
          <Text mt="sm" opacity={0.7}>
            Preview:{' '}
            {categoryUrl ? (
              <a href={categoryUrl} target="_blank" rel="noreferrer">
                {categoryUrl}
              </a>
            ) : (
              'Generated from category label when saved'
            )}
          </Text>
          <div className="tokri-coupon-two">
            <label className="tokri-coupon-label">
              Sort order
              <input
                className="tokri-coupon-input"
                type="number"
                value={params.sortOrder ?? 0}
                onChange={(event) => setField('sortOrder', event.target.value)}
              />
            </label>
            <label className="tokri-coupon-label">
              Status
              <div className="tokri-choice-row" style={{ marginTop: 6 }}>
                <FlagCard
                  selected={params.isActive !== false && params.isActive !== 'false'}
                  title="Active"
                  hint="Shown on website and app"
                  onClick={() =>
                    setField('isActive', !(params.isActive !== false && params.isActive !== 'false'))
                  }
                />
              </div>
            </label>
          </div>
        </section>

        <section className="tokri-coupon-card">
          <h4>Category image</h4>
          <p>Square thumbnail used in the home category grid.</p>
          <div className="tokri-image-suggest" role="note">
            <strong>Suggested</strong>
            <span>Best size: 320×320 px (square). Category chips on phone are small — larger files only slow the app. JPG/WebP · aim under 80KB (max 5MB).</span>
          </div>
          <label className="tokri-upload-drop">
            {displayedImageUrl ? (
              <img src={displayedImageUrl} alt={params.label || 'Category preview'} />
            ) : (
              <span>Click to upload category image</span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  uploadTo(file, 'image', setPreviewUrl, setUploading, 'Image uploaded successfully')
                }
                event.target.value = ''
              }}
            />
          </label>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Category banner</h4>
        <p>Wide image shown at the top of the category page.</p>
        <div className="tokri-image-suggest" role="note">
          <strong>Suggested</strong>
          <span>Best size: 1200×300 px desktop / 720×180 px if mostly mobile traffic (about 4:1). JPG/WebP · aim under 250KB (max 5MB).</span>
        </div>
        <label className="tokri-upload-drop tokri-upload-drop-wide">
          {displayedBannerUrl ? (
            <img src={displayedBannerUrl} alt={params.label || 'Category banner'} />
          ) : (
            <span>Click to upload a wide banner</span>
          )}
          <input
            ref={bannerFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                uploadTo(
                  file,
                  'bannerImage',
                  setBannerPreviewUrl,
                  setBannerUploading,
                  'Banner uploaded successfully',
                )
              }
              event.target.value = ''
            }}
          />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Description</h4>
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

      <Box style={{ display: 'none' }} aria-hidden="true">
        {resource.editProperties
          .filter((property) => ['image', 'bannerImage'].includes(property.propertyPath))
          .map((property) => (
            <BasePropertyComponent
              key={property.propertyPath}
              where="edit"
              onChange={onPropertyChange}
              property={property}
              resource={resource}
              record={record}
            />
          ))}
      </Box>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading || uploading || bannerUploading}>
          {loading || uploading || bannerUploading ? <Icon icon="Loader" spin /> : null}
          Save category
        </Button>
      </Box>
    </Box>
  )
}

export default CategoryEdit
