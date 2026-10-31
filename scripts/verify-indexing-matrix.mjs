import assert from 'node:assert/strict'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

function requestWithHost(urlStr, hostHeader) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        host: hostHeader,
        'user-agent': 'Mozilla/5.0 (compatible; TestBot/1.0)',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          xRobotsTag: res.headers['x-robots-tag'] || null,
          text: data,
        })
      })
    })

    req.on('error', reject)
    req.end()
  })
}

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await requestWithHost(url, 'localhost')
      if (res.status === 200) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  return false
}

async function run() {
  console.log('=== STARTING NOINDEX-HOST MATRIX VERIFICATION ===\n')

  // ==========================================================================
  // MATRIX CELL 1: TOKRIII_INDEXING_ENABLED = false / unset (Standard Staging/Dev)
  // ==========================================================================
  console.log('--- 1. Testing Default / Staging Build (TOKRIII_INDEXING_ENABLED unset) ---')
  console.log('Building Next.js with default environment...')
  execFileSync('npx', ['next', 'build', '--webpack'], {
    cwd: ROOT_DIR,
    env: { ...process.env, TOKRIII_INDEXING_ENABLED: '' },
    stdio: 'ignore',
  })

  console.log('Starting Next.js on port 3004...')
  const srv1 = spawn('npx', ['next', 'start', '--hostname', '127.0.0.1', '--port', '3004'], {
    cwd: ROOT_DIR,
    env: { ...process.env, TOKRIII_INDEXING_ENABLED: '' },
    stdio: 'ignore',
  })

  try {
    const ready1 = await waitForServer('http://127.0.0.1:3004/')
    assert.ok(ready1, 'Server 1 must be ready on port 3004')

    // 1A. Staging Host (server.tokriii.com)
    const stg1 = await requestWithHost('http://127.0.0.1:3004/', 'server.tokriii.com')
    const stg1Robots = await requestWithHost('http://127.0.0.1:3004/robots.txt', 'server.tokriii.com')
    assert.equal(stg1.xRobotsTag, 'noindex, nofollow', 'Staging must return X-Robots-Tag: noindex, nofollow')
    assert.match(stg1.text, /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/, 'Staging must render noindex meta')
    assert.match(stg1Robots.text, /Disallow: \/(?:\r?\n|$)/, 'Staging robots.txt must Disallow: /')
    console.log('  ✓ 1A: server.tokriii.com: Header=noindex, Meta=noindex, robots.txt=Disallow: / (PASS)')

    // 1B. Production Host (tokriii.com) when indexing disabled (Fail-safe)
    const prod1 = await requestWithHost('http://127.0.0.1:3004/', 'tokriii.com')
    const prod1Robots = await requestWithHost('http://127.0.0.1:3004/robots.txt', 'tokriii.com')
    assert.equal(prod1.xRobotsTag, 'noindex, nofollow', 'Production host when disabled must return noindex header')
    assert.match(prod1.text, /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/)
    assert.match(prod1Robots.text, /Disallow: \/(?:\r?\n|$)/)
    console.log('  ✓ 1B: tokriii.com (disabled): Header=noindex, Meta=noindex, robots.txt=Disallow: / (PASS)')

    // 1C. Local Preview Host (127.0.0.1:3004)
    const local1 = await requestWithHost('http://127.0.0.1:3004/', '127.0.0.1:3004')
    assert.equal(local1.xRobotsTag, 'noindex, nofollow')
    assert.match(local1.text, /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/)
    console.log('  ✓ 1C: 127.0.0.1:3004: Header=noindex, Meta=noindex (PASS)')
  } finally {
    srv1.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
  }

  // ==========================================================================
  // MATRIX CELL 2: TOKRIII_INDEXING_ENABLED = true (Simulating accidental enable on staging)
  // ==========================================================================
  console.log('\n--- 2. Testing Production-Mode Build (TOKRIII_INDEXING_ENABLED=true) ---')
  console.log('Building Next.js with TOKRIII_INDEXING_ENABLED=true...')
  execFileSync('npx', ['next', 'build', '--webpack'], {
    cwd: ROOT_DIR,
    env: { ...process.env, TOKRIII_INDEXING_ENABLED: 'true' },
    stdio: 'ignore',
  })

  console.log('Starting Next.js on port 3005...')
  const srv2 = spawn('npx', ['next', 'start', '--hostname', '127.0.0.1', '--port', '3005'], {
    cwd: ROOT_DIR,
    env: { ...process.env, TOKRIII_INDEXING_ENABLED: 'true' },
    stdio: 'ignore',
  })

  try {
    const ready2 = await waitForServer('http://127.0.0.1:3005/')
    assert.ok(ready2, 'Server 2 must be ready on port 3005')

    // 2A. CRITICAL STAGING SAFEGUARD: server.tokriii.com when TOKRIII_INDEXING_ENABLED=true
    const stg2 = await requestWithHost('http://127.0.0.1:3005/', 'server.tokriii.com')
    const stg2Robots = await requestWithHost('http://127.0.0.1:3005/robots.txt', 'server.tokriii.com')
    assert.equal(
      stg2.xRobotsTag,
      'noindex, nofollow',
      'CRITICAL: Staging HTTP header MUST remain noindex, nofollow even when TOKRIII_INDEXING_ENABLED=true'
    )
    assert.match(
      stg2.text,
      /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/,
      'CRITICAL: Staging HTML meta MUST remain noindex, nofollow even when TOKRIII_INDEXING_ENABLED=true'
    )
    assert.match(
      stg2Robots.text,
      /Disallow: \/(?:\r?\n|$)/,
      'CRITICAL: Staging robots.txt MUST remain Disallow: / even when TOKRIII_INDEXING_ENABLED=true'
    )
    console.log('  ✓ 2A: server.tokriii.com (ACCIDENTALLY ENABLED): Header=noindex, Meta=noindex, robots.txt=Disallow: / (STAGING PROTECTED: PASS)')

    // 2B. Alternative Staging Host: staging.tokriii.com
    const stgAlt = await requestWithHost('http://127.0.0.1:3005/', 'staging.tokriii.com')
    const stgAltRobots = await requestWithHost('http://127.0.0.1:3005/robots.txt', 'staging.tokriii.com')
    assert.equal(stgAlt.xRobotsTag, 'noindex, nofollow')
    assert.match(stgAlt.text, /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/)
    assert.match(stgAltRobots.text, /Disallow: \/(?:\r?\n|$)/)
    console.log('  ✓ 2B: staging.tokriii.com (ACCIDENTALLY ENABLED): Header=noindex, Meta=noindex, robots.txt=Disallow: / (STAGING PROTECTED: PASS)')

    // 2C. Production Host: tokriii.com when indexing is enabled (Public SEO)
    const prod2 = await requestWithHost('http://127.0.0.1:3005/', 'tokriii.com')
    const prod2Robots = await requestWithHost('http://127.0.0.1:3005/robots.txt', 'tokriii.com')
    assert.equal(prod2.xRobotsTag, null, 'Production domain must NOT have noindex header when indexing is enabled')
    assert.match(prod2.text, /<meta name="robots" content="index, follow"\s*\/?\s*>/, 'Production domain must have index, follow meta')
    assert.match(prod2Robots.text, /Allow: \/(?:\r?\n|$)/, 'Production robots.txt must allow crawling')
    console.log('  ✓ 2C: tokriii.com (production enabled): Header=omitted, Meta=index,follow, robots.txt=Allow: / (PRODUCTION PUBLIC: PASS)')
  } finally {
    srv2.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
  }

  // ==========================================================================
  // RESTORE DEFAULT BUILD
  // ==========================================================================
  console.log('\nRestoring default production build (TOKRIII_INDEXING_ENABLED unset)...')
  execFileSync('npx', ['next', 'build', '--webpack'], {
    cwd: ROOT_DIR,
    env: { ...process.env, TOKRIII_INDEXING_ENABLED: '' },
    stdio: 'ignore',
  })

  console.log('\n======================================================================')
  console.log('NOINDEX-HOST MATRIX VERIFICATION COMPLETE: ALL 6 CELLS PASSED!')
  console.log('Staging is guaranteed 100% noindex across all permitted configurations.')
  console.log('======================================================================\n')
}

run().catch((err) => {
  console.error('NOINDEX-HOST MATRIX FAILED:', err)
  process.exit(1)
})
