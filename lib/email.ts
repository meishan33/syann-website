import { Resend } from 'resend'
import { supabaseAdmin } from './supabase-admin'

// Constructed lazily inside sendEmail() rather than at module scope — Resend's
// constructor throws synchronously if the key is missing/empty, which would
// otherwise crash the build step for every route that imports this module.
let resend: Resend | null = null

const FROM = 'SYANN.CO <hello@syann.co>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://syann.co'

// Email clients strip <style> blocks and don't load the site's @import'd Google
// Fonts, so these templates use inline styles + web-safe fallbacks only
// (Georgia for headings, Helvetica/Arial for body) — not the site's actual fonts.
const GOLD = '#B08B57'
const DARK = '#4A3A32'
const CREAM = '#F6F1EB'

const CTA_BLOCK = `
<div style="margin-top:24px;padding-top:20px;border-top:1px solid #F0E8DF;text-align:center;">
  <a href="${SITE_URL}/energy-quiz" style="display:inline-block;font-size:12px;font-weight:600;letter-spacing:0.04em;color:${GOLD};text-decoration:none;">
    Analyze Your Energy &amp; Discover Your Bracelet Now &gt;&gt;
  </a>
</div>`

function wrapper(bodyHtml: string): string {
  return `
<div style="background:${CREAM};padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5DDD5;">
    <div style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #F0E8DF;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:${DARK};letter-spacing:0.04em;">SYANN.CO</p>
      <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Crystals · Energy · You</p>
    </div>
    <div style="padding:32px;">
      ${bodyHtml}
    </div>
    <div style="padding:20px 32px;background:${CREAM};text-align:center;">
      <p style="margin:0;font-size:11px;color:#9A8573;">Questions? Reply to this email or reach us at hello@syann.co</p>
    </div>
  </div>
</div>`.trim()
}

export async function getAdminEmails(): Promise<string[]> {
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id').eq('is_admin', true)
  if (!profiles?.length) return []
  const adminIds = new Set(profiles.map(p => p.id))
  const { data } = await supabaseAdmin.auth.admin.listUsers()
  return (data?.users ?? []).filter(u => adminIds.has(u.id) && u.email).map(u => u.email!)
}

export async function notifyAdmins({ subject, html }: { subject: string; html: string }) {
  const adminEmails = await getAdminEmails()
  await Promise.all(adminEmails.map(to => sendEmail({ to, subject, html })))
}

// Spam filters flag single-part HTML-only emails more readily than properly
// multipart messages — derive a plain-text alternative from the HTML rather
// than hand-writing one per template.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email not sent — RESEND_API_KEY is not set:', subject, 'to', to)
    return
  }
  try {
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from: FROM, to, subject, html, text: htmlToText(html) })
  } catch (err) {
    // Email failures must never break the order/webhook/contact flow that
    // triggered them — the underlying database write has already succeeded.
    console.error('Failed to send email:', subject, 'to', to, err)
  }
}

export function orderConfirmationEmail({
  orderNumber, customerName, items, totalAmount, shippingAddress,
}: {
  orderNumber: number | string | null
  customerName: string | null
  items: string
  totalAmount: number
  shippingAddress: string | null
}) {
  const subject = `Order Confirmed${orderNumber ? ` — #${orderNumber}` : ''} · SYANN.CO`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Order Confirmed</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      Thank You${customerName ? `, ${customerName.split(' ')[0]}` : ''}
    </h1>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.7;color:#7A5B45;">
      Your order is confirmed and being prepared with care. We'll be in touch soon with updates.
    </p>
    <div style="background:${CREAM};border-radius:10px;padding:18px 20px;margin-bottom:20px;">
      ${orderNumber ? `<p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">Order <strong style="color:${DARK};">#${orderNumber}</strong></p>` : ''}
      <p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">${items}</p>
      <p style="margin:0;font-size:16px;font-family:Georgia,serif;color:${DARK};">S$${totalAmount.toFixed(2)}</p>
    </div>
    ${shippingAddress ? `
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9A8573;">Shipping To</p>
    <p style="margin:0;font-size:12px;color:${DARK};">${shippingAddress}</p>
    ` : ''}
    ${CTA_BLOCK}
  `)
  return { subject, html }
}

export function welcomeEmail({ name, code, discountLabel }: { name: string | null; code: string | null; discountLabel: string | null }) {
  const subject = `Welcome to SYANN.CO${code ? ` — here's ${discountLabel} off` : ''}`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Welcome</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      Glad You're Here${name ? `, ${name.split(' ')[0]}` : ''}
    </h1>
    <p style="margin:0 0 ${code ? 20 : 0}px;font-size:13px;line-height:1.7;color:#7A5B45;">
      Thank you for creating an account with SYANN.CO. We can't wait for you to discover crystals aligned with your energy.
    </p>
    ${code ? `
    <div style="background:${CREAM};border-radius:10px;padding:20px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9A8573;">Enjoy ${discountLabel} Off Your First Order</p>
      <p style="margin:0;font-size:22px;font-family:Georgia,serif;letter-spacing:0.08em;color:${DARK};">${code}</p>
    </div>
    ` : ''}
    ${CTA_BLOCK}
  `)
  return { subject, html }
}

