import test from 'node:test'
import assert from 'node:assert/strict'
import { searchLocalDirectory, searchAddresses } from '../src/services/addressSearch.js'
import { mapplsEnabled, mapMapplsLocation, searchMappls } from '../src/services/mappls.js'
import { addressSearchLimit } from '../src/middleware/addressSearchLimit.js'
import { applyAddressSuggestion, composeAddressLines, editableAddress } from '../../shared/addressFields.js'
import { prisma } from '../src/lib/prisma.js'
import { createAddress, updateAddress } from '../src/services/addresses.js'
const db = { serviceablePincode: { findMany: async () => [] } }

test('real sourced directory handles sectors, aliases, roads, buildings, house/plot queries and pincodes', () => {
  for (const [query, id] of [
    ['Sector 56 Gurgaon', 'sector56'], ['DLF Phase 3', 'dlf3'], ['Golf Course Road', 'golfcourse'],
    ['Plot 25 Sector 46', 'sector46'], ['Plot No. 25-B Sector 46', 'sector46'], ['House 42 Sector 15', 'sector15'], ['Flat 304 DLF', 'dlfqe'],
    ['122002', 'chakkarpur'], ['Amity International', 'amity46'], ['Adarsh Nagar Delhi', 'adarshnagar'],
  ]) {
    const rows = searchLocalDirectory(query)
    assert.ok(rows.some(row => row.id === id), query)
    assert.ok(rows.every(row => !row.houseNumber), 'No invented individual premises')
  }
  assert.equal(searchLocalDirectory('House 42 Sector 15')[0].pincode, '')
  assert.equal(searchLocalDirectory('Golf Course Road')[0].pincode, '')
  assert.deepEqual(searchLocalDirectory('Invented Society XYZ'), [])
  assert.deepEqual(searchLocalDirectory('Sector 560'), [])
})

test('search does not infer serviceability or expose customer addresses', async () => {
  const disabledLocal = await searchAddresses('DLF Phase 3', { db, enabled: false })
  assert.equal(disabledLocal.suggestions[0].pincode, '122010')
  assert.equal(disabledLocal.suggestions[0].serviceable, undefined)
  assert.equal(disabledLocal.status, 'local_only')
  assert.deepEqual((await searchAddresses('ab', { db })).suggestions, [])
  const failure = await searchAddresses('Sector 56', { db, enabled: true, provider: async () => { throw new Error('offline') } })
  assert.equal(failure.status, 'provider_unavailable')
  assert.equal(failure.suggestions[0].pincode, '122011')
})

test('numeric search reuses configured pincodes even when no verified locality mapping exists', async () => {
  const storage = { serviceablePincode: { findMany: async () => [{ pincode: '122016', areaLabel: 'Unverified label', city: 'Unverified city' }] } }
  const result = await searchAddresses('122016', { db: storage, enabled: false })
  assert.equal(result.suggestions[0].label, '122016')
  assert.equal(result.suggestions[0].pincode, '122016')
  assert.equal(result.suggestions[0].locality, undefined)
  assert.equal(result.suggestions[0].serviceable, undefined)
})

test('Galleria components are typed, including admin pincode fallback, without promoting a postal label to locality', async () => {
  const storage = { serviceablePincode: { findMany: async () => [{ pincode: '122009', areaLabel: 'Galleria DLF Phase IV' }] } }
  const result = await searchAddresses('Galleria', { db: storage, enabled: false })
  assert.equal(result.suggestions.length, 1)
  assert.equal(result.suggestions[0].building, 'Galleria Market')
  assert.equal(result.suggestions[0].locality, 'DLF Phase IV')
  assert.equal(result.suggestions[0].street, undefined)
  const applied = applyAddressSuggestion({ houseNumber: 'Shop 25' }, result.suggestions[0], 'Galleria')
  assert.equal(applied.houseNumber, 'Shop 25')
  assert.equal(applied.building, 'Galleria Market')
  assert.equal(applied.locality, 'DLF Phase IV')
  assert.equal(applied.pincode, '122009')
  assert.equal(searchLocalDirectory('122001').find(row => row.id === 'gurgaon').locality, '')
})

