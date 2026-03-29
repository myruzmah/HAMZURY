/**
 * Email utility — sends operational alerts via SMTP.
 *
 * Required env vars (set in Railway):
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 587
 *   SMTP_USER      your Gmail address
 *   SMTP_PASS      Gmail App Password (not regular password)
 *   ALERT_EMAIL    address that receives payment/lead alerts
 */
import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user, pass },
  });
}

const ALERT_TO = () => process.env.ALERT_EMAIL || process.env.SMTP_USER || "";
const FROM = () => `HAMZURY Alerts <${process.env.SMTP_USER || "noreply@hamzury.com"}>`;

/** Sent when a client clicks "I've Paid" on their invoice. */
export async function sendPaymentClaimedAlert(data: {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  phone?: string | null;
  email?: string | null;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — payment claimed alert suppressed.");
    return;
  }
  const to = ALERT_TO();
  if (!to) return;

  const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(data.amount);

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HAMZURY] Payment Claimed — ${data.invoiceNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1B4D3E;border-bottom:2px solid #C9A97E;padding-bottom:8px">
          Payment Claimed
        </h2>
        <p style="font-size:14px;color:#1D1D1F">
          A client has clicked <strong>"I've Paid"</strong> and is awaiting confirmation.
        </p>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Invoice</td><td style="padding:8px 12px">${data.invoiceNumber}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold">Client</td><td style="padding:8px 12px">${data.clientName}</td></tr>
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Amount</td><td style="padding:8px 12px;color:#1B4D3E;font-weight:bold">${naira}</td></tr>
          ${data.phone ? `<tr><td style="padding:8px 12px;font-weight:bold">Phone</td><td style="padding:8px 12px">${data.phone}</td></tr>` : ""}
          ${data.email ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Email</td><td style="padding:8px 12px">${data.email}</td></tr>` : ""}
        </table>
        <p style="font-size:13px;color:#86868B">
          Please verify the bank transfer and confirm payment in the
          <a href="https://hamzury.com/hub/finance" style="color:#1B4D3E">Finance Dashboard</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY Business Services · Automated alert</p>
      </div>
    `,
  });

  console.log(`[email] Payment claimed alert sent to ${to} for invoice ${data.invoiceNumber}`);
}

/** Sent when a new lead is submitted from any portal. */
export async function sendNewLeadAlert(data: {
  ref: string;
  clientName: string;
  service: string;
  phone?: string | null;
  email?: string | null;
  source: string;
}) {
  const transport = getTransport();
  if (!transport) return;
  const to = ALERT_TO();
  if (!to) return;

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HAMZURY] New Lead — ${data.ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1B4D3E;border-bottom:2px solid #C9A97E;padding-bottom:8px">
          New Lead Received
        </h2>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Ref</td><td style="padding:8px 12px;font-family:monospace">${data.ref}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold">Client</td><td style="padding:8px 12px">${data.clientName}</td></tr>
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Service</td><td style="padding:8px 12px">${data.service}</td></tr>
          ${data.phone ? `<tr><td style="padding:8px 12px;font-weight:bold">Phone</td><td style="padding:8px 12px">${data.phone}</td></tr>` : ""}
          ${data.email ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Email</td><td style="padding:8px 12px">${data.email}</td></tr>` : ""}
          <tr><td style="padding:8px 12px;font-weight:bold">Source</td><td style="padding:8px 12px">${data.source}</td></tr>
        </table>
        <p style="font-size:13px;color:#86868B">
          View in <a href="https://hamzury.com/hub/cso" style="color:#1B4D3E">CSO Dashboard</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY Business Services · Automated alert</p>
      </div>
    `,
  });

  console.log(`[email] New lead alert sent to ${to} for ref ${data.ref}`);
}
