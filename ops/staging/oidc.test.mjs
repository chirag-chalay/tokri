import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { generateKeyPairSync, sign } from 'node:crypto'
import { verifyJobToken, consumeJobToken, assertCheckRun, AUDIENCE, ISSUER, WORKFLOW, REPOSITORY_ID, OWNER_ID } from './oidc.mjs'
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key' }
const sha = 'a'.repeat(40), now = 2000000000
const claims = { iss: ISSUER, aud: AUDIENCE, iat: now, nbf: now, exp: now + 300, jti: 'nonce', repository: 'chirag-chalay/tokri', repository_id: REPOSITORY_ID, repository_owner_id: OWNER_ID, ref: 'refs/heads/staging', ref_type: 'branch', event_name: 'push', workflow_ref: WORKFLOW, workflow_sha: sha, sha, runner_environment: 'self-hosted', environment: 'staging', sub: 'repo:chirag-chalay/tokri:environment:staging', check_run_id: '789', run_id: '123', run_attempt: '1' }
function token(payload, header = { alg: 'RS256', typ: 'JWT', kid: jwk.kid }) {
  const part = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${part(header)}.${part(payload)}`
  return `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url')}`
}
test('a correctly signed staging job authorizes only its exact operation and SHA', () => {
  assert.equal(verifyJobToken(token(claims), [jwk], 'deploy', sha, now).run_id, '123')
  assert.throws(() => verifyJobToken(token(claims), [jwk], 'migrate-discounts', sha, now))
  assert.throws(() => verifyJobToken(token(claims), [jwk], 'deploy', 'b'.repeat(40), now))
  assert.throws(() => verifyJobToken(token(claims), [jwk], 'rollback', sha, now))
})
test('forged signatures, wrong algorithms, keys, audience, issuer, expiry and replay identifiers are rejected', () => {
  const encoded = token(claims).split('.'); encoded[1] = Buffer.from(JSON.stringify({ ...claims, event_name: 'pull_request' })).toString('base64url')
  assert.throws(() => verifyJobToken(encoded.join('.'), [jwk], 'deploy', sha, now))
  assert.throws(() => verifyJobToken(token(claims, { alg: 'none', typ: 'JWT', kid: jwk.kid }), [jwk], 'deploy', sha, now))
  assert.throws(() => verifyJobToken(token(claims), [], 'deploy', sha, now))
  for (const change of [{ aud: 'other-service' }, { iss: 'https://attacker.invalid' }, { exp: now - 1 }, { nbf: now + 100 }, { jti: '../../escape' }]) assert.throws(() => verifyJobToken(token({ ...claims, ...change }), [jwk], 'deploy', sha, now))
})
test('fork, renamed-repository, PR, main, different workflow and missing environment claims cannot authorize deployment', () => {
  for (const change of [{ repository: 'someone/tokri' }, { repository_id: '999' }, { repository_owner_id: '999' }, { ref: 'refs/heads/main' }, { event_name: 'pull_request_target' }, { workflow_ref: WORKFLOW.replace('staging-deploy.yml', 'malicious.yml') }, { environment: undefined }, { sub: 'repo:chirag-chalay/tokri:ref:refs/heads/staging' }]) assert.throws(() => verifyJobToken(token({ ...claims, ...change }), [jwk], 'deploy', sha, now))
})
test('the migration requires its distinct signed protected environment; immutable subjects remain supported', () => {
  const migration = { ...claims, environment: 'staging-discount-migration', sub: `repo:chirag-chalay@${OWNER_ID}/tokri@${REPOSITORY_ID}:environment:staging-discount-migration` }
  assert.doesNotThrow(() => verifyJobToken(token(migration), [jwk], 'migrate-discounts', sha, now))
  assert.throws(() => verifyJobToken(token(migration), [jwk], 'deploy', sha, now))
})

test('the same authenticated token cannot authorize a second request', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-oidc-'))
  try {
    consumeJobToken(claims, directory)
    assert.throws(() => consumeJobToken(claims, directory), /EEXIST/)
    assert.doesNotThrow(() => consumeJobToken({ ...claims, jti: 'next-job' }, directory))
  } finally { await fs.rm(directory, { recursive: true }) }
})

test('a preflight token cannot escalate to deploy, and cancelled or stale jobs cannot cut over', () => {
  const check = { id: 789, name: 'staging-preflight', head_sha: sha, status: 'in_progress', app: { slug: 'github-actions' } }
  assert.doesNotThrow(() => assertCheckRun(claims, check, 'preflight'))
  assert.throws(() => assertCheckRun(claims, check, 'deploy'))
  for (const change of [{ status: 'completed' }, { head_sha: 'b'.repeat(40) }, { id: 987 }, { app: { slug: 'other-app' } }]) assert.throws(() => assertCheckRun(claims, { ...check, ...change }, 'preflight'))
})
