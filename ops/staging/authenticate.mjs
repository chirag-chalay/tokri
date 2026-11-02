#!/usr/bin/env node
// The runner may invoke only run.sh --github-oidc as the staging deployment account.
// Caller-provided GitHub environment variables never establish authority.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { ISSUER, verifyJobToken, consumeJobToken, verifyJobRun } from './oidc.mjs'
let bytes = 0, input = ''
try {
  assert.equal(process.env.TOKRIII_STAGING_LOCKED, '1')
  const inputDeadline = setTimeout(() => process.stdin.destroy(new Error('Request timed out')), 15000)
  inputDeadline.unref()
  for await (const part of process.stdin) {
    bytes += part.length; assert.ok(bytes <= 32768, 'Request too large'); input += part.toString()
  }
  clearTimeout(inputDeadline)
  const { token, mode, sha } = JSON.parse(input)
  const response = await fetch(`${ISSUER}/.well-known/jwks`, { redirect: 'error', signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200)
  const claims = verifyJobToken(token, (await response.json()).keys, mode, sha)
  await verifyJobRun(claims, mode)
  consumeJobToken(claims, '/srv/tokri-staging/state/oidc-replay')
  const result = spawnSync(process.execPath, ['/opt/tokri-staging/deploy.mjs', mode, sha], {
    stdio: 'inherit',
    env: {
      PATH: process.env.PATH, HOME: process.env.HOME,
      TOKRIII_STAGING_LOCKED: '1', TOKRIII_STAGING_AUTHENTICATED: '1',
      GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: claims.repository,
      GITHUB_CHECK_RUN_ID: String(claims.check_run_id), GITHUB_REF: claims.ref, GITHUB_EVENT_NAME: claims.event_name, EXPECTED_SHA: claims.sha,
    },
  })
  process.exitCode = result.status === 0 ? 0 : 1
} catch {
  // Never echo tokens, caller JSON, JWT claims, credentials or exception payloads.
  console.error('Staging request denied: signed workflow/environment/commit identity could not be verified, or the token was already used.')
  process.exitCode = 1
}
