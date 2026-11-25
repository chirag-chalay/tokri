const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const source = fs.readFileSync(path.join(__dirname, '../src/lib/storeUpdate.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')

function moduleFor(globals = {}) {
  const scope = {
    APPLE_APP_ID: '6822043083',
    STORE_PACKAGE: 'com.tokriii.app',
    __DEV__: false,
    AbortController, setTimeout, clearTimeout,
    appBuild: () => 51,
    Constants: { expoConfig: { android: { package: 'com.tokriii.app' } } },
    Platform: { OS: 'android' },
    module: { exports: {} },
    ...globals,
  }
  vm.runInNewContext(source + '\nmodule.exports = { compareStoreVersions, matchAppleUpdate, getStoreUpdate }', scope)
  return scope.module.exports
}

test('Apple recommendations require a newer version for Tokriii that supports the installed iOS', () => {
  const { compareStoreVersions, matchAppleUpdate } = moduleFor()
  const app = { trackId: 6822043083, bundleId: 'com.tokriii.app', version: '1.10.0', minimumOsVersion: '16.4' }
  assert.equal(compareStoreVersions('1.10.0', '1.2.0'), 1)
  assert.equal(compareStoreVersions('1.2', '1.2.0'), 0)
  assert.equal(compareStoreVersions('unknown', '1.2.0'), null)
  assert.equal(matchAppleUpdate([app], '1.2.0', '17').id, 'ios-1.10.0')
  assert.equal(matchAppleUpdate([app], '1.10.0', '17'), null)
  assert.equal(matchAppleUpdate([app], '1.2.0', '16.3'), null)
  assert.equal(matchAppleUpdate([{ ...app, bundleId: 'com.unrelated.app' }], '1.2.0', '17'), null)
})

test('Android probes the installing Play Store once per interval and fails open', async () => {
  let calls = 0
  const { getStoreUpdate } = moduleFor({
    requireOptionalNativeModule: () => ({
      getAvailableBuild: async () => { calls++; return 52 },
    }),
  })
  assert.equal((await getStoreUpdate()).id, 'android-52')
  assert.equal((await getStoreUpdate()).build, 52)
  assert.equal(calls, 1)
  const unavailable = moduleFor({ requireOptionalNativeModule: () => ({ getAvailableBuild: async () => { throw Error('Play unavailable') } }) })
  assert.equal(await unavailable.getStoreUpdate(), null)
  const staging = moduleFor({ Constants: { expoConfig: { android: { package: 'com.tokriii.app.staging' } } } })
  assert.equal(await staging.getStoreUpdate(), undefined)
})
