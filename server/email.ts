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
  scholarshipCode?: string | null;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — new lead alert suppressed.");
    return;
  }
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
          ${data.scholarshipCode ? `<tr style="background:#FFF7E6"><td style="padding:8px 12px;font-weight:bold">Scholarship</td><td style="padding:8px 12px">Paid via scholarship code: <code>${data.scholarshipCode}</code></td></tr>` : ""}
        </table>
        <p style="font-size:13px;color:#86868B">
          View in <a href="https://hamzury.com/cso" style="color:#1B4D3E">CSO Portal</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY Business Services · Automated alert</p>
      </div>
    `,
  });

  console.log(`[email] New lead alert sent to ${to} for ref ${data.ref}`);
}

/**
 * Sent when a Clarity Session matches multiple Hamzury divisions.
 * One consolidated email — NOT one per company. Per the
 * "SINGLE POINT OF CONTACT RULE" (MASTER-CHAT-FLOW.md §4), only the CSO
 * contacts the visitor; companies do NOT each reach out separately.
 */
export async function sendClarityMultiMatchEmail(data: {
  primaryRef: string;
  visitorName: string;
  businessName?: string | null;
  phone?: string | null;
  email?: string | null;
  matches: Array<{
    company: string;       // human label, e.g. "Bizdoc"
    primaryService: string;
    reason: string;
    ref: string;
  }>;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — clarity multi-match alert suppressed.");
    return;
  }
  const to = ALERT_TO();
  if (!to) return;

  const matchRows = data.matches
    .map(
      (m, i) => `
        <tr style="${i % 2 === 0 ? "background:#F5F5F7" : ""}">
          <td style="padding:8px 12px;font-weight:bold;color:#1B4D3E">${m.company}</td>
          <td style="padding:8px 12px">${m.primaryService}</td>
          <td style="padding:8px 12px;color:#86868B;font-size:12px">${m.reason}</td>
          <td style="padding:8px 12px;font-family:monospace;font-size:12px">${m.ref}</td>
        </tr>`,
    )
    .join("");

  const subject = `New Clarity Session — ${data.visitorName} matches ${data.matches.length} division(s)`;

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HAMZURY] ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
        <h2 style="color:#1B4D3E;border-bottom:2px solid #C9A97E;padding-bottom:8px">
          Clarity Session — Multi-Division Match
        </h2>

        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold;width:120px">Visitor</td><td style="padding:8px 12px">${data.visitorName}</td></tr>
          ${data.businessName ? `<tr><td style="padding:8px 12px;font-weight:bold">Business</td><td style="padding:8px 12px">${data.businessName}</td></tr>` : ""}
          ${data.phone ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Phone</td><td style="padding:8px 12px">${data.phone}</td></tr>` : ""}
          ${data.email ? `<tr><td style="padding:8px 12px;font-weight:bold">Email</td><td style="padding:8px 12px">${data.email}</td></tr>` : ""}
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Primary Ref</td><td style="padding:8px 12px;font-family:monospace">${data.primaryRef}</td></tr>
        </table>

        <h3 style="color:#1B4D3E;margin-top:24px;margin-bottom:8px">
          Matched Divisions (${data.matches.length})
        </h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:8px 0">
          <thead>
            <tr style="background:#1B4D3E;color:#fff">
              <th align="left" style="padding:8px 12px">Company</th>
              <th align="left" style="padding:8px 12px">Service</th>
              <th align="left" style="padding:8px 12px">Reason</th>
              <th align="left" style="padding:8px 12px">Lead Ref</th>
            </tr>
          </thead>
          <tbody>
            ${matchRows}
          </tbody>
        </table>

        <div style="background:#FFF8E7;border-left:4px solid #C9A97E;padding:12px 16px;margin:24px 0;font-size:13px;color:#1D1D1F">
          <strong style="color:#1B4D3E">SINGLE POINT OF CONTACT RULE</strong><br/>
          Only CSO reaches out. Bizdoc, Scalar, Medialy and HUB must NOT
          contact this visitor separately. CSO runs ONE consolidated
          conversation covering every matched division above.
        </div>

        <p style="font-size:13px;color:#86868B">
          View all leads in the
          <a href="https://hamzury.com/cso" style="color:#1B4D3E">CSO Portal</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY Business Services · Automated alert · Clarity Session multi-match</p>
      </div>
    `,
  });

  console.log(
    `[email] Clarity multi-match alert sent to ${to} — primary ${data.primaryRef}, ${data.matches.length} division(s)`,
  );
}
