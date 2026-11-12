import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'docs/tracking/gtm')
await mkdir(output, { recursive: true })
// Only this public identifier is read. Never serialize environment contents.
let publicId = 'GTM-PLACEHOLDER'
try {
  const env = await readFile(path.join(root, 'server/.env'), 'utf8')
  const match = env.match(/^TRACKING_GTM_CONTAINER_ID\s*=\s*["']?(GTM-[A-Z0-9]+)["']?\s*$/m)
  if (match) publicId = match[1]
} catch { /* Artifact can be built without private environment files. */ }

const consentTypes = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']
const code = `const copyFromDataLayer = require('copyFromDataLayer');
const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const raw = copyFromDataLayer('tracking_consent', 2) || {};
const state = {};
['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'].forEach(function(key) {
  state[key] = raw[key] === 'granted' ? 'granted' : 'denied';
});
if (data.mode === 'update') updateConsentState(state);
else setDefaultConsentState(state);
data.gtmOnSuccess();`
const stringValue = (string) => ({ type: 1, string })
const booleanValue = (boolean) => ({ type: 8, boolean })
const permission = (publicId, param) => ({ instance: { key: { publicId, versionId: '1' }, param }, clientAnnotations: { isEditedByUser: true }, isRequired: true })
const permissions = [
  permission('read_data_layer', [
    { key: 'allowedKeys', value: stringValue('specific') },
    { key: 'keyPatterns', value: { type: 2, listItem: [stringValue('tracking_consent')] } },
  ]),
  permission('access_consent', [{ key: 'consentTypes', value: { type: 2, listItem: consentTypes.map((name) => ({ type: 3, mapKey: [stringValue('consentType'), stringValue('read'), stringValue('write')], mapValue: [stringValue(name), booleanValue(false), booleanValue(true)] })) } }]),
]
const sections = [
  ['INFO', { type: 'TAG', id: 'cvt_TOKRIIICONSENT', version: 1, displayName: 'Tokri - Consent state', description: 'Apply the website consent state using GTM consent APIs. Missing or invalid choices are denied.', categories: ['UTILITY'], containerContexts: ['WEB'], securityGroups: [] }],
  ['TEMPLATE_PARAMETERS', [{ type: 'SELECT', name: 'mode', displayName: 'Consent command', selectItems: [{ value: 'default', displayValue: 'Default' }, { value: 'update', displayValue: 'Update' }], simpleValueType: true, defaultValue: 'default', alwaysInSummary: true }]],
  ['SANDBOXED_JS_FOR_WEB_TEMPLATE', code],
  ['WEB_PERMISSIONS', permissions],
  ['TESTS', 'scenarios: []'],
  ['NOTES', 'Tokri website consent adapter. No network, cookie, token or arbitrary global access.'],
]
const template = sections.map(([name, value]) => `___${name}___\n\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`).join('\n\n\n') + '\n'
await writeFile(path.join(output, 'tokri-consent.tpl'), template)

// Zero source account/container IDs are portable export identifiers. GTM remaps
// these and the cvt_0_1 template reference into the selected target container.
const meta = { accountId: '0', containerId: '0' }
const text = (key, value) => ({ type: 'TEMPLATE', key, value })
const bool = (key, value) => ({ type: 'BOOLEAN', key, value: String(value) })
const settingsTable = (key, entries) => ({ type: 'LIST', key, list: Object.entries(entries).map(([parameter, value]) => ({ type: 'MAP', map: [text('parameter', parameter), text('parameterValue', value)] })) })
const analyticsConsent = { consentStatus: 'NEEDED', consentType: { type: 'LIST', list: [{ type: 'TEMPLATE', value: 'analytics_storage' }] } }
const tag = (id, name, type, parameter, triggers, consentSettings = analyticsConsent) => ({ ...meta, tagId: String(id), name, type, parameter, firingTriggerId: triggers, tagFiringOption: 'ONCE_PER_EVENT', consentSettings })
const trigger = (id, name, event, regex = false) => ({ ...meta, triggerId: String(id), name, type: 'CUSTOM_EVENT', customEventFilter: [{ type: regex ? 'MATCH_REGEX' : 'EQUALS', parameter: [text('arg0', '{{_event}}'), text('arg1', event)] }] })
const variables = [
  ['DLV - GA4 Measurement ID', 'tracking.ga4_measurement_id'],
  ['DLV - Page Location', 'page_location'],
  ['DLV - Page Path', 'page_path'],
  ['DLV - Event ID', 'event_id'],
  ['DLV - Search Term', 'search_term'],
  ['DLV - Payment Type', 'payment_type'],
].map(([name, dataName], index) => ({ ...meta, variableId: String(index + 1), name, type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, bool('setDefaultValue', false), text('name', dataName)] }))
const eventParameters = { event_id: '{{DLV - Event ID}}', page_location: '{{DLV - Page Location}}', page_path: '{{DLV - Page Path}}' }
const eventTag = (id, name, eventName, triggerId, extra = {}, ecommerce = false) => tag(id, name, 'gaawe', [text('measurementIdOverride', '{{DLV - GA4 Measurement ID}}'), text('eventName', eventName), bool('sendEcommerceData', ecommerce), ...(ecommerce ? [text('getEcommerceDataFrom', 'dataLayer')] : []), bool('enhancedUserId', false), settingsTable('eventSettingsTable', { ...eventParameters, ...extra })], [triggerId])
const container = {
  exportFormatVersion: 2,
  exportTime: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
  containerVersion: {
    ...meta, containerVersionId: '0', name: 'Tokriii runtime tracking',
    container: { ...meta, name: 'Tokriii Web Marketing', publicId, usageContext: ['WEB'] },
    tag: [
      tag(1, 'Tokri - Consent default', 'cvt_0_1', [text('mode', 'default')], ['2147479572'], { consentStatus: 'NOT_NEEDED' }),
      tag(2, 'Tokri - Consent update', 'cvt_0_1', [text('mode', 'update')], ['1'], { consentStatus: 'NOT_NEEDED' }),
      tag(3, 'Tokri - Google tag', 'googtag', [text('tagId', '{{DLV - GA4 Measurement ID}}'), settingsTable('configSettingsTable', { send_page_view: 'false', page_location: '{{DLV - Page Location}}' })], ['2147479573']),
      eventTag(4, 'Tokri - Page view', 'page_view', '2'),
      eventTag(5, 'Tokri - Ecommerce', '{{Event}}', '3', { payment_type: '{{DLV - Payment Type}}' }, true),
      eventTag(6, 'Tokri - Search', 'search', '4', { search_term: '{{DLV - Search Term}}' }),
    ],
    trigger: [
      trigger(1, 'Tokri - Consent changed', 'tokri_consent_update'),
      trigger(2, 'Tokri - Page view', 'page_view'),
      trigger(3, 'Tokri - Ecommerce', '^(view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_payment_info|purchase)$', true),
      trigger(4, 'Tokri - Search', 'search'),
    ],
    variable: variables,
    builtInVariable: [{ ...meta, type: 'EVENT', name: 'Event' }],
    customTemplate: [{ ...meta, templateId: '1', name: 'Tokri - Consent state', templateData: template }],
  },
}
await writeFile(path.join(output, 'tokriii-gtm-container.json'), JSON.stringify(container, null, 2) + '\n')
console.log('Created GTM container JSON and consent template (no private credentials).')
