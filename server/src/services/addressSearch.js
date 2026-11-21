import { customerPremise } from '../../../shared/addressFields.js'
import { addressDirectory } from '../data/addressDirectory.js'
import { prisma } from '../lib/prisma.js'
import { verifiedAreaLabel } from '../data/verifiedPincodeAreas.js'
import { searchMappls, mapplsEnabled } from './mappls.js'

const normalize = value => String(value || '').toLowerCase().replace(/gurgaon/g, 'gurugram')
  .replace(/\bsec\.?\s*/g, 'sector ').replace(/\biii\b/g, '3').replace(/\biv\b/g, '4').replace(/\bii\b/g, '2')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
export function searchLocalDirectory(query, directory = addressDirectory) {
  const premise = customerPremise(query)
  const clean = normalize(premise ? query.replace(premise, ' ') : query)
  const tokens = clean.split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  return directory.filter(row => {
    const haystack = normalize([row.label, row.city, row.state, row.pincode, ...(row.aliases || [])].join(' '))
    return tokens.every(token => haystack.split(' ').some(word => word.startsWith(token)))
  }).sort((a, b) => Number(b.city === 'Gurugram') - Number(a.city === 'Gurugram'))
    .slice(0, 8).map(row => ({ ...row, source: 'local', label: [row.label, row.city, row.state, row.pincode].filter(Boolean).join(', ') }))
}
export async function searchAddresses(query, { db = prisma, provider = searchMappls, enabled = mapplsEnabled() } = {}) {
  const term = typeof query === 'string' ? query.trim() : ''
  if (term.length < 3 || term.length > 160 || /[\u0000-\u001f]/.test(term)) return { suggestions: [], mode: 'local', status: 'invalid_query' }
  let local = searchLocalDirectory(term)
  // Reuse verified labels from the existing admin-managed pincode records.
  const rows = await db.serviceablePincode.findMany({ select: { pincode: true, areaLabel: true, city: true } })
  const existing = new Set(local.map(row => row.id))
  for (const row of rows) {
    const locality = verifiedAreaLabel(row.pincode, row.areaLabel)
    if (!locality) {
      // Numeric search can still use configured valid pincodes without inventing
      // an area name. Eligibility is checked independently after selection.
      if (/^[0-9]{3,6}$/.test(term) && /^[1-9][0-9]{5}$/.test(row.pincode) && row.pincode.includes(term)) {
        local.push({ id: `pin-${row.pincode}`, label: row.pincode, pincode: row.pincode, source: 'local', kind: 'pincode' })
      }
      continue
    }
    // A postal display label is not a structured locality. Reuse an audited
    // directory entry's component mapping when available, including POIs.
    const known = addressDirectory.find(entry => entry.pincode === row.pincode && entry.label === locality)
    if (known && existing.has(known.id)) continue
    const match = searchLocalDirectory(term, [known || { id: `pin-${row.pincode}`, label: locality, pincode: row.pincode, kind: 'postal area', city: row.pincode.startsWith('122') ? 'Gurugram' : row.city || '', state: row.pincode.startsWith('122') ? 'Haryana' : row.pincode.startsWith('110') ? 'Delhi' : '' }])
    local.push(...match)
  }
  let remote = [], status = 'local_only'
  if (enabled && term.length <= 45) {
    try { remote = await provider(term); status = 'ok' } catch { status = 'provider_unavailable' }
  }
  const seen = new Set()
  const suggestions = [...remote, ...local].filter(row => {
    const key = normalize(row.label)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 8)
  return { suggestions, status, mode: remote.length ? 'mappls' : 'local' }
}
