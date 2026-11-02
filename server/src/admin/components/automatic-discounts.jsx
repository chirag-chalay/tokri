import React, { useEffect, useState } from 'react'
import { ApiClient, useNotice } from 'adminjs'
import { Box, Button, H3, Input, Label, Text } from '@adminjs/design-system'

const api = new ApiClient()
export default function AutomaticDiscounts() {
  const [config, setConfig] = useState(null)
  const [amount, setAmount] = useState('0')
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const notice = useNotice()
  const action = (data) => api.recordAction({ resourceId: 'AutomaticDiscount', recordId: '1', actionName: 'edit', ...(data ? { data, method: 'post' } : {}) })
  useEffect(() => { action().then(({ data }) => setConfig(data.config)).catch((error) => notice({ type: 'error', message: error.message })) }, [])
  const change = (next) => { setConfig(next); setPreview(null) }
  const submit = async (intent) => {
    setBusy(true)
    try {
      const { data } = await action({ ...config, tiers: JSON.stringify(config.tiers), intent, amount })
      if (data.notice) notice(data.notice)
      if (data.config) setConfig(data.config)
      if (intent === 'preview' && !data.notice) setPreview(data.preview || { discount: 0 })
    } catch (error) { notice({ type: 'error', message: error.message }) }
    finally { setBusy(false) }
  }
  if (!config) return <Box p="xl"><Text>Loading automatic discounts…</Text></Box>
  return <Box p="xl" bg="white">
    <H3>Automatic Discounts</H3>
    <Text mb="lg">Apply the highest eligible tier to product selling-price subtotal. Delivery, handling and GST are excluded. Merchandise coupons use the larger single discount.</Text>
    <Label><input type="checkbox" aria-label="Enable automatic discounts" checked={config.enabled} onChange={(e) => change({ ...config, enabled: e.target.checked })} /> Enable automatic discounts</Label>
    <Text mb="lg">Keep disabled until the administrator approves activation.</Text>
    {config.tiers.map((tier, index) => <Box key={tier.id} display="flex" alignItems="end" flexWrap="wrap" mb="lg" style={{ gap: 16 }}>
      <Label>Minimum product subtotal (₹)<Input aria-label={`Minimum ${index + 1}`} type="number" min="0.01" step="0.01" value={tier.minimum} onChange={(e) => change({ ...config, tiers: config.tiers.map((row, i) => i === index ? { ...row, minimum: e.target.value } : row) })} /></Label>
      <Label>Percentage (%)<Input aria-label={`Percentage ${index + 1}`} type="number" min="0.01" max="100" step="0.01" value={tier.percentage} onChange={(e) => change({ ...config, tiers: config.tiers.map((row, i) => i === index ? { ...row, percentage: e.target.value } : row) })} /></Label>
      <Label><input aria-label={`Active ${index + 1}`} type="checkbox" checked={tier.active} onChange={(e) => change({ ...config, tiers: config.tiers.map((row, i) => i === index ? { ...row, active: e.target.checked } : row) })} /> Active</Label>
      <Button type="button" variant="danger" disabled={busy} onClick={() => change({ ...config, tiers: config.tiers.filter((_, i) => i !== index) })}>Delete tier</Button>
    </Box>)}
    <Button type="button" mb="xl" disabled={busy} onClick={() => change({ ...config, tiers: [...config.tiers, { id: crypto.randomUUID(), minimum: '', percentage: '', active: true }] })}>Add tier</Button>
    <Box mb="xl"><Label>Sample cart subtotal (₹)<Input aria-label="Sample cart subtotal" type="number" min="0" step="0.01" value={amount} onChange={(e) => { setAmount(e.target.value); setPreview(null) }} /></Label>
      <Button type="button" disabled={busy} onClick={() => submit('preview')}>Preview discount</Button>
      {preview && <Text mt="lg">Automatic discount{preview.percentage ? ` (${preview.percentage}%)` : ''}: ₹{Number(preview.discount).toFixed(2)} savings. {config.enabled ? '' : 'Promotion is disabled.'}</Text>}
    </Box>
    <Button type="button" variant="primary" disabled={busy} onClick={() => submit('save')}>{busy ? 'Working…' : 'Save changes'}</Button>
  </Box>
}
