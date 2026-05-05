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

// 2026-05-05 — HUB submissions (enrolment / feedback / partner) bypass the
// CSO alert inbox and notify the HUB desk directly. Override via HUB_ALERT_EMAIL
// env var if the destination changes; default is desk@hamzury.com per founder.
const HUB_ALERT_TO = () => process.env.HUB_ALERT_EMAIL || "desk@hamzury.com";

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

// ─── HUB direct alerts (2026-05-05) ─────────────────────────────────────────
// /hub/enroll, /feedback, /partner all email desk@hamzury.com (HUB_ALERT_EMAIL
// override). These bypass the CSO inbox per founder rule — HUB owns its own
// triage. Fire-and-forget; SMTP unavailability never blocks form submission.

/** New /hub/enroll application — direct to skills_applications. */
export async function sendHubEnrolmentAlert(data: {
  ref: string;
  fullName: string;
  program: string;
  programCategory?: string | null;
  enrolmentType?: string | null;
  studentAge?: string | null;
  paymentPlan?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — Hub enrolment alert suppressed.");
    return;
  }
  const to = HUB_ALERT_TO();

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HUB] New enrolment — ${data.program} — ${data.ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1E3A5F;border-bottom:2px solid #B48C4C;padding-bottom:8px">
          New HUB Enrolment
        </h2>
        <p style="font-size:14px;color:#1D1D1F">
          A new /hub/enroll submission has landed. View it directly in the
          <a href="https://hamzury.com/hub/admin" style="color:#1E3A5F">HUB Admin Portal</a>
          under "Applications" — Submitted filter.
        </p>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold;width:140px">Ref</td><td style="padding:8px 12px;font-family:monospace">${data.ref}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold">Applicant</td><td style="padding:8px 12px">${escapeHtml(data.fullName)}</td></tr>
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Programme</td><td style="padding:8px 12px">${escapeHtml(data.program)}</td></tr>
          ${data.programCategory ? `<tr><td style="padding:8px 12px;font-weight:bold">Category</td><td style="padding:8px 12px">${escapeHtml(data.programCategory)}</td></tr>` : ""}
          ${data.enrolmentType ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Enrolment for</td><td style="padding:8px 12px">${escapeHtml(data.enrolmentType)}</td></tr>` : ""}
          ${data.studentAge ? `<tr><td style="padding:8px 12px;font-weight:bold">Age</td><td style="padding:8px 12px">${escapeHtml(data.studentAge)}</td></tr>` : ""}
          ${data.paymentPlan ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Payment plan</td><td style="padding:8px 12px">${escapeHtml(data.paymentPlan)}</td></tr>` : ""}
          ${data.phone ? `<tr><td style="padding:8px 12px;font-weight:bold">Phone</td><td style="padding:8px 12px">${escapeHtml(data.phone)}</td></tr>` : ""}
          ${data.email ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Email</td><td style="padding:8px 12px">${escapeHtml(data.email)}</td></tr>` : ""}
        </table>
        <p style="font-size:12px;color:#86868B">
          Action: confirm seat-hold receipt (₦10,000), assign to cohort, update status.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY HUB · Automated alert · Direct to HUB desk</p>
      </div>
    `,
  });

  console.log(`[email] Hub enrolment alert sent to ${to} for ref ${data.ref}`);
}

