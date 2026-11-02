import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash, createPublicKey, verify } from 'node:crypto'
import { REPOSITORY, requireSha } from './policy.mjs'
export const AUDIENCE = 'tokriii-staging-deployer'
export const ISSUER = 'https://token.actions.githubusercontent.com'
export const WORKFLOW = `${REPOSITORY}/.github/workflows/staging-deploy.yml@refs/heads/staging`
export const REPOSITORY_ID = '1208419967'
export const OWNER_ID = '69189516'
export function verifyJobToken(token, keys, mode, sha, now = Math.floor(Date.now() / 1000)) {
  assert.ok(['preflight', 'deploy', 'migrate-discounts'].includes(mode))
  requireSha(sha)
  assert.ok(typeof token === 'string' && token.length < 16384)
  const parts = token.split('.'); assert.equal(parts.length, 3)
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
  assert.equal(header.alg, 'RS256'); assert.equal(header.typ, 'JWT')
  const jwk = keys.find(key => key.kid === header.kid && key.kty === 'RSA')
  assert.ok(jwk, 'Unrecognized GitHub signing key')
  assert.equal(verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url')), true, 'Invalid GitHub signature')
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  assert.equal(claims.iss, ISSUER); assert.equal(claims.aud, AUDIENCE)
  assert.ok(Number.isInteger(claims.exp) && claims.exp > now && claims.exp - claims.iat <= 600)
  assert.ok(Number.isInteger(claims.nbf) && claims.nbf <= now + 30)
  assert.ok(Number.isInteger(claims.iat) && claims.iat <= now + 30 && claims.iat >= now - 600)
  assert.equal(claims.repository, REPOSITORY); assert.equal(claims.repository_id, REPOSITORY_ID)
  assert.equal(claims.repository_owner_id, OWNER_ID)
  assert.equal(claims.ref, 'refs/heads/staging'); assert.equal(claims.ref_type, 'branch')
  assert.equal(claims.event_name, 'push'); assert.equal(claims.workflow_ref, WORKFLOW)
  assert.equal(claims.workflow_sha, sha); assert.equal(claims.sha, sha)
  assert.equal(claims.runner_environment, 'self-hosted')
  const environment = mode === 'migrate-discounts' ? 'staging-discount-migration' : 'staging'
  assert.equal(claims.environment, environment)
  // Support both documented GitHub subject formats; immutable IDs are checked separately.
  const subjects = [
    `repo:${REPOSITORY}:environment:${environment}`,
    `repo:chirag-chalay@${OWNER_ID}/tokri@${REPOSITORY_ID}:environment:${environment}`,
  ]
  assert.ok(subjects.includes(claims.sub), 'Wrong protected environment subject')
  assert.match(claims.jti || '', /^[A-Za-z0-9_-]{1,128}$/)
  assert.match(String(claims.check_run_id || ''), /^\d+$/)
  assert.match(claims.run_id || '', /^\d+$/); assert.match(claims.run_attempt || '', /^\d+$/)
  return claims
}

export function consumeJobToken(claims, directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  const nonce = `${directory}/${createHash('sha256').update(claims.jti).digest('hex')}`
  fs.writeFileSync(nonce, JSON.stringify({ run: claims.run_id, attempt: claims.run_attempt, expires: claims.exp }), { mode: 0o600, flag: 'wx' })
}
export function assertCheckRun(claims, check, mode) {
  const names = { preflight: 'staging-preflight', deploy: 'staging-deploy', 'migrate-discounts': 'staging-discount-migration' }
  assert.equal(String(check.id), String(claims.check_run_id))
  assert.equal(check.name, names[mode], 'Token belongs to a different workflow job')
  assert.equal(check.head_sha, claims.sha)
  assert.equal(check.status, 'in_progress', 'GitHub job was completed or cancelled')
  assert.equal(check.app?.slug, 'github-actions')
}
export async function verifyJobRun(claims, mode) {
  assert.match(String(claims.check_run_id || ''), /^\d+$/)
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/check-runs/${claims.check_run_id}`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    redirect: 'error', signal: AbortSignal.timeout(15000),
  })
  assert.equal(response.status, 200, 'Cannot independently verify active GitHub job')
  assertCheckRun(claims, await response.json(), mode)
}