test('Mappls building, landmark, street and locality retain distinct provider token meanings', () => {
  const row = mapMapplsLocation({ eLoc: 'ABC123', placeName: 'Display title', addressTokens: {
    houseName: 'Verified Society', poi: 'Verified Landmark', street: 'Verified Road', subLocality: 'Sector 56', city: 'Gurugram', state: 'Haryana', pincode: '122011',
  } })
  assert.equal(row.building, 'Verified Society')
  assert.equal(row.landmark, 'Verified Landmark')
  assert.equal(row.street, 'Verified Road')
  assert.equal(row.locality, 'Sector 56')
  const poi = mapMapplsLocation({ eLoc: 'ABC124', placeName: 'Hospital', addressTokens: { poi: 'Hospital' } })
  assert.equal(poi.building, '')
  assert.equal(poi.landmark, 'Hospital')
  assert.equal(poi.locality, '')
})

test('Mappls disabled without secret, explicit storage permission and attribution', () => {
  assert.equal(mapplsEnabled({ MAPPLS_API_KEY: 'secret' }), false)
  assert.equal(mapplsEnabled({ MAPPLS_API_KEY: 'secret', MAPPLS_ADDRESS_STORAGE_ALLOWED: 'true', MAPPLS_ATTRIBUTION_LOGO_PATH: '/images/mappls.png' }), true)
  assert.equal(mapplsEnabled({ MAPPLS_API_KEY: 'secret', MAPPLS_ADDRESS_STORAGE_ALLOWED: 'true', MAPPLS_ATTRIBUTION_LOGO_PATH: '//other.test/a' }), false)
})

test('Mappls adapter uses genuine structured tokens and never extracts numbers from display strings', async () => {
  assert.equal(mapMapplsLocation({ placeName: 'No ID' }), null)
  const unstructured = mapMapplsLocation({ eLoc: 'ABC123', placeName: 'House 42, Sector 15', placeAddress: 'Gurugram 122001' })
  assert.equal(unstructured.houseNumber, '')
  assert.equal(unstructured.pincode, '')
  const config = { MAPPLS_API_KEY: 'server-only-secret', MAPPLS_ADDRESS_STORAGE_ALLOWED: 'true', MAPPLS_ATTRIBUTION_LOGO_PATH: '/images/mappls.png' }
  const rows = await searchMappls('Sector 56 Gurgaon', { config, fetcher: async (url, options) => {
    assert.equal(url.hostname, 'search.mappls.com')
    assert.equal(url.searchParams.get('location'), '28.4595,77.0266')
    assert.equal(url.searchParams.has('filter'), false, 'No hard Gurugram boundary excluding Delhi')
    assert.equal(options.signal instanceof AbortSignal, true)
    return { ok: true, status: 200, json: async () => ({ suggestedLocations: [{ eLoc: 'ABC123', placeName: 'Sector 56', addressTokens: { subLocality: 'Sector 56', city: 'Gurugram', state: 'Haryana', pincode: '122011' } }], userAddedLocations: [{ eLoc: 'BAD123', placeName: 'Unverified' }] }) }
  } })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].pincode, '122011')
  assert.equal(JSON.stringify(rows).includes(config.MAPPLS_API_KEY), false)
})

test('premise and portion details survive partial locality matches and missing pin clears old pin', () => {
  const existing = { houseNumber: 'Plot 99-B', floor: 'Rear portion / 2nd floor', building: 'Customer society', pincode: '110001' }
  const row = searchLocalDirectory('Plot 25 Sector 46')[0]
  const applied = applyAddressSuggestion(existing, row, 'Plot 25 Sector 46')
  assert.equal(applied.houseNumber, 'Plot 99-B')
  assert.equal(applied.floor, existing.floor)
  assert.equal(applied.building, existing.building)
  assert.equal(applied.locality, 'Sector 46')
  assert.equal(applied.pincode, '122003')
  const partial = applyAddressSuggestion({}, searchLocalDirectory('House 42 Sector 15')[0], 'House 42 Sector 15')
  assert.equal(partial.houseNumber, 'House 42')
  assert.equal(partial.pincode, '')
  assert.equal(applyAddressSuggestion(existing, { locality: 'Unknown pin' }, '').pincode, '')
})

