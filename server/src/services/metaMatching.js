import { createHash } from 'node:crypto'
import { isIP } from 'node:net'

const hash = value => createHash('sha256').update(value).digest('hex')
const normalized = value => typeof value === 'string' && value.length <= 254
  ? value.normalize('NFKC').trim().toLowerCase() : ''
const letters = /[^\p{L}\p{M}]/gu

export function metaCustomerData(customer, address) {
  if (!customer) return {}
  const email = normalized(customer.email)
  const rawPhone = typeof customer.phone === 'string' ? customer.phone.replace(/\D/g, '') : ''
  const phone = /^[6-9]\d{9}$/.test(rawPhone) ? '91' + rawPhone : /^91[6-9]\d{9}$/.test(rawPhone) ? rawPhone : ''
  const name = normalized(customer.name || address?.name)
  const names = name && name !== 'customer' && /^[\p{L}\p{M}\s.'’-]+$/u.test(name)
    ? name.split(/\s+/) : []
  const pin = typeof address?.pincode === 'string' && /^[1-9]\d{5}$/.test(address.pincode) ? address.pincode : ''
  const fields = {
    em: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    ph: phone,
    fn: normalized(names[0]).replace(letters, ''),
    ln: names.length > 1 ? normalized(names.at(-1)).replace(letters, '') : '',
    ct: normalized(address?.city).replace(letters, ''),
    st: normalized(address?.state).replace(letters, ''),
    zp: pin,
    country: pin ? 'in' : '',
    external_id: typeof customer.id === 'string' && /^[\w-]{1,100}$/.test(customer.id) ? customer.id : '',
  }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value).map(([key, value]) => [key, [hash(value)]]))
}

export function metaClientData(ip, userAgent) {
  const address = typeof ip === 'string' ? ip.trim() : ''
  const agent = typeof userAgent === 'string' ? userAgent.trim().slice(0, 512) : ''
  return {
    ...(isIP(address) && !/^(::1$|(?:::ffff:)?127\.)/i.test(address) ? { client_ip_address: address } : {}),
    ...(agent ? { client_user_agent: agent } : {}),
  }
}
