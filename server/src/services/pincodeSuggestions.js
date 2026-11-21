import { prisma } from '../lib/prisma.js'
import { verifiedAreaLabel } from '../data/verifiedPincodeAreas.js'
import { deliveryAvailability } from './delivery.js'

// Only configured, eligible locations can be advertised as suggestions. The
// legacy empty-network fallback in address validation is deliberately unchanged.
export async function pincodeSuggestions(query, db = prisma) {
  const term = typeof query === 'string' ? query.trim() : ''
  if (!/^[0-9]{1,6}$/.test(term)) return []
  const rows = await db.serviceablePincode.findMany({
    where: {
      pincode: { contains: term },
      isActive: true,
      OR: [{ morningEnabled: true }, { expressEnabled: true }],
    },
    select: { pincode: true, areaLabel: true, isActive: true, morningEnabled: true, expressEnabled: true },
    orderBy: { pincode: 'asc' },
  })
  const seen = new Set()
  return rows.filter((row) => {
    if (!/^[1-9][0-9]{5}$/.test(row.pincode) || !row.pincode.includes(term)
      || seen.has(row.pincode) || !deliveryAvailability(row).serviceable) return false
    seen.add(row.pincode)
    return true
  }).slice(0, 50).map((row) => ({
    pincode: row.pincode,
    // Reuse admin locality labels only when independently verified. Do not
    // substitute a city name or infer a locality from a nearby pincode.
    areaLabel: verifiedAreaLabel(row.pincode, row.areaLabel),
  }))
}
