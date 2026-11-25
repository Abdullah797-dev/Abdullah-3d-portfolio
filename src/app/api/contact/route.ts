import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { persona } from '@/lib/portfolio-data'

export const runtime = 'nodejs'
export const maxDuration = 30

/* Honeypot + rate-limit-style throttle (in-memory per process) */
const recentIPs = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (recentIPs.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    return true
  }
  hits.push(now)
  recentIPs.set(ip, hits)
  return false
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const name: string = (body?.name ?? '').toString().trim()
    const email: string = (body?.email ?? '').toString().trim()
    const subject: string = (body?.subject ?? '').toString().trim()
    const projectType: string = (body?.projectType ?? 'General enquiry').toString().trim()
    const message: string = (body?.message ?? '').toString().trim()
    // Honeypot field — must be empty
    const honeypot: string = (body?.website ?? '').toString().trim()

    if (honeypot) {
      // Bot filled the hidden field — silently succeed without sending
      return NextResponse.json({ ok: true, fake: true })
    }

    /* ---- backend validation ---- */
    const errors: Record<string, string> = {}
    if (!name || name.length < 2) errors.name = 'Please enter your name (min 2 chars).'
    if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
    if (!subject || subject.length < 3) errors.subject = 'Subject must be at least 3 characters.'
    if (!['Internship', 'Freelance', 'Full-time', 'General enquiry'].includes(projectType)) {
      errors.projectType = 'Please choose a valid project type.'
    }
    if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters.'
    if (message.length > 5000) errors.message = 'Message is too long (max 5000 chars).'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed.', fields: errors }, { status: 422 })
    }

    // Basic spam keyword filter
    const spamRe = /(viagra|casino|crypto\s+airdrop|sex|porn|lottery winner)/i
    if (spamRe.test(`${subject} ${message}`)) {
      return NextResponse.json({ error: 'Message flagged as spam.' }, { status: 422 })
    }

    /* ---- send email via Nodemailer ---- */
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT ?? '587')
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const to = process.env.CONTACT_TO_EMAIL ?? persona.email
    const from = process.env.CONTACT_FROM_EMAIL ?? user ?? 'portfolio@localhost'

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })

      const info = await transporter.sendMail({
        from: `"Portfolio Contact" <${from}>`,
        to,
        replyTo: email,
        subject: `[Portfolio] ${subject}`,
        text: `New message from your portfolio contact form.

Name: ${name}
Email: ${email}
Project type: ${projectType}
Subject: ${subject}
IP: ${ip}
Time: ${new Date().toISOString()}

Message:
${message}
`,
        html: `
          <div style="font-family: ui-sans-serif, system-ui; max-width: 560px; padding: 24px;">
            <h2 style="color: #1a2e1a; margin: 0 0 16px;">New portfolio message</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 100px;">Name</td><td style="padding: 6px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Project type</td><td style="padding: 6px 0;">${escapeHtml(projectType)}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Subject</td><td style="padding: 6px 0;">${escapeHtml(subject)}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">IP</td><td style="padding: 6px 0;">${escapeHtml(ip)}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
          </div>
        `,
      })

      return NextResponse.json({
        ok: true,
        messageId: info.messageId,
        delivered: true,
      })
    } else {
      // No SMTP credentials configured — log + return success so the UX works
      console.warn(
        '[/api/contact] SMTP credentials not set. Set SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL to enable real delivery.',
      )
      console.log('[contact-form submission]', { name, email, subject, message, ip })
      return NextResponse.json({
        ok: true,
        delivered: false,
        note: 'SMTP credentials not configured on the server. Your message was logged and the form worked end-to-end — set SMTP_HOST/SMTP_USER/SMTP_PASS to deliver real email.',
      })
    }
  } catch (err) {
    console.error('[/api/contact] error', err)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email directly.' },
      { status: 500 },
    )
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function GET() {
  return NextResponse.json({
    name: 'Contact API',
    description:
      'Submit contact form (name, email, projectType, subject, message). Validates input, applies rate limiting & spam protection, sends email via Nodemailer SMTP if env vars configured.',
    method: 'POST',
    body: { name: 'string', email: 'string', projectType: 'Internship | Freelance | Full-time', subject: 'string', message: 'string', website: 'honeypot (must be empty)' },
    envRequired: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'],
  })
}
