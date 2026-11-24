import { useState } from 'react'
import AutocompleteInput from './AutocompleteInput'
import { postJson } from '../../lib/api'

async function loadOptions(query) {
  const data = await postJson('/addresses/search', { query })
  if (!Array.isArray(data.suggestions)) throw new Error('Invalid suggestions')
  return { ...data, suggestions: data.suggestions.filter(row => typeof row.id === 'string' && typeof row.label === 'string').slice(0, 8) }
}
function highlighted(text, query) {
  const tokens = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(token => token.length >= 2)
  return text.split(/(\s+|,)/).map((part, index) => tokens.some(token => part.toLowerCase().includes(token))
    ? <mark key={index} className="bg-transparent font-bold text-brand">{part}</mark> : part)
}
function renderOption(row, query) {
  return <><span className="block">{highlighted(row.label, query)}</span>
    <span className="mt-1 block text-xs text-muted">{row.kind || 'Location'}</span>
  </>
}
function renderFooter(result) {
  if (result.status !== 'provider_unavailable' && !(result.mode === 'mappls' && result.attributionLogo)) return null
  return <div className="border-t border-line px-3 py-2 text-xs text-muted">
    {result.status === 'provider_unavailable' && <p role="status">Live search unavailable. Local results only.</p>}
    {result.mode === 'mappls' && result.attributionLogo && <a href="https://www.mappls.com" target="_blank" rel="noreferrer" className="block bg-white p-3">
      <img src={result.attributionLogo} alt="Powered by Mappls MapmyIndia" className="h-auto max-w-full" style={{ width: 280 }} />
    </a>}
  </div>
}
export default function AddressAutocomplete({ onSelect }) {
  // This text is a search, not a saved address. Customer details are retained in
  // the editable fields and applied explicitly only when a suggestion is chosen.
  const [query, setQuery] = useState('')
  return <AutocompleteInput
    label="Search address" value={query} onChange={setQuery} onSelect={(row, entered) => { setQuery(row.label); onSelect(row, entered) }}
    loadOptions={loadOptions} renderOption={renderOption} renderFooter={renderFooter}
    minLength={3} debounceMs={300} normalizeInput={value => value.slice(0, 160)}
    placeholder="Search sector, society, road or pincode"
    autoComplete="off" maxLength={160}
    loadingText="Searching addresses…"
    emptyText="No matching verified address found. Enter your address manually."
    errorText="Could not search addresses. Enter your address manually."
  />
}
