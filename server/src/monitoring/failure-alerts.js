import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '../config/env.js'
import { sendEmail } from '../services/email.js'
import { hasFailureSpike } from './log-insights.js'
import { log, logConfig, workerCall } from './index.js'

const recipient = process.env.LOG_FAILURE_ALERT_EMAIL?.trim()
const enabled = Boolean(recipient && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(recipient) && env.smtp.host && env.smtp.user)
export const failureAlertEnabled = () => enabled

export function startFailureSpikeAlerts() {
  if (!enabled) return () => {}
  const directory = logConfig.directory + '.failure-alerts'
  let running = false, checkedHour
  let stopped = false

  async function check() {
    if (running || stopped) return
    running = true
    try {
      const { hourly } = await workerCall('read', { insightsOnly: true, alertOnly: true })
      if (checkedHour === hourly.endingAt || Date.now() - Date.parse(hourly.endingAt) < 60000) return
      if (!hasFailureSpike(hourly)) { checkedHour = hourly.endingAt; return }
      const key = new Date(hourly.endingAt).getTime()
      if (!Number.isFinite(key)) return
      await fs.mkdir(directory, { mode: 0o700, recursive: true })
      for (const name of await fs.readdir(directory)) {
        if (/^\d+\.sent$/.test(name) && Number(name.split('.')[0]) < key - 2 * 86400000) {
          await fs.unlink(path.join(directory, name)).catch(() => {})
        }
      }
      const claim = path.join(directory, key + '.sent')
      try { await fs.writeFile(claim, '', { mode: 0o600, flag: 'wx' }) }
      catch (error) {
        if (error.code !== 'EEXIST') throw error
        checkedHour = hourly.endingAt
        return
      }
      try {
        const endingAt = new Date(hourly.endingAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        const text = 'Tokriii recorded ' + hourly.latest + ' customer failures in the hour ending ' + endingAt +
          ' IST. The hour before that had ' + hourly.previous + '. Review ' + env.appUrl + env.adminPath + '/pages/logs.'
        if (!(await sendEmail({ to: recipient, subject: 'Tokriii customer failures increased', text })).sent) throw new Error('Mail unavailable')
        log('api', 'monitoring.failure_alert.sent', { status: 'success', source: 'system', count: hourly.latest })
      } catch (error) {
        await fs.unlink(claim).catch(() => {})
        throw error
      }
      checkedHour = hourly.endingAt
    } catch {
      log('error', 'monitoring.failure_alert.failed', { status: 'failure', source: 'system' })
    } finally { running = false }
  }
  // An exact minute boundary is unnecessary because comparisons use closed IST hours.
  const timer = setInterval(check, 60000)
  timer.unref()
  void check()
  return () => { stopped = true; clearInterval(timer) }
}
