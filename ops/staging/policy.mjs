import assert from 'node:assert/strict'
import path from 'node:path'

export const REPOSITORY = 'chirag-chalay/tokri'
export const BASELINE = '6533795be32449b06c857122b0bfd4d4191f391f'
export const MIGRATION_HASH = '15d6528012f5f091711df397e7ace7e1f39de14a5f4133d32c79c17c06b5278a'
export const SITE = 'https://server.tokriii.com'
export function requireSha(value) {
  assert.match(value || '', /^[a-f0-9]{40}$/); return value
}
export function inside(root, target) {
  const relative = path.relative(root, target)
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Path escapes staging root: ${target}`)
  return target
}
export function validateConfig(config) {
  assert.equal(config.site, SITE)
  assert.equal(config.root, '/srv/tokri-staging')
  assert.equal(config.pm2Home, '/srv/tokri-staging/shared/pm2')
  assert.ok(config.productionIdentities?.length, 'Independent production database identity evidence is required')
  for (const identity of [config.stagingIdentity, ...config.productionIdentities]) {
    assert.match(identity.serverUuid || '', /^[a-f0-9-]{36}$/i)
    assert.match(identity.database || '', /^[A-Za-z0-9_]+$/)
    assert.ok(!/REPLACE|EXAMPLE/i.test(identity.database))
  }
  assert.notEqual(config.apiPort, config.nextPort)
  for (const port of [config.apiPort, config.nextPort]) assert.ok(Number.isInteger(port) && port > 1024 && port < 65536)
  assert.match(config.apiProcess, /^tokri-staging-[a-z0-9-]+$/)
  assert.match(config.nextProcess, /^tokri-staging-[a-z0-9-]+$/)
  assert.notEqual(config.apiProcess, config.nextProcess)
  assert.ok(path.isAbsolute(config.probeClientModule))
  assert.ok(path.isAbsolute(config.browserExecutable))
  return config
}
export function verifyIsolation(config, identity, grants) {
  assert.equal(identity.serverUuid, config.stagingIdentity.serverUuid, 'Unexpected database server')
  assert.equal(identity.database, config.stagingIdentity.database, 'Unexpected database name')
  for (const production of config.productionIdentities) {
    assert.ok(identity.serverUuid !== production.serverUuid || identity.database !== production.database, 'Staging points at production')
  }
  assert.ok(grants.length, 'Database grants are missing')
  for (const grant of grants) {
    if (/^GRANT USAGE ON \*\.\* TO /i.test(grant)) continue
    // Reject global grants, cross-schema grants and inherited roles; fail closed.
    const scope = grant.match(/^GRANT .+ ON `([^`]+)`\.\* TO /i)
    assert.ok(scope && scope[1] === identity.database, 'Database account has global, role or cross-schema privileges')
  }
}
export function schemaState({ table, orderColumn, lineColumn, configRow }) {
  if (!table && !orderColumn && !lineColumn) return 'pending'
  if (table && orderColumn && lineColumn && configRow) return 'ready'
  throw new Error('Partially applied discount schema: stop for reviewed repair; never retry DDL blindly')
}
export function assertRunnerEvent(env) {
  assert.equal(env.GITHUB_REPOSITORY, REPOSITORY)
  assert.equal(env.GITHUB_REF, 'refs/heads/staging')
  assert.equal(env.GITHUB_EVENT_NAME, 'push')
}
export function assertPm2(config, processes, release) {
  assert.equal(processes.length, 2, 'Dedicated staging PM2_HOME must contain exactly the two staging processes')
  for (const name of [config.apiProcess, config.nextProcess]) {
    const process = processes.find(item => item.name === name)
    assert.ok(process, `Missing staging process: ${name}`)
    const cwd = process.pm2_env?.pm_cwd
    assert.ok(cwd === release || cwd === path.join(release, 'server'), 'PM2 points outside the selected staging release')
    assert.equal(process.pm2_env?.status, 'online')
  }
}
export async function activateWithRollback({ previous, candidate, activate, verify }) {
  try {
    await activate(candidate)
    await verify(candidate)
  } catch (error) {
    try { await activate(previous); await verify(previous) }
    catch (rollbackError) { throw new AggregateError([error, rollbackError], 'Deployment AND rollback verification failed; operator intervention required') }
    throw new Error(`Deployment failed; previous release restored and verified: ${error.message}`, { cause: error })
  }
}
export function verifyEnvironmentProtections(environment, policies, bypassAttested) {
  const reviewers = environment.protection_rules?.find(rule => rule.type === 'required_reviewers')
  assert.ok(reviewers?.reviewers?.length, 'Environment needs required reviewers')
  assert.equal(reviewers.prevent_self_review, true, 'Prevent deployment self review')
  assert.equal(bypassAttested, true, 'Owner must attest that UI-only administrator bypass is disabled')
  if (Object.hasOwn(environment, 'can_admins_bypass')) assert.equal(environment.can_admins_bypass, false)
  assert.equal(environment.deployment_branch_policy?.custom_branch_policies, true)
  assert.ok(policies.length === 1 && policies[0].name === 'staging' && policies[0].type === 'branch', 'Only staging may deploy')
}

export function assertListeners(config, processes, sockets) {
  for (const [name, port] of [[config.apiProcess, config.apiPort], [config.nextProcess, config.nextPort]]) {
    const process = processes.find(item => item.name === name)
    assert.ok(Number.isInteger(process?.pid) && process.pid > 0, 'Missing staging service PID')
    assert.ok(sockets.split('\n').some(line => new RegExp(`:${port}\\b`).test(line) && line.includes(`pid=${process.pid},`)), `Configured port ${port} is not owned by staging process ${name}`)
  }
}
