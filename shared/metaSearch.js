export function metaSearchTerm(value) {
  if (typeof value !== 'string' || value.length > 180) return ''
  const term = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  if (!/^[\p{L}\p{M}\p{N} '\u2019-]{2,60}$/u.test(term) || /\p{N}(?:[\s-]*\p{N}){5,}/u.test(term) || /^\p{N}+$/u.test(term)) return ''
  return term
}
