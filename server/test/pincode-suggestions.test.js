import test from 'node:test'
import assert from 'node:assert/strict'
import { pincodeSuggestions } from '../src/services/pincodeSuggestions.js'
import { deliveryAvailability } from '../src/services/delivery.js'

const row = (pincode, extra = {}) => ({ pincode, areaLabel: '', isActive: true, morningEnabled: true, expressEnabled: false, ...extra })

test('only configured eligible valid pincodes are suggested, with existing labels', async () => {
  let query
  const db = { serviceablePincode: { findMany: async (args) => {
    query = args
    return [row('122003', { areaLabel: ' Sector 45 ' }), row('122003'),
      row('122002', { morningEnabled: false, expressEnabled: true }),
      row('201303', { morningEnabled: false }), row('201304', { isActive: false }),
      row('000000'), row('20130'), row('110001')]
  } } }
  assert.deepEqual(await pincodeSuggestions('2', db), [
    { pincode: '122003', areaLabel: 'Sector 45' }, { pincode: '122002', areaLabel: '' },
  ])
  assert.equal(query.where.isActive, true)
  assert.deepEqual(query.where.OR, [{ morningEnabled: true }, { expressEnabled: true }])
  assert.deepEqual(await pincodeSuggestions('220', db), [
    { pincode: '122003', areaLabel: 'Sector 45' }, { pincode: '122002', areaLabel: '' },
  ])
})

test('invalid input never queries storage; empty network invents no serviceable locations', async () => {
  for (const term of ['', '1234567', '2a', ['2'], null]) {
    assert.deepEqual(await pincodeSuggestions(term, {}), [])
  }
  assert.deepEqual(await pincodeSuggestions('2', { serviceablePincode: { findMany: async () => [] } }), [])
})

test('results are bounded and storage failures propagate to the API error handler', async () => {
  const rows = Array.from({ length: 60 }, (_, n) => row(String(200000 + n)))
  assert.equal((await pincodeSuggestions('2', { serviceablePincode: { findMany: async () => rows } })).length, 50)
  await assert.rejects(pincodeSuggestions('2', { serviceablePincode: { findMany: async () => { throw new Error('offline') } } }), /offline/)
})

test('Morning and Same Day eligibility remain independent', () => {
  const morning = deliveryAvailability(row('201301'))
  const express = deliveryAvailability(row('122002', { morningEnabled: false, expressEnabled: true }))
  assert.equal(morning.morning.enabled, true)
  assert.equal(morning.express.enabled, false)
  assert.equal(express.morning.enabled, false)
  assert.equal(express.express.enabled, true)
  assert.equal(deliveryAvailability(row('201303', { isActive: false })).serviceable, false)
})

test('unverified and mismatched locality labels are suppressed', async () => {
  const db = { serviceablePincode: { findMany: async () => [row('110092', { areaLabel: 'Adarsh Nagar' }), row('110033', { areaLabel: 'Adarsh Nagar' }), row('110024', { areaLabel: 'Invented' })] } }
  assert.deepEqual(await pincodeSuggestions('1', db), [
    { pincode: '110092', areaLabel: '' }, { pincode: '110033', areaLabel: 'Adarsh Nagar' }, { pincode: '110024', areaLabel: '' },
  ])
})