/** New /feedback submission — direct to hub_feedback. */
export async function sendHubFeedbackAlert(data: {
  ref: string;
  kind?: string | null;
  area?: string | null;
  summary?: string | null;
  story?: string | null;
  anonName?: string | null;
  anonEmail?: string | null;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — Hub feedback alert suppressed.");
    return;
  }
  const to = HUB_ALERT_TO();

  const isAnon = !data.anonName && !data.anonEmail;
  const kindBadge = data.kind?.toLowerCase().includes("complaint") || data.kind?.toLowerCase().includes("safety")
    ? "background:#FEF2F2;border-left:4px solid #DC2626"
    : "background:#F5F5F7;border-left:4px solid #B48C4C";

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HUB] New feedback — ${data.kind || "Other"} — ${data.ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1E3A5F;border-bottom:2px solid #B48C4C;padding-bottom:8px">
          New HUB Feedback
        </h2>
        <div style="${kindBadge};padding:12px 16px;margin:16px 0;font-size:13px">
          <strong>${escapeHtml(data.kind || "Feedback")}</strong>
          ${data.area ? ` · ${escapeHtml(data.area)}` : ""}
          ${isAnon ? " · <em>anonymous</em>" : ""}
        </div>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold;width:140px">Ref</td><td style="padding:8px 12px;font-family:monospace">${data.ref}</td></tr>
          ${data.summary ? `<tr><td style="padding:8px 12px;font-weight:bold">Summary</td><td style="padding:8px 12px">${escapeHtml(data.summary)}</td></tr>` : ""}
          ${data.anonName ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">From</td><td style="padding:8px 12px">${escapeHtml(data.anonName)}</td></tr>` : ""}
          ${data.anonEmail ? `<tr><td style="padding:8px 12px;font-weight:bold">Reply to</td><td style="padding:8px 12px">${escapeHtml(data.anonEmail)}</td></tr>` : ""}
        </table>
        ${data.story ? `
          <div style="background:#FAFAF7;padding:12px 16px;margin:16px 0;border-radius:6px;font-size:13px;line-height:1.6;white-space:pre-wrap">${escapeHtml(data.story)}</div>
        ` : ""}
        <p style="font-size:12px;color:#86868B">
          View in <a href="https://hamzury.com/hub/admin" style="color:#1E3A5F">HUB Admin → Feedback</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY HUB · Automated alert · Direct to HUB desk</p>
      </div>
    `,
  });

  console.log(`[email] Hub feedback alert sent to ${to} for ref ${data.ref}`);
}

/** New /partner outreach — direct to hub_partner_outreach. */
export async function sendHubPartnerAlert(data: {
  ref: string;
  orgName?: string | null;
  orgType?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  partnerInterest?: string | null;
  timeline?: string | null;
}) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — Hub partner alert suppressed.");
    return;
  }
  const to = HUB_ALERT_TO();

  await transport.sendMail({
    from: FROM(),
    to,
    subject: `[HUB] New partner outreach — ${data.orgName || "(no org)"} — ${data.ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1E3A5F;border-bottom:2px solid #B48C4C;padding-bottom:8px">
          New Partner Outreach
        </h2>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
          <tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold;width:140px">Ref</td><td style="padding:8px 12px;font-family:monospace">${data.ref}</td></tr>
          ${data.orgName ? `<tr><td style="padding:8px 12px;font-weight:bold">Organisation</td><td style="padding:8px 12px">${escapeHtml(data.orgName)}</td></tr>` : ""}
          ${data.orgType ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Type</td><td style="padding:8px 12px">${escapeHtml(data.orgType)}</td></tr>` : ""}
          ${data.contactName ? `<tr><td style="padding:8px 12px;font-weight:bold">Contact</td><td style="padding:8px 12px">${escapeHtml(data.contactName)}</td></tr>` : ""}
          ${data.contactEmail ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Email</td><td style="padding:8px 12px">${escapeHtml(data.contactEmail)}</td></tr>` : ""}
          ${data.contactPhone ? `<tr><td style="padding:8px 12px;font-weight:bold">Phone</td><td style="padding:8px 12px">${escapeHtml(data.contactPhone)}</td></tr>` : ""}
          ${data.timeline ? `<tr style="background:#F5F5F7"><td style="padding:8px 12px;font-weight:bold">Timeline</td><td style="padding:8px 12px">${escapeHtml(data.timeline)}</td></tr>` : ""}
        </table>
        ${data.partnerInterest ? `
          <h3 style="color:#1E3A5F;font-size:14px;margin-top:20px;margin-bottom:6px">Partnership interest</h3>
          <div style="background:#FAFAF7;padding:12px 16px;border-radius:6px;font-size:13px;line-height:1.6;white-space:pre-wrap">${escapeHtml(data.partnerInterest)}</div>
        ` : ""}
        <p style="font-size:12px;color:#86868B;margin-top:20px">
          Form copy commits to a 2-business-day response.
          View in <a href="https://hamzury.com/hub/admin" style="color:#1E3A5F">HUB Admin → Partners</a>.
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0">
        <p style="font-size:11px;color:#86868B">HAMZURY HUB · Automated alert · Direct to HUB desk</p>
      </div>
    `,
  });

  console.log(`[email] Hub partner alert sent to ${to} for ref ${data.ref}`);
}

/** Cheap HTML escape — prevents form input from breaking the alert markup. */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
