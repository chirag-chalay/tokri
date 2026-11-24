import React, { useEffect, useState } from 'react'
import { ApiClient, useNotice } from 'adminjs'
import { Box, Button, H4 } from '@adminjs/design-system'

const api = new ApiClient()
const pageName = 'socialMediaLinks'
const fields = [
  { key: 'platform', label: 'Platform', type: 'text', maxLength: 40 },
  { key: 'displayText', label: 'Display Text', type: 'text', maxLength: 80 },
  { key: 'url', label: 'URL', type: 'url', maxLength: 500 },
  { key: 'sortOrder', label: 'Sort Order', type: 'number', min: 0 },
]

export default function SocialLinks() {
  const [links, setLinks] = useState([])
  const [revision, setRevision] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const addNotice = useNotice()

  useEffect(() => {
    let ignore = false
    api.getPage({ pageName })
      .then(({ data }) => {
        if (ignore) return
        setLinks(data.links)
        setRevision(data.revision)
      })
      .catch(() => { if (!ignore) setLoadError(true) })
    return () => { ignore = true }
  }, [])

  function updateLink(index, key, value) {
    setLinks((current) => current.map((link, i) => i === index ? { ...link, [key]: value } : link))
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.getPage({
        pageName,
        method: 'POST',
        headers: { 'X-Tokri-Social-Links': '1' },
        data: { links, revision },
      })
      if (data.error) {
        addNotice({ message: data.error, type: 'error' })
        return
      }
      setLinks(data.links)
      setRevision(data.revision)
      addNotice({ message: 'Social media links saved.', type: 'success' })
    } catch {
      addNotice({ message: 'Could not save social media links.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box p="xl">
      <H4>Social Media Links</H4>
      {loadError ? <p role="alert">Social media links could not be loaded.</p> : !revision ? (
        <p>Loading social media links…</p>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={saving} style={{ border: 0, padding: 0 }}>
            {links.map((link, index) => (
              <fieldset key={index} className="tokri-coupon-card">
                <legend>{link.platform || 'New platform'}</legend>
                {fields.map(({ key, label, type, maxLength, min }) => (
                  <label key={key} className="tokri-coupon-label">
                    {label}
                    <input
                      className="tokri-coupon-input"
                      type={type}
                      maxLength={maxLength}
                      min={min}
                      required
                      value={link[key]}
                      onChange={(event) => updateLink(index, key, type === 'number' && event.target.value !== ''
                        ? event.target.valueAsNumber : event.target.value)}
                    />
                  </label>
                ))}
                <label className="tokri-coupon-label">
                  <input type="checkbox" checked={link.enabled} onChange={(event) => updateLink(index, 'enabled', event.target.checked)} /> Enabled
                </label>
                <Button type="button" onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}>
                  Remove platform
                </Button>
              </fieldset>
            ))}
            <Box mt="lg" display="flex" gap="md">
              <Button type="button" disabled={links.length >= 50} onClick={() => setLinks((current) => [
                ...current, { platform: '', displayText: '', url: '', enabled: true, sortOrder: current.length + 1 },
              ])}>
                Add platform
              </Button>
              <Button type="submit" variant="primary">{saving ? 'Saving…' : 'Save changes'}</Button>
            </Box>
          </fieldset>
        </form>
      )}
    </Box>
  )
}
