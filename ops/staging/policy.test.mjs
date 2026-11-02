import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { requireSha, inside, validateConfig, verifyIsolation, schemaState, assertRunnerEvent, assertPm2, assertListeners, activateWithRollback, verifyEnvironmentProtections, MIGRATION_HASH } from './policy.mjs'
const stage = { serverUuid: '11111111-1111-4111-8111-111111111111', database: 'tokri_staging' }
const config = { site: 'https://server.tokriii.com', root: '/srv/tokri-staging', pm2Home: '/srv/tokri-staging/shared/pm2', apiPort: 3020, nextPort: 3000, apiProcess: 'tokri-staging-api', nextProcess: 'tokri-staging-next', probeClientModule: '/old-stage/server/node_modules/@prisma/client', browserExecutable: '/usr/bin/google-chrome', stagingIdentity: stage, productionIdentities: [{ ...stage, database: 'tokri_live' }] }
const grants = ['GRANT USAGE ON *.* TO `stage`@`localhost`', 'GRANT ALL PRIVILEGES ON `tokri_staging`.* TO `stage`@`localhost`']

test('only an upstream staging push is authorized; forks, main, PRs and arbitrary SHA text rejected', () => {
  const event = { GITHUB_REPOSITORY: 'chirag-chalay/tokri', GITHUB_REF: 'refs/heads/staging', GITHUB_EVENT_NAME: 'push' }
  assert.doesNotThrow(() => assertRunnerEvent(event))
  for (const change of [{ GITHUB_REPOSITORY: 'someone/tokri' }, { GITHUB_REF: 'refs/heads/main' }, { GITHUB_EVENT_NAME: 'pull_request_target' }, { GITHUB_EVENT_NAME: 'pull_request' }]) assert.throws(() => assertRunnerEvent({ ...event, ...change }))
  assert.throws(() => requireSha('$(id)')); assert.throws(() => requireSha('main'))
})
test('database isolation uses server UUID plus schema, independently of host aliases', () => {
  assert.doesNotThrow(() => verifyIsolation(config, stage, grants))
  assert.throws(() => verifyIsolation(config, { ...stage, database: 'tokri_live' }, grants))
  assert.throws(() => verifyIsolation({ ...config, productionIdentities: [stage] }, stage, grants))
  assert.throws(() => verifyIsolation(config, { ...stage, serverUuid: config.productionIdentities[0].serverUuid.replace('1111', '2222') }, grants))
})
test('global privileges, roles, cross-schema grants and missing grants cannot pass', () => {
  for (const denied of ['GRANT ALL PRIVILEGES ON *.* TO `stage`@`localhost`', 'GRANT SELECT ON `tokri_live`.* TO `stage`@`localhost`', 'GRANT `production_admin`@`%` TO `stage`@`localhost`']) assert.throws(() => verifyIsolation(config, stage, [...grants, denied]))
  assert.throws(() => verifyIsolation(config, stage, []))
})
test('pending migration is different from a partial migration; completed schemas skip SQL', () => {
  assert.equal(schemaState({}), 'pending')
  assert.equal(schemaState({ table: true, orderColumn: true, lineColumn: true, configRow: true }), 'ready')
  for (const partial of [{ table: true }, { orderColumn: true }, { lineColumn: true }, { table: true, orderColumn: true, lineColumn: true }]) assert.throws(() => schemaState(partial))
})
test('approved SQL checksum matches the exact disabled-default additive migration', async () => {
  const sql = await fs.readFile(new URL('../../server/prisma/migrations/20261102000000_automatic_discounts/migration.sql', import.meta.url), 'utf8')
  assert.equal(createHash('sha256').update(sql).digest('hex'), MIGRATION_HASH)
  assert.match(sql, /\(1, false,/); assert.doesNotMatch(sql, /DROP TABLE|TRUNCATE|DELETE FROM|UPDATE `Order`/i)
})
test('configuration rejects production paths, process names, ambiguous DB evidence and port collisions', () => {
  assert.doesNotThrow(() => validateConfig(config))
  for (const change of [{ site: 'https://tokriii.com' }, { root: '/home/tokriii' }, { pm2Home: '/root/.pm2' }, { apiProcess: 'tokri-production-api' }, { nextPort: 3020 }, { productionIdentities: [] }]) assert.throws(() => validateConfig({ ...config, ...change }))
  assert.throws(() => inside('/srv/tokri-staging', '/srv/tokri-production'))
  assert.throws(() => inside('/srv/tokri-staging', '/srv/tokri-staging/../production'))
})
test('PM2 verifies two staging services and exact release directories', () => {
  const release = '/srv/tokri-staging/releases/abc'
  const processes = [config.apiProcess, config.nextProcess].map(name => ({ name, pm2_env: { status: 'online', pm_cwd: release } }))
  assert.doesNotThrow(() => assertPm2(config, processes, release))
  assert.throws(() => assertPm2(config, [...processes, { name: 'production' }], release))
  assert.throws(() => assertPm2(config, processes.map(item => ({ ...item, pm2_env: { ...item.pm2_env, pm_cwd: '/var/www/production' } })), release))
})
test('empty or weakened environment approvals never authorize deployment', () => {
  const environment = { protection_rules: [{ type: 'required_reviewers', prevent_self_review: true, reviewers: [{ type: 'User' }] }], deployment_branch_policy: { custom_branch_policies: true } }
  const policies = [{ name: 'staging', type: 'branch' }]
  assert.doesNotThrow(() => verifyEnvironmentProtections(environment, policies, true))
  assert.throws(() => verifyEnvironmentProtections({ protection_rules: [] }, policies, true))
  assert.throws(() => verifyEnvironmentProtections(environment, [{ name: '*', type: 'branch' }], true))
  assert.throws(() => verifyEnvironmentProtections(environment, policies, false))
  assert.throws(() => verifyEnvironmentProtections({ ...environment, can_admins_bypass: true }, policies, true))
})
test('a failed public version check restores and verifies the previous filesystem release', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-rollback-'))
  const previous = path.join(directory, 'old'), candidate = path.join(directory, 'new'), link = path.join(directory, 'current')
  const protectedData = path.join(directory, 'uploads-and-env.txt')
  await fs.mkdir(previous); await fs.mkdir(candidate); await fs.writeFile(protectedData, 'preserved')
  await fs.symlink(previous, link)
  const activations = [], verifications = []
  const activate = async release => { const temp = `${link}.next`; await fs.symlink(release, temp); await fs.rename(temp, link); activations.push(release) }
  const verify = async release => { verifications.push(release); assert.equal(await fs.realpath(link), release); if (release === candidate) throw new Error('Public site still serves old SHA') }
  try {
    await assert.rejects(activateWithRollback({ previous, candidate, activate, verify }), /previous release restored and verified/)
    assert.deepEqual(activations, [candidate, previous]); assert.deepEqual(verifications, [candidate, previous])
    assert.equal(await fs.realpath(link), previous); assert.equal(await fs.readFile(protectedData, 'utf8'), 'preserved')
  } finally { await fs.rm(directory, { recursive: true }) }
})
test('failed rollback is surfaced as an operator incident, never reported as success', async () => {
  await assert.rejects(activateWithRollback({ previous: 'old', candidate: 'new', activate: async () => {}, verify: async () => { throw new Error('unhealthy') } }), /Deployment AND rollback/)
})

test('an online PM2 label cannot hide an old process owning the actual listening port', () => {
  const processes = [{ name: config.apiProcess, pid: 123 }, { name: config.nextProcess, pid: 456 }]
  const sockets = 'LISTEN *:3020 users:(("node",pid=123,fd=20))\nLISTEN 127.0.0.1:3000 users:(("next",pid=456,fd=21))'
  assert.doesNotThrow(() => assertListeners(config, processes, sockets))
  assert.throws(() => assertListeners(config, processes, sockets.replace('pid=123,', 'pid=999,')))
  assert.throws(() => assertListeners(config, processes, sockets.replace(':3020 ', ':30201 ')))
})
