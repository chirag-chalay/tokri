#!/usr/bin/env node
// Install this reviewed controller under /opt/tokri-staging, owned by root.
// It runs as the dedicated staging user, NEVER as root or the production user.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { BASELINE, MIGRATION_HASH, REPOSITORY, SITE, requireSha, inside, validateConfig, verifyIsolation, schemaState, assertRunnerEvent, assertPm2, assertListeners, activateWithRollback } from './policy.mjs'
import { verifyJobRun } from './oidc.mjs'
import { verifyPublic } from './verify-public.mjs'

const CONFIG = '/etc/tokri-staging.json'
const [mode, requestedSha] = process.argv.slice(2)
const manual = ['bootstrap', 'rollback'].includes(mode)
const controllerFiles = [CONFIG, ...['deploy.mjs', 'policy.mjs', 'verify-public.mjs', 'oidc.mjs', 'authenticate.mjs', 'request-deploy.mjs', 'discount-migration.sql'].map(name => `/opt/tokri-staging/${name}`)]
for (const file of [...controllerFiles, '/opt/tokri-staging/run.sh', '/opt/tokri-staging', '/opt', '/etc']) {
  assert.ok(!fs.lstatSync(file).isSymbolicLink(), 'Controller/configuration symlinks are forbidden')
  const stat = fs.statSync(file)
  assert.equal(stat.uid, 0, 'Controller/configuration must be owned by root')
  assert.equal(stat.mode & 0o022, 0, 'Controller/configuration cannot be group/world writable')
}
assert.notEqual(process.getuid(), 0, 'Never run deployments as root')
assert.equal(fs.realpathSync(process.argv[1]), '/opt/tokri-staging/deploy.mjs')
assert.ok(['preflight', 'deploy', 'migrate-discounts', 'bootstrap', 'rollback'].includes(mode))
if (manual) assert.ok(!process.env.GITHUB_ACTIONS, 'Bootstrap/rollback CLI is for the authenticated terminal only')
else { assert.equal(process.env.TOKRIII_STAGING_AUTHENTICATED, '1', 'Signed GitHub job authorization is required'); assertRunnerEvent(process.env); requireSha(requestedSha); assert.equal(requestedSha, process.env.EXPECTED_SHA) }
const config = validateConfig(JSON.parse(fs.readFileSync(CONFIG, 'utf8')))
const root = fs.realpathSync(config.root)
assert.equal(root, config.root)
const shared = inside(root, path.join(root, 'shared'))
const state = inside(root, path.join(root, 'state'))
const releases = inside(root, path.join(root, 'releases'))
for (const directory of [shared, state, releases, config.pm2Home, path.join(root, 'backups')]) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  inside(root, fs.realpathSync(directory))
}
const envFile = path.join(shared, 'server.env')
const uploads = path.join(shared, 'uploads')
inside(root, fs.realpathSync(envFile)); inside(root, fs.realpathSync(uploads))
assert.equal(fs.statSync(envFile).mode & 0o007, 0, 'Shared environment must not be world readable')
const require = createRequire(config.probeClientModule)
const { PrismaClient } = require(config.probeClientModule)
const sourceEnv = require('dotenv').parse(fs.readFileSync(envFile))
const connection = new URL(sourceEnv.DATABASE_URL)
assert.equal(connection.protocol, 'mysql:')
assert.equal(decodeURIComponent(connection.pathname.slice(1)), config.stagingIdentity.database)
const smokeFile = path.join(shared, 'smoke-admin.env')
const smoke = mode === 'deploy' && fs.existsSync(smokeFile) ? require('dotenv').parse(fs.readFileSync(smokeFile)) : {}
if (fs.existsSync(smokeFile)) { inside(shared, fs.realpathSync(smokeFile)); assert.equal(fs.statSync(smokeFile).mode & 0o077, 0, 'Smoke credentials must be private') }
const appEnv = {
  ...sourceEnv, PATH: process.env.PATH, HOME: process.env.HOME, PM2_HOME: config.pm2Home,
  NODE_ENV: 'production', PORT: String(config.apiPort), CLIENT_URL: SITE, APP_URL: SITE,
  API_URL: SITE, PUBLIC_ASSET_URL: SITE, TRUST_PROXY: 'true',
  TOKRIII_NEXT_ORIGIN: `http://127.0.0.1:${config.nextPort}`,
  TOKRIII_SERVER_API_ORIGIN: `http://127.0.0.1:${config.apiPort}`,
  TOKRIII_API_PROXY_TARGET: `http://127.0.0.1:${config.apiPort}`,
  TOKRIII_INDEXING_ENABLED: 'false', TOKRIII_GA_MEASUREMENT_ID: '', VITE_GA_MEASUREMENT_ID: '',
  VITE_API_BASE_URL: '/api/v1', ADMIN_JS_SKIP_BUNDLE: 'true',
}
const database = new PrismaClient({ datasources: { db: { url: sourceEnv.DATABASE_URL } } })
assert.equal(process.env.TOKRIII_STAGING_LOCKED, '1', 'Use the installed run.sh launcher to acquire the OS deployment lock')
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', env: appEnv, maxBuffer: 10 * 1024 * 1024, ...options })
  if (result.error || result.status !== 0) throw new Error(`${path.basename(command)} failed (${result.status ?? 'spawn'}); inspect staging logs`)
  return result.stdout?.trim() || ''
}
function git(args) { return run('git', ['--git-dir', path.join(root, 'repository.git'), ...args]) }
function selectedRelease() {
  const release = fs.realpathSync(path.join(root, 'current'))
  inside(releases, release); requireSha(path.basename(release)); return release
}
function processes() {
  assert.ok(fs.existsSync(path.join(config.pm2Home, 'rpc.sock')), 'Dedicated staging PM2 daemon is not running; complete bootstrap')
  return JSON.parse(run('pm2', ['jlist']))
}
async function isolation() {
  try {
    const [identity] = await database.$queryRawUnsafe('SELECT DATABASE() AS `database`, @@server_uuid AS serverUuid')
    const grants = (await database.$queryRawUnsafe('SHOW GRANTS')).map(row => Object.values(row)[0])
    verifyIsolation(config, identity, grants)
    const [settings] = await database.$queryRawUnsafe('SELECT razorpayEnabled, razorpayKeyId, msg91Enabled, msg91WhatsappEnabled FROM Setting WHERE id = 1')
    assert.ok(settings, 'Existing staging settings record is required')
    assert.ok(!settings.razorpayEnabled || String(settings.razorpayKeyId || sourceEnv.RAZORPAY_KEY_ID || '').startsWith('rzp_test_'), 'Staging must not use live Razorpay')
    assert.ok(!settings.msg91Enabled && !settings.msg91WhatsappEnabled, 'Disable live staging messaging before enabling CI/CD')
  } catch { throw new Error('Database isolation/grants or staging payment/messaging safety check failed; no deployment is permitted') }
}
async function schema() {
  const tables = await database.$queryRawUnsafe("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AutomaticDiscount'")
  const columns = await database.$queryRawUnsafe("SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND ((TABLE_NAME = 'Order' AND COLUMN_NAME = 'automaticDiscount') OR (TABLE_NAME = 'OrderItem' AND COLUMN_NAME = 'discount'))")
  const rows = tables.length ? await database.$queryRawUnsafe('SELECT id, enabled FROM AutomaticDiscount WHERE id = 1') : []
  return schemaState({ table: tables.length > 0, orderColumn: columns.some(row => row.TABLE_NAME === 'Order'), lineColumn: columns.some(row => row.TABLE_NAME === 'OrderItem'), configRow: rows.length > 0 })
}
function checkSpace() {
  const disk = fs.statfsSync(root)
  assert.ok(disk.bavail * disk.bsize >= (config.minimumFreeBytes || 3221225472), 'Insufficient free disk space')
  assert.match(process.version, /^v22\./, 'Provision Node 22 before enabling the runner')
  fs.accessSync(config.browserExecutable, fs.constants.X_OK)
}
function verifySource(sha) {
  assert.equal(git(['remote', 'get-url', 'origin']), `https://github.com/${REPOSITORY}.git`)
  git(['fetch', '--no-tags', 'origin', 'refs/heads/staging:refs/remotes/origin/staging'])
  assert.equal(git(['rev-parse', 'refs/remotes/origin/staging']), sha, 'Superseded staging run; rerun the latest workflow')
  git(['merge-base', '--is-ancestor', BASELINE, sha])
}
function mysqlConfig() {
  const escape = value => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  return '[client]\n' + Object.entries({ host: connection.hostname, port: connection.port || '3306', user: decodeURIComponent(connection.username), password: decodeURIComponent(connection.password) }).map(([key, value]) => `${key}="${escape(value)}"`).join('\n') + '\n'
}
async function backup(label) {
  await isolation(); checkSpace()
  const previous = selectedRelease()
  const directory = path.join(root, 'backups', `${new Date().toISOString().replace(/[:.]/g, '-')}-${label}`)
  fs.mkdirSync(directory, { mode: 0o700 })
  const credentials = path.join(directory, '.mysql.cnf')
  fs.writeFileSync(credentials, mysqlConfig(), { mode: 0o600 })
  const dump = path.join(directory, 'database.sql')
  const fd = fs.openSync(dump, 'wx', 0o600)
  try {
    run('mysqldump', [`--defaults-extra-file=${credentials}`, '--single-transaction', '--no-tablespaces', '--set-gtid-purged=OFF', '--routines', '--events', '--triggers', '--hex-blob', config.stagingIdentity.database], { stdio: ['ignore', fd, 'pipe'] })
  } finally { fs.closeSync(fd); fs.unlinkSync(credentials) }
  assert.ok(fs.statSync(dump).size > 100, 'Database backup is empty')
  run('gzip', [dump]); run('gzip', ['--test', `${dump}.gz`])
  fs.copyFileSync(envFile, path.join(directory, 'server.env')); fs.chmodSync(path.join(directory, 'server.env'), 0o600)
  if (fs.existsSync(smokeFile)) { fs.copyFileSync(smokeFile, path.join(directory, 'smoke-admin.env')); fs.chmodSync(path.join(directory, 'smoke-admin.env'), 0o600) }
  fs.copyFileSync(CONFIG, path.join(directory, 'controller-config.json')); fs.chmodSync(path.join(directory, 'controller-config.json'), 0o600)
  fs.writeFileSync(path.join(directory, 'pm2.json'), JSON.stringify(processes()), { mode: 0o600 })
  for (const [name, source] of [['uploads', uploads], ['release', previous]]) {
    run('tar', ['-czf', path.join(directory, `${name}.tar.gz`), '-C', source, '.'])
    run('tar', ['-tzf', path.join(directory, `${name}.tar.gz`)], { stdio: ['ignore', 'ignore', 'pipe'] })
  }
  fs.writeFileSync(path.join(directory, 'receipt.json'), JSON.stringify({ previous, database: config.stagingIdentity, createdAt: new Date().toISOString() }), { mode: 0o600 })
  console.error(`Verified backup archives: ${directory}`)
  return directory
}
function writeMarker(release) {
  fs.writeFileSync(path.join(release, 'public', '__tokri_staging_release.json'), JSON.stringify({ sha: path.basename(release), environment: 'staging', site: SITE }))
}
function ecosystem(release) {
  return { apps: [
    { name: config.apiProcess, script: path.join(release, 'server/src/server.js'), cwd: path.join(release, 'server'), interpreter: process.execPath, env: appEnv, instances: 1, exec_mode: 'fork', autorestart: true },
    { name: config.nextProcess, script: path.join(release, 'node_modules/next/dist/bin/next'), args: ['start', '--hostname', '127.0.0.1', '--port', String(config.nextPort)], cwd: release, interpreter: process.execPath, env: appEnv, instances: 1, exec_mode: 'fork', autorestart: true },
  ] }
}
function activate(release) {
  inside(releases, fs.realpathSync(release)); requireSha(path.basename(release))
  const temp = path.join(root, `current.${process.pid}`)
  fs.symlinkSync(release, temp); fs.renameSync(temp, path.join(root, 'current'))
  const ecosystemFile = path.join(state, 'ecosystem.json')
  fs.writeFileSync(ecosystemFile, JSON.stringify(ecosystem(release)), { mode: 0o600 })
  run('pm2', ['startOrReload', ecosystemFile, '--only', `${config.apiProcess},${config.nextProcess}`, '--update-env'])
}
async function verify(release, browser = false) {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const currentProcesses = processes()
      assertPm2(config, currentProcesses, release)
      assertListeners(config, currentProcesses, run('ss', ['-ltnp']))
      const health = await fetch(`${SITE}/api/v1/health`, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000) })
      assert.equal(health.status, 200); assert.equal((await health.json()).ok, true)
      const marker = await fetch(`${SITE}/__tokri_staging_release.json?sha=${path.basename(release)}`, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000) })
      assert.equal(marker.status, 200); assert.equal((await marker.json()).sha, path.basename(release))
      break
    } catch (error) {
      if (attempt === 29) throw error
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  // Browser/authentication failures are not retried: verify once, then roll back.
  if (browser) await verifyPublic({ release, credentials: smoke, config: { ...config, adminPath: sourceEnv.ADMIN_PATH || '/tokri-backoffice', diwaliEnv: { NEXT_PUBLIC_FORCE_DIWALI: sourceEnv.NEXT_PUBLIC_FORCE_DIWALI, NEXT_PUBLIC_DIWALI_MODE: sourceEnv.NEXT_PUBLIC_DIWALI_MODE } }, expectOff: fs.existsSync(path.join(state, 'discount-initial-verification-pending')), output: path.join(state, 'verification', path.basename(release)) })
}
function build(sha) {
  const release = path.join(releases, sha)
  if (fs.existsSync(release)) {
    // Preserve a failed attempt and allow a workflow rerun without a new application commit.
    const failed = path.join(state, 'failed-releases')
    fs.mkdirSync(failed, { recursive: true, mode: 0o700 })
    fs.renameSync(release, path.join(failed, `${sha}-${Date.now()}`))
  }
  fs.mkdirSync(release, { mode: 0o700 })
  const archive = path.join(state, `${sha}.tar`)
  git(['archive', '--format=tar', `--output=${archive}`, sha])
  run('tar', ['-xf', archive, '-C', release]); fs.unlinkSync(archive)
  inside(release, fs.realpathSync(path.join(release, 'server')))
  assert.ok(!fs.existsSync(path.join(release, 'server/.env')), 'Tracked .env is forbidden')
  const releaseUploads = path.join(release, 'server/uploads')
  assert.ok(fs.readdirSync(releaseUploads).every(name => name === '.gitkeep'), 'Tracked uploads are forbidden')
  fs.rmSync(releaseUploads, { recursive: true }); fs.symlinkSync(uploads, releaseUploads, 'dir')
  fs.symlinkSync(envFile, path.join(release, 'server/.env'))
  writeMarker(release)
  run('npm', ['ci', '--ignore-scripts'], { cwd: release, stdio: 'inherit' })
  run('npm', ['ci', '--ignore-scripts'], { cwd: path.join(release, 'server'), stdio: 'inherit' })
  run(path.join(release, 'server/node_modules/.bin/prisma'), ['generate'], { cwd: path.join(release, 'server'), stdio: 'inherit' })
  run(path.join(release, 'server/node_modules/.bin/prisma'), ['migrate', 'diff', '--from-schema-datasource', 'prisma/schema.prisma', '--to-schema-datamodel', 'prisma/schema.prisma', '--exit-code'], { cwd: path.join(release, 'server'), stdio: 'inherit' })
  run('npm', ['run', 'build:next'], { cwd: release, stdio: 'inherit' })
  // AdminJS writes only after isolation, schema approval, and verified backups.
  run(process.execPath, ['--input-type=module', '-e', "const {buildAdminRouter}=await import('./src/admin/index.js');const {admin}=await buildAdminRouter();process.env.ADMIN_JS_SKIP_BUNDLE='false';await admin.initialize();const {prisma}=await import('./src/lib/prisma.js');await prisma.$disconnect();process.exit(0)"], { cwd: path.join(release, 'server'), stdio: 'inherit' })
  return release
}
try {
  checkSpace(); await isolation()
  const previous = selectedRelease()
  if (mode === 'bootstrap') {
    run('pm2', ['ping'], { stdio: ['ignore', 'ignore', 'pipe'] })
    await backup('bootstrap'); writeMarker(previous); activate(previous); await verify(previous)
    run('pm2', ['save']); console.log('Dedicated staging PM2 baseline is healthy. CI/CD is still gated by GitHub configuration.')
  } else if (mode === 'rollback') {
    const receiptPath = fs.existsSync(path.join(state, 'in-progress.json')) ? path.join(state, 'in-progress.json') : path.join(state, 'last-deployment.json')
    const receipt = JSON.parse(fs.readFileSync(receiptPath))
    const target = receipt.previous
    inside(releases, fs.realpathSync(target)); await backup('manual-rollback')
    await activateWithRollback({ previous, candidate: target, activate, verify })
    run('pm2', ['save']); console.log(`Verified rollback to ${path.basename(target)}`)
  } else {
    verifySource(requestedSha); assertPm2(config, processes(), previous)
    const status = await schema()
    if (mode === 'preflight') {
      console.log(`schema=${status}`)
      if (status === 'pending') console.error('Discount migration needs its separate approval. Deployment will not run against an unprepared schema.')
    } else if (mode === 'migrate-discounts') {
      if (status === 'ready') console.log('Discount schema already present; no SQL executed.')
      else {
        const sql = fs.readFileSync('/opt/tokri-staging/discount-migration.sql', 'utf8')
        assert.equal(createHash('sha256').update(sql).digest('hex'), MIGRATION_HASH, 'Migration differs from the reviewed SQL')
        const backupPath = await backup('discount-migration'); await isolation()
        await verifyJobRun({ check_run_id: process.env.GITHUB_CHECK_RUN_ID, sha: requestedSha }, mode)
        for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await database.$executeRawUnsafe(statement)
        assert.equal(await schema(), 'ready')
        const [promotion] = await database.$queryRawUnsafe('SELECT enabled FROM AutomaticDiscount WHERE id = 1')
        assert.ok(!promotion.enabled, 'Initial promotion must be OFF')
        fs.writeFileSync(path.join(state, 'discount-initial-verification-pending'), requestedSha, { mode: 0o600 })
        fs.writeFileSync(path.join(state, 'discount-migration.json'), JSON.stringify({ hash: MIGRATION_HASH, backupPath, sha: requestedSha, at: new Date().toISOString() }), { mode: 0o600 })
        console.log('Reviewed discount migration applied once; promotion OFF.')
      }
    } else {
      assert.equal(status, 'ready', 'Deploy blocked: separately approve the migration first')
      assert.ok(smoke.STAGING_SMOKE_ADMIN_EMAIL && smoke.STAGING_SMOKE_ADMIN_PASSWORD, 'Configure a staging-only smoke-test administrator in the protected environment')
      if (previous === path.join(releases, requestedSha)) {
        await verify(previous, true)
        console.log(`PUBLIC STAGING VERIFIED (already active): ${requestedSha}`)
      } else {
      const backupPath = await backup(requestedSha)
      const candidate = build(requestedSha)
      // Prevent queued jobs or a new push from switching staging to an old commit.
      verifySource(requestedSha); await isolation()
      await verifyJobRun({ check_run_id: process.env.GITHUB_CHECK_RUN_ID, sha: requestedSha }, mode)
      fs.writeFileSync(path.join(state, 'in-progress.json'), JSON.stringify({ previous, candidate, backupPath }), { mode: 0o600 })
      await activateWithRollback({ previous, candidate, activate, verify: async release => {
        await verify(release, release === candidate)
        run('pm2', ['save'])
        if (release === candidate) {
          fs.writeFileSync(path.join(state, 'last-deployment.json'), JSON.stringify({ sha: requestedSha, previous, candidate, backupPath, at: new Date().toISOString() }), { mode: 0o600 })
          if (fs.existsSync(path.join(state, 'discount-initial-verification-pending'))) fs.unlinkSync(path.join(state, 'discount-initial-verification-pending'))
          fs.unlinkSync(path.join(state, 'in-progress.json'))
        }
      } })
      console.log(`PUBLIC STAGING VERIFIED: ${requestedSha}; backup: ${backupPath}`)
      }
    }
  }
} catch (error) {
  console.error(`Staging operation failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await database.$disconnect()
}
