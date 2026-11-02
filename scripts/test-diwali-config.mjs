import assert from 'node:assert/strict'
import {
  DIWALI_SCHEDULE,
  isDiwaliScheduled,
  parseDiwaliOverride,
  getDiwaliStatus,
} from '../src/lib/diwaliConfig.js'

console.log('--- Testing Diwali 2026 Schedule & Configuration ---')

// 1. Verify schedule constants
assert.equal(DIWALI_SCHEDULE.year, 2026)
assert.equal(new Date(DIWALI_SCHEDULE.startMs).toISOString(), '2026-11-01T18:30:00.000Z') // 2 Nov 00:00 IST
assert.equal(new Date(DIWALI_SCHEDULE.endMs).toISOString(), '2026-11-11T18:30:00.000Z')   // 12 Nov 00:00 IST

// 2. Automated schedule tests across dates
const beforeWindow = new Date('2026-11-01T12:00:00+05:30').getTime()
const exactStart = new Date('2026-11-02T00:00:00+05:30').getTime()
const diwaliDay = new Date('2026-11-08T18:00:00+05:30').getTime()
const lastSecond = new Date('2026-11-11T23:59:59.999+05:30').getTime()
const exactEnd = new Date('2026-11-12T00:00:00+05:30').getTime()
const afterWindow = new Date('2026-11-15T10:00:00+05:30').getTime()

assert.equal(isDiwaliScheduled(beforeWindow), false, 'Must be inactive before 2 Nov 00:00 IST')
assert.equal(isDiwaliScheduled(exactStart), true, 'Must be active at exact start 2 Nov 00:00 IST')
assert.equal(isDiwaliScheduled(diwaliDay), true, 'Must be active on Diwali Day 8 Nov')
assert.equal(isDiwaliScheduled(lastSecond), true, 'Must be active on 11 Nov 23:59:59 IST')
assert.equal(isDiwaliScheduled(exactEnd), false, 'Must be inactive at exact end 12 Nov 00:00 IST')
assert.equal(isDiwaliScheduled(afterWindow), false, 'Must be inactive after 12 Nov')

// 3. Override parsing
assert.equal(parseDiwaliOverride('1'), true)
assert.equal(parseDiwaliOverride('true'), true)
assert.equal(parseDiwaliOverride('preview'), true)
assert.equal(parseDiwaliOverride('on'), true)
assert.equal(parseDiwaliOverride('0'), false)
assert.equal(parseDiwaliOverride('false'), false)
assert.equal(parseDiwaliOverride('off'), false)
assert.equal(parseDiwaliOverride('random'), null)
assert.equal(parseDiwaliOverride(null), null)

// 4. Query param overrides
assert.equal(
  getDiwaliStatus({ now: beforeWindow, searchParams: '?diwali=preview' }).isActive,
  true,
  'Query param ?diwali=preview should force active before window'
)
assert.equal(
  getDiwaliStatus({ now: diwaliDay, searchParams: '?diwali=0' }).isActive,
  false,
  'Query param ?diwali=0 should force inactive on Diwali day'
)
assert.equal(
  getDiwaliStatus({ now: beforeWindow, searchParams: '?diwali_date=2026-11-08' }).isActive,
  true,
  'Simulated date within window should activate'
)
assert.equal(
  getDiwaliStatus({ now: diwaliDay, searchParams: '?diwali_date=2026-11-20' }).isActive,
  false,
  'Simulated date outside window should deactivate'
)

// 5. Environment variable override
assert.equal(
  getDiwaliStatus({ now: beforeWindow, env: { NEXT_PUBLIC_FORCE_DIWALI: 'true' } }).isActive,
  true,
  'Env variable NEXT_PUBLIC_FORCE_DIWALI=true should force active'
)
assert.equal(
  getDiwaliStatus({ now: diwaliDay, env: { NEXT_PUBLIC_FORCE_DIWALI: 'false' } }).isActive,
  false,
  'Env variable NEXT_PUBLIC_FORCE_DIWALI=false should force inactive'
)

console.log('✅ ALL DIWALI CONFIGURATION & SCHEDULE TESTS PASSED (16/16)')