test('legacy addresses retain complete lines without guessing components', () => {
  const old = { line1: '42, Tower B, 2nd Floor', line2: 'Old street, locality', pincode: '122003' }
  assert.deepEqual(composeAddressLines(editableAddress(old)), { line1: old.line1, line2: old.line2 })
})

test('bounded IP limiter rejects bursts and recovers after window', () => {
  let time = 1, count = 0, status
  const limit = addressSearchLimit({ limit: 2, maxKeys: 1, now: () => time })
  const res = { status(code) { status = code; return this }, set() { return this }, json() {} }
  const next = () => { count++ }
  limit({ ip: 'one' }, res, next); limit({ ip: 'one' }, res, next); limit({ ip: 'one' }, res, next)
  assert.equal(count, 2); assert.equal(status, 429)
  limit({ ip: 'two' }, res, next); assert.equal(count, 2)
  time += 60001
  limit({ ip: 'two' }, res, next); assert.equal(count, 3)
})

test('backend stores structured details and exact legacy lines, checks serviceability, and preserves old records', async () => {
  // Isolate storage in memory: no environment database writes or real accounts.
  const original = { customerFind: prisma.customer.findUnique, customerUpdate: prisma.customer.update,
    count: prisma.serviceablePincode.count, find: prisma.serviceablePincode.findUnique }
  let addresses = [{ id: 'legacy', line1: 'Old house', line2: 'Old street', pincode: '110001', private: 'unchanged' }]
  prisma.customer.findUnique = async () => ({ id: 'test', phone: '9999900000', addresses: structuredClone(addresses) })
  prisma.customer.update = async ({ data }) => { addresses = data.addresses }
  prisma.serviceablePincode.count = async () => 1
  prisma.serviceablePincode.findUnique = async ({ where }) => where.pincode === '122003'
    ? { pincode: '122003', isActive: true, morningEnabled: true, expressEnabled: false } : null
  try {
    const input = { addressDetailsVersion: 1, name: 'Test customer', houseNumber: 'Plot 25-B', floor: 'Rear portion, floor 2', building: 'Customer building', street: 'Block A', locality: 'Sector 46', city: 'Gurugram', state: 'Haryana', pincode: '122003' }
    const saved = await createAddress('test', input)
    assert.equal(saved.line1, 'Plot 25-B, Rear portion, floor 2, Customer building')
    assert.equal(saved.line2, 'Block A, Sector 46')
    assert.equal(saved.floor, input.floor)
    assert.equal(saved.addressDetailsVersion, 1)
    assert.equal(addresses[0].private, 'unchanged')
    await updateAddress('test', saved.id, { ...input, houseNumber: 'House 42-A' })
    assert.equal(addresses[1].houseNumber, 'House 42-A')
    for (const pincode of ['999999', '122010', '000000', 'abc122003', '1220037']) {
      await assert.rejects(createAddress('test', { ...input, pincode }))
    }
    assert.equal(addresses.length, 2)
    await updateAddress('test', saved.id, { ...input, addressDetailsVersion: undefined, line1: 'Native client edited house', line2: 'Native client edited street' })
    assert.equal(addresses[1].line1, 'Native client edited house')
    assert.equal(addresses[1].addressDetailsVersion, undefined)
    assert.equal(addresses[1].houseNumber, undefined)
    assert.equal(addresses[0].private, 'unchanged')
  } finally {
    prisma.customer.findUnique = original.customerFind; prisma.customer.update = original.customerUpdate
    prisma.serviceablePincode.count = original.count; prisma.serviceablePincode.findUnique = original.find
  }
})
