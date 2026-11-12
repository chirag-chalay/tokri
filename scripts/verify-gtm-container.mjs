import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const artifact = new URL('../docs/tracking/gtm/tokriii-gtm-container.json', import.meta.url)
const text = await readFile(artifact, 'utf8')
const file = JSON.parse(text)
const c = file.containerVersion
assert.equal(file.exportFormatVersion, 2)
assert.equal(c.tag.length, 6)
assert.equal(c.trigger.length, 4)
assert.equal(c.variable.length, 6)
assert.equal(c.customTemplate.length, 1)
const variables = new Set(['_event', ...c.variable.map((v) => v.name), ...c.builtInVariable.map((v) => v.name)])
for (const tag of c.tag) {
  for (const ref of tag.firingTriggerId) assert.ok(['2147479572', '2147479573', ...c.trigger.map((t) => t.triggerId)].includes(ref), `Unknown trigger in ${tag.name}`)
  for (const match of JSON.stringify(tag.parameter).matchAll(/\{\{([^}]+)\}\}/g)) assert.ok(variables.has(match[1]), `Unknown variable: ${match[1]}`)
  if (tag.type === 'cvt_0_1') assert.equal(tag.consentSettings.consentStatus, 'NOT_NEEDED')
  else assert.equal(tag.consentSettings.consentType.list[0].value, 'analytics_storage')
}
assert.equal(c.customTemplate[0].templateId, '1')
assert.equal(c.customTemplate[0].containerId, '0')
const tpl = c.customTemplate[0].templateData
assert.equal(tpl, await readFile(new URL('../docs/tracking/gtm/tokri-consent.tpl', import.meta.url), 'utf8'))
const code = tpl.split('___SANDBOXED_JS_FOR_WEB_TEMPLATE___')[1].split('___WEB_PERMISSIONS___')[0]
const types = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']
for (const [mode, raw] of [['default', null], ['default', { analytics_storage: 'granted' }], ['update', { analytics_storage: 'denied', ad_storage: 'granted', ad_user_data: 'other' }]]) {
  let applied; let succeeded = false
  runInNewContext(code, {
    data: { mode, gtmOnSuccess() { succeeded = true } },
    require(name) {
      if (name === 'copyFromDataLayer') return (key, version) => { assert.equal(key, 'tracking_consent'); assert.equal(version, 2); return raw }
      if (name === 'setDefaultConsentState') return (state) => { assert.equal(mode, 'default'); applied = state }
      if (name === 'updateConsentState') return (state) => { assert.equal(mode, 'update'); applied = state }
      throw Error('Unexpected permission/API')
    },
  })
  assert.equal(succeeded, true)
  for (const type of types) assert.equal(applied[type], raw?.[type] === 'granted' ? 'granted' : 'denied')
}
const ecommerce = c.trigger.find((t) => t.name === 'Tokri - Ecommerce')
const regex = new RegExp(ecommerce.customEventFilter[0].parameter.find((p) => p.key === 'arg1').value)
for (const name of ['view_item', 'add_to_cart', 'remove_from_cart', 'view_cart', 'begin_checkout', 'add_payment_info', 'purchase']) assert.ok(regex.test(name))
for (const name of ['page_view', 'tokri_consent_update', 'purchase_fake']) assert.equal(regex.test(name), false)
try {
  const env = await readFile(new URL('../server/.env', import.meta.url), 'utf8')
  for (const key of ['META_CAPI_ACCESS_TOKEN', 'META_CAPI_TEST_EVENT_CODE']) {
    const line = env.split('\n').find((line) => line.startsWith(`${key}=`))
    const value = line?.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '')
    if (value) assert.equal(text.includes(value), false, 'Private credential must not appear in export')
  }
} catch (error) { if (error.code !== 'ENOENT') throw error }
console.log('GTM artifact checks passed: references, consent behavior, ecommerce routing, and credential exclusion.')
console.log('GTM account import preview and actual Google event receipt still require account-side verification.')
