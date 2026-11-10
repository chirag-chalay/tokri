import { log } from '../monitoring/index.js'
import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter = null

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter()

  if (!transport) {
    log('error', 'email.unconfigured', { status: 'skipped' })
    return { dev: true, sent: false }
  }

  await transport.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  })

  return { sent: true }
}

export async function sendPasswordResetEmail(user, resetUrl) {
  const subject = 'Reset your Tokriii admin password'
  const displayName = user.name || user.username || 'there'
  const text = `Hello ${displayName},

We received a request to reset your Tokriii admin password.

Open this one-time link within 1 hour:
${resetUrl}

If you did not request this, you can safely ignore this email. Your password will not change.`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#022c22;margin:0 0 12px;">Reset your Tokriii admin password</h2>
      <p>Hello ${displayName},</p>
      <p>We received a request to reset your Tokriii admin password.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
          Reset password
        </a>
      </p>
      <p>This one-time link is valid for 1 hour.</p>
      <p style="font-size:13px;color:#64748b;">If the button does not work, copy and paste this URL into your browser:<br />${resetUrl}</p>
      <p>If you did not request this, you can safely ignore this email. Your password will not change.</p>
    </div>
  `

  if (!user.email) {
    throw new Error('User has no email address on file')
  }

  return sendEmail({ to: user.email, subject, html, text })
}

export async function sendPartnerPasswordEmail(partner, setUrl, { isReset = false, forgotUrl = '' } = {}) {
  const subject = isReset
    ? 'Reset your Tokriii delivery partner password'
    : 'Set your Tokriii delivery partner password'
  const displayName = partner.name || 'there'
  const action = isReset ? 'reset' : 'create'
  const intro = isReset
    ? 'We received a request to reset your Tokriii Partner password.'
    : 'Tokriii created a delivery partner account for you.'
  const forgotLine = forgotUrl
    ? `\nIf you forget it later, use:\n${forgotUrl}\n`
    : '\n'
  const text = `Hello ${displayName},

${intro}

Use this one-time link within 24 hours to ${action} your password:
${setUrl}

Then open the Tokriii Partner app and sign in with:
Email: ${partner.email}
${forgotLine}If you did not expect this email, you can ignore it.`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#022c22;margin:0 0 12px;">${subject}</h2>
      <p>Hello ${displayName},</p>
      <p>${intro} Use the button below to ${action} your password.</p>
      <p>
        <a href="${setUrl}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
          ${isReset ? 'Reset password' : 'Create password'}
        </a>
      </p>
      <p>This one-time link is valid for 24 hours.</p>
      <p>After that, open the <strong>Tokriii Partner</strong> app and sign in with <strong>${partner.email}</strong>.</p>
      ${forgotUrl ? `<p>Forgot it later? <a href="${forgotUrl}">Request a new password link</a>.</p>` : ''}
      <p style="font-size:13px;color:#64748b;">If the button does not work, copy this URL:<br />${setUrl}</p>
    </div>
  `

  return sendEmail({ to: partner.email, subject, html, text })
}
