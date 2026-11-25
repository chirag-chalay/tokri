const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

test('bounded config requests abort stalled response bodies and allow later retry', async () => {
  let hanging = true, aborted = false
  const scope = {
    API_BASE_URL: 'https://example.test/api/v1', appBuild: () => 1, appPlatform: () => 'android',
    __DEV__: false, AbortController, setTimeout, clearTimeout, module: { exports: {} },
    fetch: async (_url, options) => {
      options.signal?.addEventListener('abort', () => { aborted = true })
      return { ok: true, json: () => hanging ? new Promise(() => {}) : Promise.resolve({ enabled: true }) }
    },
  }
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/api.js'), 'utf8')
    .replace(/^import .*$/gm, '').replace(/^export (async )?function /gm, '$1function ')
  vm.runInNewContext(source + '\nmodule.exports={fetchJson}', scope)
  await assert.rejects(scope.module.exports.fetchJson('/checkout/app-tracking-config', { timeoutMs: 20 }), /timed out/)
  assert.equal(aborted, true)
  hanging = false
  assert.equal((await scope.module.exports.fetchJson('/checkout/app-tracking-config', { timeoutMs: 100 })).enabled, true)
})
