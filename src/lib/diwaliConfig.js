/**
 * Tokriii — Diwali 2026 Seasonal Experience Configuration
 *
 * Feature Schedule (Indian Standard Time - IST / UTC+05:30):
 * - Start: 3 November 2026, 00:00:00 IST (1793644200000 ms)
 * - End:   12 November 2026, 00:00:00 IST (1794421800000 ms)
 * - Main Festival Day: 8 November 2026
 *
 * Safe Gating & Testing Modes:
 * - URL overrides:
 *     ?diwali=1 | ?diwali=true | ?diwali=preview | ?diwali=on  -> Forces active
 *     ?diwali=0 | ?diwali=false | ?diwali=off                 -> Forces inactive
 *     ?diwali_date=2026-11-08T12:00:00+05:30                  -> Simulates specific date
 * - Environment variables:
 *     NEXT_PUBLIC_FORCE_DIWALI='true' | 'false'
 *     NEXT_PUBLIC_DIWALI_MODE='preview' | 'off'
 */

export const DIWALI_SCHEDULE = Object.freeze({
  year: 2026,
  timezone: 'Asia/Kolkata',
  utcOffset: '+05:30',
  startDateIso: '2026-11-02T00:00:00+05:30',
  endDateIso: '2026-11-12T00:00:00+05:30',
  festivalDateIso: '2026-11-08T00:00:00+05:30',
  startMs: 1793557800000,
  endMs: 1794421800000,
})

/**
 * Checks if a given epoch timestamp falls within the Diwali 2026 schedule window.
 * Uses exact UTC milliseconds derived from the IST schedule.
 *
 * @param {number} [timestamp=Date.now()]
 * @returns {boolean}
 */
export function isDiwaliScheduled(timestamp = Date.now()) {
  const time = typeof timestamp === 'number' ? timestamp : Number(timestamp)
  if (Number.isNaN(time)) return false
  return time >= DIWALI_SCHEDULE.startMs && time < DIWALI_SCHEDULE.endMs
}

/**
 * Normalizes query string parameter values for manual preview or override.
 *
 * @param {string | null | undefined} val
 * @returns {boolean | null}
 */
export function parseDiwaliOverride(val) {
  if (val == null) return null
  const cleaned = String(val).trim().toLowerCase()
  if (cleaned === '1' || cleaned === 'true' || cleaned === 'preview' || cleaned === 'on') return true
  if (cleaned === '0' || cleaned === 'false' || cleaned === 'off') return false
  return null
}

const getGlobalEnv = () => {
  if (typeof globalThis !== 'undefined' && globalThis.process?.env) {
    return globalThis.process.env
  }
  return {}
}

/**
 * Resolves whether the Diwali seasonal experience is currently active.
 * Hierarchy:
 * 1. Query parameter override (?diwali=... or ?diwali_date=...)
 * 2. Environment variable override (NEXT_PUBLIC_FORCE_DIWALI / NEXT_PUBLIC_DIWALI_MODE)
 * 3. Real-world IST schedule check
 *
 * @param {Object} [options]
 * @param {number} [options.now=Date.now()]
 * @param {URLSearchParams | string | null} [options.searchParams]
 * @param {Object} [options.env]
 * @returns {{ isActive: boolean, isOverride: boolean, isPreview: boolean, simulatedDate: string | null }}
 */
export function getDiwaliStatus({
  now = Date.now(),
  searchParams = null,
  env = getGlobalEnv(),
} = {}) {
  // 1. Check search parameter override
  let params = null
  if (searchParams instanceof URLSearchParams) {
    params = searchParams
  } else if (typeof searchParams === 'string') {
    params = new URLSearchParams(searchParams.startsWith('?') ? searchParams.slice(1) : searchParams)
  } else if (typeof window !== 'undefined' && window.location?.search) {
    params = new URLSearchParams(window.location.search)
  }

  if (params) {
    const override = parseDiwaliOverride(params.get('diwali'))
    if (override !== null) {
      return {
        isActive: override,
        isOverride: true,
        isPreview: override,
        simulatedDate: null,
      }
    }

    const simulatedDateParam = params.get('diwali_date')
    if (simulatedDateParam) {
      const parsedSimulated = Date.parse(
        simulatedDateParam.includes('+') || simulatedDateParam.endsWith('Z')
          ? simulatedDateParam
          : `${simulatedDateParam}T00:00:00+05:30`
      )
      if (!Number.isNaN(parsedSimulated)) {
        const active = isDiwaliScheduled(parsedSimulated)
        return {
          isActive: active,
          isOverride: true,
          isPreview: true,
          simulatedDate: new Date(parsedSimulated).toISOString(),
        }
      }
    }
  }

  // 2. Check environment variable override
  const envForce = env?.NEXT_PUBLIC_FORCE_DIWALI || env?.FORCE_DIWALI
  if (envForce != null) {
    const parsedEnv = parseDiwaliOverride(envForce)
    if (parsedEnv !== null) {
      return {
        isActive: parsedEnv,
        isOverride: true,
        isPreview: parsedEnv,
        simulatedDate: null,
      }
    }
  }

  const envMode = env?.NEXT_PUBLIC_DIWALI_MODE || env?.DIWALI_MODE
  if (envMode) {
    const parsedMode = parseDiwaliOverride(envMode)
    if (parsedMode !== null) {
      return {
        isActive: parsedMode,
        isOverride: true,
        isPreview: parsedMode,
        simulatedDate: null,
      }
    }
  }

  // 3. Automated schedule
  const active = isDiwaliScheduled(now)
  return {
    isActive: active,
    isOverride: false,
    isPreview: false,
    simulatedDate: null,
  }
}
