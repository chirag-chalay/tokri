// Keep the legacy lines for invoices, orders and older clients. Structured fields
// are optional and versioned so existing saved addresses are never split/guessed.
export const ADDRESS_DETAIL_FIELDS = ['houseNumber', 'floor', 'building', 'street', 'locality']
const text = (value) => typeof value === 'string' ? value.trim() : ''
export function composeAddressLines(address) {
  const join = (fields) => fields.map((key) => text(address[key])).filter(Boolean).join(', ')
  return { line1: join(['houseNumber', 'floor', 'building']), line2: join(['street', 'locality']) }
}
export function editableAddress(address = {}) {
  if (address.addressDetailsVersion === 1) return { ...address }
  // Preserve the complete old lines rather than guessing what is a house number.
  return { ...address, houseNumber: address.line1 || '', floor: '', building: '', street: address.line2 || '', locality: '' }
}
export function customerPremise(query) {
  // These are CUSTOMER text, never a verified result. No extraction of bare
  // numbers: Sector 56 / DLF Phase 3 must not become house numbers.
  return text(query).match(/\b(?:house|flat|plot|h\s*no\.?|house\s*no\.?)\s*(?:no\.?\s*)?[#:-]?\s*[\p{L}\p{N}]+(?:[/-][\p{L}\p{N}]+)*/iu)?.[0] || ''
}
export function applyAddressSuggestion(current, suggestion, query) {
  const next = { ...current }
  // A search term with an explicit premise is retained even when the selected
  // result resolves only to a locality. Existing customer details always win.
  next.houseNumber = current.houseNumber || customerPremise(query) || suggestion.houseNumber || ''
  for (const field of ['floor', 'building', 'street', 'locality', 'landmark']) {
    next[field] = current[field] || suggestion[field] || ''
  }
  next.city = suggestion.city || ''
  next.state = suggestion.state || ''
  // Never retain a previous location's pincode when a new match lacks one.
  next.pincode = /^[1-9][0-9]{5}$/.test(suggestion.pincode || '') ? suggestion.pincode : ''
  next.latitude = null
  next.longitude = null
  next.addressDetailsVersion = 1
  return { ...next, ...composeAddressLines(next) }
}