export function inquiryAcknowledgementEmail({ name, subject: inquirySubject }: { name: string | null; subject: string }) {
  const subject = `We've received your message · SYANN.CO`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Message Received</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      Thank You${name ? `, ${name.split(' ')[0]}` : ''}
    </h1>
    <p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#7A5B45;">
      We've received your message and will get back to you within 24–48 hours.
    </p>
    <div style="background:${CREAM};border-radius:10px;padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9A8573;">Subject</p>
      <p style="margin:0;font-size:13px;color:${DARK};">${inquirySubject}</p>
    </div>
    ${CTA_BLOCK}
  `)
  return { subject, html }
}

export function newOrderAdminEmail({
  orderType, orderNumber, customerName, customerEmail, items, totalAmount,
}: {
  orderType: 'bracelet' | 'shop'
  orderNumber: number | string | null
  customerName: string | null
  customerEmail: string | null
  items: string
  totalAmount: number
}) {
  const subject = `New ${orderType === 'bracelet' ? 'Bracelet' : 'Shop'} Order${orderNumber ? ` — #${orderNumber}` : ''} · SYANN.CO`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">New Order</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      ${orderType === 'bracelet' ? 'Bracelet' : 'Shop'} Order Received
    </h1>
    <div style="background:${CREAM};border-radius:10px;padding:18px 20px;margin-bottom:20px;">
      ${orderNumber ? `<p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">Order <strong style="color:${DARK};">#${orderNumber}</strong></p>` : ''}
      <p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">${customerName || 'Unknown customer'} — ${customerEmail || 'no email'}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">${items}</p>
      <p style="margin:0;font-size:16px;font-family:Georgia,serif;color:${DARK};">S$${totalAmount.toFixed(2)}</p>
    </div>
    <a href="${SITE_URL}/admin" style="display:inline-block;padding:10px 20px;background:${DARK};color:#fff;text-decoration:none;border-radius:999px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">View in Admin</a>
  `)
  return { subject, html }
}

export function newInquiryAdminEmail({ name, email, subject: inquirySubject, message }: { name: string | null; email: string | null; subject: string; message: string }) {
  const subject = `New Inquiry: ${inquirySubject} · SYANN.CO`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">New Inquiry</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      ${name || 'Someone'} contacted you
    </h1>
    <div style="background:${CREAM};border-radius:10px;padding:18px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#7A5B45;">${name || 'Unknown'} — ${email || 'no email'}</p>
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9A8573;">Subject</p>
      <p style="margin:0 0 12px;font-size:13px;color:${DARK};">${inquirySubject}</p>
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9A8573;">Message</p>
      <p style="margin:0;font-size:13px;color:${DARK};white-space:pre-wrap;">${message}</p>
    </div>
    <a href="${SITE_URL}/admin" style="display:inline-block;padding:10px 20px;background:${DARK};color:#fff;text-decoration:none;border-radius:999px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">View in Admin</a>
  `)
  return { subject, html }
}

export function orderStatusUpdateEmail({ orderNumber, status }: { orderNumber: number | string | null; status: string }) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
  const subject = `Order Update${orderNumber ? ` — #${orderNumber}` : ''}: ${statusLabel} · SYANN.CO`
  const html = wrapper(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Order Update</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${DARK};">
      Your Order is ${statusLabel}
    </h1>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#7A5B45;">
      ${orderNumber ? `Order <strong style="color:${DARK};">#${orderNumber}</strong> ` : 'Your order '}has been updated to <strong style="color:${DARK};">${statusLabel}</strong>.
    </p>
    ${CTA_BLOCK}
  `)
  return { subject, html }
}
