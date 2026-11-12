import fs from 'node:fs/promises'
import { constants, watch } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// A small private control file, separate from retained log history. No credentials
// or business settings. Atomic replacement prevents partial state after a crash.
export async function createDebugSettings(directory, onChange) {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 })
  const info = await fs.lstat(directory)
  if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) || info.uid !== process.getuid?.()) throw new Error('Debug settings directory is unavailable.')
  const filename = path.join(directory, '.debug-settings.json')
  let closed = false, timer, chain = Promise.resolve()
  async function read() {
    let handle
    try {
      handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW)
      const stat = await handle.stat()
      if (!stat.isFile() || stat.size > 1024 || (stat.mode & 0o077) || stat.uid !== process.getuid?.()) throw new Error('Unsafe debug settings file.')
      const value = JSON.parse(await handle.readFile('utf8'))
      if (!/^[a-f0-9-]{36}$/i.test(value.generation || '') || !Number.isFinite(value.until) || value.until < 0 || value.until > Date.now() + 3601000) throw new Error('Invalid debug settings.')
      return value
    } catch { return { until: 0, generation: randomUUID() } }
    finally { await handle?.close() }
  }
  const refresh = async () => { if (!closed) onChange(await read()) }
  await refresh()
  const watcher = watch(directory, { persistent: false }, (_event, name) => {
    if (name && String(name) !== '.debug-settings.json') return
    clearTimeout(timer)
    timer = setTimeout(() => { refresh().catch(() => onChange({ until: 0, generation: randomUUID() })) }, 10)
    timer.unref()
  })
  watcher.on('error', () => onChange({ until: 0, generation: randomUUID() }))
  return {
    save(enabled, minutes) {
      const write = async () => {
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60) throw new Error('Debug duration must be between 1 and 60 minutes.')
        const state = { until: enabled ? Date.now() + minutes * 60000 : 0, generation: randomUUID() }
        const temp = `${filename}.${randomUUID()}.tmp`
        let handle
        try {
          handle = await fs.open(temp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600)
          await handle.writeFile(JSON.stringify(state)); await handle.sync(); await handle.close(); handle = undefined
          await fs.rename(temp, filename)
          const dir = await fs.open(directory, constants.O_RDONLY); try { await dir.sync() } finally { await dir.close() }
          onChange(state)
          return state
        } finally { await handle?.close(); await fs.rm(temp, { force: true }) }
      }
      const request = chain.then(write)
      chain = request.catch(() => {})
      return request
    },
    close() { closed = true; clearTimeout(timer); watcher.close() },
  }
}
