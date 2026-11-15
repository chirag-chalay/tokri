const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const scope = { module: { exports: {} } }
const source = fs.readFileSync(path.join(__dirname, '../src/lib/trackingPreferences.js'), 'utf8').replace('export async function', 'async function')
vm.runInNewContext(source + '\nmodule.exports = { restoreTrackingPreferences }', scope)
const restore = scope.module.exports.restoreTrackingPreferences
function storage(values = []) {
  const data = new Map(values)
  return { data, getItem: async (key) => data.get(key) ?? null, setItem: async (key, value) => data.set(key, value) }
}
test('automatic defaults are recorded separately from explicit agreement and applied only once', async () => {
  const store = storage()
  const first = await restore(store, true, true)
  assert.equal(first.defaultApplied, true)
  assert.equal(first.values[0], 'default_allowed')
  assert.equal(first.values[1], 'default_allowed')
  assert.equal((await restore(store, true, true)).defaultApplied, false)
})
test('existing refusals survive default changes and unavailable Meta stays unknown', async () => {
  const store = storage([['tokri_analytics_consent_v1', 'denied'], ['tokri_marketing_consent_v1', 'denied']])
  const restored = await restore(store, true, true)
  assert.equal(restored.values[0], 'denied')
  assert.equal(restored.values[1], 'denied')
  assert.equal(restored.defaultApplied, false)
  const noMeta = await restore(storage(), true, false)
  assert.equal(noMeta.values[1], null)
  const optIn = await restore(storage(), false, true)
  assert.equal(optIn.values[0], null)
  assert.equal(optIn.values[1], null)
})
