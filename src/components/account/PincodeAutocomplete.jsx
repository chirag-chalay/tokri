import AutocompleteInput from './AutocompleteInput'
import { fetchJson } from '../../lib/api'

async function loadOptions(value) {
  const data = await fetchJson(`/delivery/pincodes?q=${encodeURIComponent(value)}`)
  if (!Array.isArray(data.suggestions)) throw new Error('Invalid suggestions')
  const seen = new Set()
  return { suggestions: data.suggestions.filter(row => {
    if (typeof row?.pincode !== 'string' || !/^[1-9][0-9]{5}$/.test(row.pincode)
      || !row.pincode.includes(value) || seen.has(row.pincode)) return false
    seen.add(row.pincode)
    return true
  }).slice(0, 50) }
}
const renderOption = row => <>
  <span className="font-semibold">{row.pincode}</span>
  {typeof row.areaLabel === 'string' && row.areaLabel.trim() && <span className="ml-2">{row.areaLabel.trim()}</span>}
</>
export default function PincodeAutocomplete({ value, onChange }) {
  return <AutocompleteInput
    label="Pincode" value={value} onChange={onChange} onSelect={row => onChange(row.pincode)}
    loadOptions={loadOptions} renderOption={renderOption}
    normalizeInput={value => value.replace(/\D/g, '').slice(0, 6)}
    loadingText="Loading pincodes…" emptyText="No serviceable pincode found"
    errorText="Could not load pincodes. You can enter your pincode manually."
    inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6}
    placeholder="6-digit pincode" required
  />
}
