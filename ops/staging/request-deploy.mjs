#!/usr/bin/env node
// Runs as the unprivileged GitHub runner. It has no staging credentials or file access.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { AUDIENCE } from './oidc.mjs'
const [mode, sha] = process.argv.slice(2)
try {
  const url = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL)
  assert.equal(url.protocol, 'https:')
  assert.ok(url.hostname.endsWith('.actions.githubusercontent.com'))
  url.searchParams.set('audience', AUDIENCE)
  const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` }, redirect: 'error', signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200)
  const { value: token } = await response.json()
  assert.ok(token)
  const result = spawnSync('sudo', ['-n', '-u', 'tokri-staging', '/opt/tokri-staging/run.sh', '--github-oidc'], {
    input: JSON.stringify({ token, mode, sha }), stdio: ['pipe', 'inherit', 'inherit'],
  })
  process.exitCode = result.status === 0 ? 0 : 1
} catch {
  console.error('Cannot obtain an approved GitHub job identity or contact the local deployment controller. No SSH credentials are required.')
  process.exitCode = 1
}
