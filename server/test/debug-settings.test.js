import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createDebugSettings } from '../src/monitoring/debug-settings.js'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

test('debug controls persist across instances, synchronize and keep a private bounded deadline', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-debug-settings-'))
  let firstState, secondState
  let first, second, control
  const waitFor = async predicate => { for (let n = 0; n < 100 && !predicate(); n++) await new Promise(resolve => setTimeout(resolve, 10)); assert.ok(predicate()) }
  try {
    first = await createDebugSettings(directory, value => { firstState = value })
    assert.equal(firstState.until, 0)
    const enabled = await first.save(true, 5)
    assert.ok(enabled.until > Date.now())
    assert.equal((await fs.stat(path.join(directory, '.debug-settings.json'))).mode & 0o777, 0o600)
    first.close()
    first = await createDebugSettings(directory, value => { firstState = value })
    assert.deepEqual(firstState, enabled, 'reopening restores the original deadline without extending it')
    const moduleUrl = new URL('../src/monitoring/debug-settings.js', import.meta.url).href
    const child = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', `import { createDebugSettings } from ${JSON.stringify(moduleUrl)}; const store = await createDebugSettings(process.argv[1], state => process.stdout.write(JSON.stringify(state))); store.close()`, directory])
    assert.deepEqual(JSON.parse(child.stdout), enabled, 'a separate process restores the same durable state')
    second = await createDebugSettings(directory, value => { secondState = value })
    const disabled = await second.save(false, 5)
    await waitFor(() => firstState.generation === disabled.generation)
    assert.equal(firstState.until, 0); assert.equal(secondState.until, 0)
    await fs.writeFile(path.join(directory, '.debug-settings.json'), '{invalid')
    await waitFor(() => firstState.generation !== disabled.generation)
    assert.equal(firstState.until, 0)
    second.close(); second = undefined
    const outside = path.join(directory, 'outside')
    await fs.writeFile(outside, 'PRIVATE_UNCHANGED')
    await fs.rm(path.join(directory, '.debug-settings.json'))
    await fs.symlink(outside, path.join(directory, '.debug-settings.json'))
    second = await createDebugSettings(directory, value => { secondState = value })
    assert.equal(secondState.until, 0)
    await second.save(false, 5)
    assert.equal(await fs.readFile(outside, 'utf8'), 'PRIVATE_UNCHANGED')
    await assert.rejects(second.save(true, 61))
    const file = path.join(directory, '.debug-settings.json')
    await fs.writeFile(file, JSON.stringify({ until: Date.now() - 1000, generation: disabled.generation }))
    second.close(); second = undefined
    second = await createDebugSettings(directory, value => { secondState = value })
    assert.ok(secondState.until < Date.now(), 'an expired deadline is never extended on restart')
    await fs.chmod(file, 0o644)
    second.close(); second = undefined
    second = await createDebugSettings(directory, value => { secondState = value })
    assert.equal(secondState.until, 0, 'unsafe settings permissions fail closed')
    Object.assign(process.env, { LOG_DIRECTORY: directory, LOG_OUTBOX_ENABLED: 'false', DATABASE_URL: 'mysql://invalid/no_access' })
    control = await import('../src/monitoring/index.js')
    const events = []
    let auditAvailable = false
    control.configureDurableLogging({ enabled: true, append: async (_category, entry) => { events.push(entry); return auditAvailable }, flushPending: async () => {}, stop: async () => {} })
    await assert.rejects(control.changeDebugSettings(true, 1))
    assert.equal(control.monitoringState().debugUntil, null, 'enable is refused before any configuration change when its audit cannot be journaled')
    assert.ok(events.some(entry => entry.event === 'debug.change.failed' && entry.failureReason === 'debug_audit'))
    await assert.rejects(fs.stat(directory + '.settings/.debug-settings.json'))
    auditAvailable = true; events.length = 0
    await control.changeDebugSettings(true, 1)
    assert.deepEqual(events.map(entry => entry.event), ['debug.change.requested', 'debug.enabled'])
    assert.equal(events[0].status, 'pending')
    assert.ok(control.monitoringState().debugUntil)
    await control.changeDebugSettings(false)
  } finally { first?.close(); second?.close(); await control?.closeMonitoring(); await fs.rm(directory, { recursive: true, force: true }); await fs.rm(directory + '.settings', { recursive: true, force: true }) }
})
