import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { isMainThread } from 'node:worker_threads'
import os from 'node:os'
import path from 'node:path'
import { registerHooks } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'

// Import before application modules. No live .env, database or external credentials are loaded.
const url = new URL(process.env.MONITORING_TEST_DATABASE_URL || 'mysql://invalid/unsafe')
if (url.protocol !== 'mysql:' || !['127.0.0.1', 'localhost'].includes(url.hostname) || url.port === '3306' || !/test|review/.test(url.pathname)) {
  throw new Error('Provide an explicitly isolated loopback MONITORING_TEST_DATABASE_URL on a nonstandard port and a test/review database.')
}
const root = process.env.MONITORING_TEST_ARTIFACTS || fs.mkdtempSync(path.join(os.tmpdir(), 'tokri-integration-'))
fs.mkdirSync(root, { recursive: true })
// Rollup helpers and child eval modules resolve packages from the isolated cwd.
const modules = path.join(root, 'node_modules')
if (!fs.existsSync(modules)) fs.symlinkSync(fileURLToPath(new URL('../../node_modules', import.meta.url)), modules, 'dir')
if (isMainThread) process.chdir(root)
Object.assign(process.env, {
  DATABASE_URL: url.href, NODE_ENV: 'test', LOG_DIRECTORY: path.join(root, 'logs'),
  ADMIN_JS_TMP_DIR: path.join(root, 'adminjs'), SESSION_SECRET: 'isolated-test-session-only',
  JWT_SECRET: 'isolated-test-jwt-only', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '',
  RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '', RAZORPAY_WEBHOOK_SECRET: '',
  MSG91_AUTH_KEY: '', FCM_SERVICE_ACCOUNT: '', TOKRIII_NEXT_ORIGIN: '',
  ADMIN_PATH: '/review-admin', APP_URL: 'http://127.0.0.1:33380', CLIENT_URL: 'http://127.0.0.1:33380',
  API_URL: 'http://127.0.0.1:33380', LOG_OUTBOX_DESTINATION: `test-${createHash('sha256').update(root).digest('hex').slice(0, 20)}`, LOG_QUEUE_LIMIT: '2000', LOG_OUTBOX_ENABLED: 'true', LOG_OUTBOX_POLL_MS: '100',
})
export { root }

if (process.env.MONITORING_TEST_PRISMA_CLIENT) {
  const clientUrl = pathToFileURL(process.env.MONITORING_TEST_PRISMA_CLIENT).href
  registerHooks({ resolve(specifier, context, nextResolve) { return nextResolve(specifier === '@prisma/client' ? clientUrl : specifier, context) } })
}
