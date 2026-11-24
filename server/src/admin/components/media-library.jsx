import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useQueryParams, useRecords } from 'adminjs'
const FOLDERS = ['all', 'products', 'categories', 'reviews', 'pages', 'general']

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

function formatSize(bytes) {
  const size = Number(bytes) || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatWhen(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function resolveUrl(path, appUrl) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${withoutTrailingSlash(appUrl || window.location.origin)}${path}`
}

const MediaLibrary = (props) => {
  const { resource, setTag } = props
  const addNotice = useNotice()
  const { storeParams, filters } = useQueryParams()
  const { records, loading, fetchData, total, perPage } = useRecords(resource.id)
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const folder = String(filters?.folder || 'all')
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const appUrl = custom.appUrl || window.location.origin
  const uploadFolder = folder === 'all' ? 'general' : folder

  useEffect(() => {
    if (setTag) setTag(String(total || 0))
  }, [total, setTag])

  useEffect(() => {
    if (Number(perPage) < 50) storeParams({ perPage: '50' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useMemo(
    () =>
      (records || []).map((item) => ({
        id: item.id,
        name: item.params?.originalName || item.params?.filename || 'Image',
        folder: item.params?.folder || 'general',
        path: item.params?.path || '',
        size: item.params?.size,
        createdAt: item.params?.createdAt,
        url: resolveUrl(item.params?.path, appUrl),
      })),
    [appUrl, records],
  )

  const setFolder = (next) => {
    storeParams({
      page: '1',
      filters: next === 'all' ? {} : { folder: next },
    })
  }

  const uploadFiles = async (files) => {
    const list = [...files].filter((file) => file.type.startsWith('image/'))
    if (!list.length) return
    setUploading(true)
    try {
      for (const file of list) {
        const formData = new FormData()
        formData.append('folder', uploadFolder)
        formData.append('file', file)
        const response = await fetch(`${apiBaseUrl}/media/upload`, {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.message || `Could not upload ${file.name}`)
        }
      }
      addNotice({
        message: list.length === 1 ? 'Image uploaded' : `${list.length} images uploaded`,
        type: 'success',
      })
      fetchData()
    } catch (error) {
      addNotice({ message: error.message || 'Upload failed', type: 'error' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const copyPath = async (path) => {
    try {
      await navigator.clipboard.writeText(path)
      addNotice({ message: 'File path copied', type: 'success' })
    } catch {
      addNotice({ message: path, type: 'info' })
    }
  }

  const remove = async (id, name) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
    setBusyId(id)
    try {
      const response = await fetch(`${apiBaseUrl}/media/${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Could not delete image')
      }
      addNotice({ message: data.message || 'Image deleted', type: 'success' })
      fetchData()
    } catch (error) {
      addNotice({ message: error.message || 'Could not delete image', type: 'error' })
    } finally {
      setBusyId('')
    }
  }

  return (
    <Box className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">Media library</H3>
        <Text color="white">
          Upload images used on products, categories, reviews, and the homepage. Files stay on this server.
        </Text>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Upload</h4>
        <p>
          Files go into the <strong>{uploadFolder}</strong> folder
          {folder === 'all' ? ' (select a folder below to change this).' : '.'}
        </p>
        <label
          className="tokri-upload-drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            uploadFiles(event.dataTransfer.files)
          }}
        >
          <span>{uploading ? 'Uploading…' : 'Click or drop images here'}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(event) => uploadFiles(event.target.files)}
          />
        </label>
        <div className="tokri-image-suggest" role="note">
          <strong>Suggested</strong>
          <span>Prefer JPG/WebP. Phone assets: banners ~720×360, category thumbs ~320×320, products ~600×600. Aim under 250KB each when possible (hard max 5MB).</span>
        </div>
      </section>

      <section className="tokri-coupon-card">
        <h4>Library</h4>
        <p>{total || 0} file{(total || 0) === 1 ? '' : 's'}{folder !== 'all' ? ` in ${folder}` : ''}.</p>
        <div className="tokri-folder-chips">
          {FOLDERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`tokri-folder-chip${folder === item ? ' is-on' : ''}`}
              onClick={() => setFolder(item)}
            >
              {item === 'all' ? 'All folders' : item}
            </button>
          ))}
        </div>

        {loading ? (
          <Text mt="xl">Loading images…</Text>
        ) : items.length ? (
          <div className="tokri-media-grid">
            {items.map((item) => (
              <article key={item.id} className="tokri-media-card">
                <div className="tokri-media-thumb">
                  {item.url ? <img src={item.url} alt={item.name} /> : <span>No preview</span>}
                </div>
                <strong title={item.name}>{item.name}</strong>
                <span>
                  {item.folder} · {formatSize(item.size)}
                  {item.createdAt ? ` · ${formatWhen(item.createdAt)}` : ''}
                </span>
                <div className="tokri-media-actions">
                  <Button size="sm" variant="text" onClick={() => copyPath(item.path)}>
                    Copy path
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === item.id}
                    onClick={() => remove(item.id, item.name)}
                  >
                    {busyId === item.id ? <Icon icon="Loader" spin /> : null}
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Text mt="xl">No images in this folder yet.</Text>
        )}
      </section>
    </Box>
  )
}

export default MediaLibrary
