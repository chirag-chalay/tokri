import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import express from 'express'
import { createFrontendErrorsRouter } from '../src/routes/frontendErrors.js'
import { sanitizeEvent, createFrontendErrorWriter } from '../src/services/frontendErrors.js'

const event = { kind: 'javascript', message: 'RangeError: Maximum call stack size exceeded', page: 'https://tokriii.com/product/banana?token=secret' }

test('whitelists frontend fields and redacts URLs, credentials and common PII', () => {
  const result = sanitizeEvent({ ...event, cookie: 'private', message: 'failed https://tokriii.com/order/private-id?token=secret email=alice@example.com Bearer secret-token 9876543210', stack: 'https://tokriii.com/app.js?otp=123456' })
  assert.equal(result.sourceType, 'website-frontend')
  assert.equal(result.page, 'https://tokriii.com/product/banana')
  assert.equal(result.stack, 'https://tokriii.com/app.js')
  assert.doesNotMatch(JSON.stringify(result), /private-id|secret|alice|9876543210|otp|cookie/)
  assert.equal(sanitizeEvent({ ...event, kind: 'backend' }), null)
})

test('rotates private JSONL files and recovers after rejected writes', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-frontend-test-'))
  try {
    const write = createFrontendErrorWriter({ directory, maxBytes: 600 })
    await Promise.all(Array.from({ length: 12 }, () => write([sanitizeEvent(event)])))
    const files = await fs.readdir(directory)
    assert.equal(files.length, 4)
    for (const file of files) {
      const stat = await fs.stat(path.join(directory, file))
      assert.equal(stat.mode & 0o777, 0o600)
      assert.ok(stat.size <= 600)
      const lines = (await fs.readFile(path.join(directory, file), 'utf8')).trim().split('\n')
      lines.forEach((line) => assert.equal(JSON.parse(line).kind, 'javascript'))
    }
    const blocked = path.join(directory, 'blocked')
    await fs.writeFile(blocked, '')
    const recoverableWrite = createFrontendErrorWriter({ directory: blocked })
    await assert.rejects(recoverableWrite([sanitizeEvent(event)]))
    await fs.unlink(blocked)
    await recoverableWrite([sanitizeEvent(event)])
  } finally { await fs.rm(directory, { recursive: true, force: true }) }
})

test('collector enforces origin, size, schema, rate limits and stores sanitized events', async () => {
  const writes = []
  const app = express()
  app.use('/api/v1/frontend-errors', createFrontendErrorsRouter({ allowedOrigins: ['https://tokriii.com'], write: async (events) => writes.push(events), perMinute: 8 }))
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api/v1/frontend-errors`
  const send = (body, origin = 'https://tokriii.com') => fetch(url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  try {
    assert.equal((await send({ events: [event] }, 'https://attacker.example')).status, 403)
    assert.equal((await send({ events: [event] })).status, 204)
    assert.equal(writes[0][0].page, 'https://tokriii.com/product/banana')
    assert.equal((await send({ events: [] })).status, 400)
    assert.equal((await send({ events: [null] })).status, 400)
    assert.equal((await send('{invalid')).status, 400)
    assert.equal((await send({ events: Array(6).fill(event) })).status, 400)
    assert.equal((await send({ events: [{ ...event, message: 'x'.repeat(33000) }] })).status, 413)
    await send({ events: [event] }); await send({ events: [event] })
    const limited = await send({ events: [event] })
    assert.equal(limited.status, 429)
    assert.equal(limited.headers.get('retry-after'), '60')
  } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)) }
})
