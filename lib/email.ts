import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'SYANN.CO <hello@syann.co>'

// Email clients strip <style> blocks and don't load the site's @import'd Google
// Fonts, so these templates use inline styles + web-safe fallbacks only
// (Georgia for headings, Helvetica/Arial for body) — not the site's actual fonts.
const GOLD = '#B08B57'
const DARK = '#4A3A32'
const CREAM = '#F6F1EB'

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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email not sent — RESEND_API_KEY is not set:', subject, 'to', to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
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
  `)
  return { subject, html }
}
