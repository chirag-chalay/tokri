// Runtime configuration replaces the old hardcoded Pixel suite.
import { spawnSync } from 'node:child_process'
const result = spawnSync(process.execPath, ['--test', 'tests/tracking-browser.test.mjs', 'tests/tracking-consent.test.mjs'], { stdio: 'inherit' })
process.exitCode = result.status ?? 1
