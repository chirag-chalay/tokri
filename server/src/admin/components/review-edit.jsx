import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'
import { LocalSelect, StatusSwitch, isFlagOn } from './form-controls.jsx'

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

function resolveImageUrl(path, appUrl) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${withoutTrailingSlash(appUrl || window.location.origin)}${path}`
}

function FieldError({ error }) {
  if (!error?.message) return null
  return <span className="tokri-field-error">{error.message}</span>
}

const ReviewEdit = (props) => {
  const { record: initialRecord, resource, action } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const params = record?.params || {}
  const isNew = action?.name === 'new' || !record?.id
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const appUrl = custom.appUrl || window.location.origin
  const errors = useMemo(() => record?.errors || {}, [record?.errors])
  const rating = Math.min(5, Math.max(1, Number(params.rating) || 5))
  const isApproved =
    isNew && (params.isApproved === undefined || params.isApproved === '')
      ? true
      : isFlagOn(params.isApproved)

  useEffect(() => {
    if (isNew && (params.isApproved === undefined || params.isApproved === '')) {
      handleChange('isApproved', true)
    }
    if (isNew && !params.rating) handleChange('rating', 5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const imageUrl = useMemo(
    () => resolveImageUrl(params.image, appUrl),
    [appUrl, params.image],
  )
  const displayedImageUrl = previewUrl || imageUrl
  const setField = (key, value) => handleChange(key, value)

  const uploadImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('folder', 'reviews')
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
      setField('image', media.path)
      setPreviewUrl(resolveImageUrl(media.path, appUrl))
      addNotice({ message: 'Photo uploaded', type: 'success' })
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
          addNotice({ message: notice.message || 'Could not save review', type: 'error' })
          return
        }
        addNotice({ message: isNew ? 'Review created' : 'Review updated', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save review. Please try again.', type: 'error' })
      })
    return false
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{isNew ? 'Add homepage review' : params.title || 'Review'}</H3>
        <Text color="white">
          Approved reviews appear on the website homepage. Hidden reviews stay in CMS only.
        </Text>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Website visibility</h4>
          <p>Turn this off to hide the review without deleting it.</p>
          <StatusSwitch
            checked={isApproved}
            onLabel="Approved"
            offLabel="Hidden"
            title={isApproved ? 'Approved' : 'Hidden'}
            hint={isApproved ? 'Visible on the homepage' : 'Hidden until you approve it'}
            onChange={(next) => setField('isApproved', next)}
          />
        </section>

        <section className="tokri-coupon-card">
          <h4>Rating</h4>
          <p>Shown as stars on the homepage review card.</p>
          <label className="tokri-coupon-label">
            Stars
            <LocalSelect
              value={rating}
              options={[5, 4, 3, 2, 1].map((value) => ({
                value,
                label: `${value} star${value === 1 ? '' : 's'}`,
              }))}
              onChange={(next) => setField('rating', Number(next))}
            />
          </label>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Review text</h4>
        <p>Keep it short. This is what customers read on the homepage.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Title
            <input
              className="tokri-coupon-input"
              required
              value={params.title || ''}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Super fresh fruits"
            />
            <FieldError error={errors.title} />
          </label>
          <label className="tokri-coupon-label">
            Reviewer name
            <input
              className="tokri-coupon-input"
              required
              value={params.name || ''}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Priya Sharma"
            />
            <FieldError error={errors.name} />
          </label>
        </div>
        <label className="tokri-coupon-label">
          Review
          <textarea
            className="tokri-coupon-input"
            rows={4}
            required
            value={params.content || ''}
            onChange={(event) => setField('content', event.target.value)}
            placeholder="Always fresh and delivered right on time."
          />
          <FieldError error={errors.content} />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Reviewer photo</h4>
        <p>Optional. If empty, the website shows initials instead.</p>
        <div className="tokri-image-suggest" role="note">
          <strong>Suggested</strong>
          <span>Best size: 200×200 px (square face crop). JPG/WebP · aim under 50KB (max 5MB).</span>
        </div>
        <label className="tokri-coupon-label">
          Photo
          <span className="tokri-upload-drop tokri-upload-drop-round">
            {displayedImageUrl ? (
              <img src={displayedImageUrl} alt={params.name || 'Reviewer'} />
            ) : (
              <span>{uploading ? 'Uploading…' : 'Click to upload a photo'}</span>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImage} />
          </span>
        </label>
      </section>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading || uploading}>
          {loading || uploading ? <Icon icon="Loader" spin /> : null}
          {isNew ? 'Create review' : 'Save review'}
        </Button>
      </Box>
    </Box>
  )
}

export default ReviewEdit
