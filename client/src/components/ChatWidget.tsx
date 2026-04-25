import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare, X, Phone, Star, ChevronRight, ChevronLeft, Search,
  BookOpen, CreditCard, Building2, Rocket, ShieldCheck, Clock, Users,
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════════
   HAMZURY Chat — v10: SELF-SERVICE FAQ
   --------------------------------------------------------------------------
   Mode: Pure FAQ. No AI. No lead intake. No payment flow.
   Anything that needs a human → deflects to WhatsApp with pre-filled
   context, so the CSO Lead Handler can enter the client into the
   11-stage flow (STAGE 1: Add to tracking sheet within 30 min).
   ══════════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";

type Props = {
  department?: Department;
  open?: boolean;
  onClose?: () => void;
  isDashboard?: boolean;
};

/* ── Brand constants ───────────────────────────────────────────────────── */
const CHARCOAL = "#2D2D2D";
const GOLD     = "#B48C4C";
const CREAM    = "#FFFAF6";
const DARK     = "#1A1A1A";
const MUTED    = "#6B7280";
const HAIRLINE = "#E7E5E4";

const DEPT_BRAND: Record<Department, { header: string; accent: string; name: string }> = {
  general:   { header: "#1E3A8A", accent: "#C9A97E", name: "HAMZURY" },
  bizdoc:    { header: "#1B4D3E", accent: "#C9A97E", name: "Bizdoc" },
  systemise: { header: "#D4A017", accent: "#0F172A", name: "Scalar" },
  skills:    { header: "#1E3A5F", accent: "#B48C4C", name: "HUB" },
};

/* ── Contact (Brand Bible) ─────────────────────────────────────────────── */
const CSO_WHATSAPP = "2349130700056"; // CSO / Lead Handler — international, no +
const CSO_PHONE    = "2349130700056";

/* ══════════════════════════════════════════════════════════════════════════
   FAQ CONTENT
   Pulled from Brand Bible + Operations Source of Truth.
   Every answer ends with a WhatsApp deflection so the CSO Lead Handler
   can pick up per the HAMZURY CSO FLOW DIAGRAM (Stage 1).
   ══════════════════════════════════════════════════════════════════════════ */

type FAQ = { q: string; a: string };
type FAQCategory = {
  id: string;
  title: string;
  summary: string;
  icon: React.ElementType;
  accent: string;
  items: FAQ[];
};

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "services",
    title: "Our Services",
    summary: "What each HAMZURY division does",
    icon: Building2,
    accent: "#1B4D3E",
    items: [
      {
        q: "What does Bizdoc handle?",
        a: "Bizdoc is our tax & compliance division. We register companies with CAC, file annual returns, obtain TIN/TCC, SCUML, industry licences, and manage ongoing FIRS filings. If it's legal paperwork for your business, Bizdoc handles it.",
      },
      {
        q: "What does Scalar build?",
        a: "Scalar is our web + automation division. We build professional websites, client dashboards, CRMs, WhatsApp integrations, and AI agents. Simply: websites that work, systems that scale.",
      },
      {
        q: "What does Medialy manage?",
        a: "Medialy is our social media division. We run Instagram, TikTok, Facebook, LinkedIn — content calendars, posting, growth, and ads. Social media that actually brings clients.",
      },
      {
        q: "What does HUB teach?",
        a: "HUB is our tech-skills training wing. We teach Code Craft, Digital Literacy, AI for Founders, Basic Computer Skills (for kids and adults), and RIDI sponsored cohorts. Tech skills that get you paid.",
      },
      {
        q: "Do you work with businesses outside Nigeria?",
        a: "Yes. Bizdoc handles foreign business setup and Nigerian-registration for diaspora founders. Scalar and Medialy serve clients in any timezone. Send us a WhatsApp message and the CSO team will tell you how we'd structure it.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Packages",
    summary: "How each division's packages are priced",
    icon: CreditCard,
    accent: "#D4A017",
    items: [
      {
        q: "How much does Bizdoc charge?",
        a: "Four tiers: Starter (₦200,000 — CAC Ltd + EFCC + Tax ProMax), Growth (₦450,000 — + Branding + Business Plan), Pro (₦570,000 — + 1 yr Tax Management + Contracts), Enterprise (₦1,000,000 — + ITF/NSITF/PENCOM/BPP). Individual services also available from ₦30,000.",
      },
      {
        q: "How much does Scalar charge?",
        a: "Presence ₦300,000 (website), Growth ₦500,000 (website + lead capture), Automate ₦1,000,000 (website + CRM + automations — our most popular), Platform ₦2,000,000 (custom dashboards + AI).",
      },
      {
        q: "How much does Medialy charge?",
        a: "Setup ₦50,000 (one-time profile setup), Manage ₦150,000/month, Accelerate ₦300,000/month (our most popular — content + ads), Authority ₦500,000/month (full brand presence).",
      },
      {
        q: "How much does HUB charge?",
        a: "Single courses ₦25,000 – ₦100,000 depending on length. Full certifications ₦200,000 – ₦400,000. Team training for organisations from ₦500,000. RIDI cohort is sponsored (free for selected applicants).",
      },
      {
        q: "Do you offer discounts?",
        a: "We don't discount below listed prices. If your budget is tight, we'll usually recommend a smaller package or a payment plan rather than cut quality. Talk to us on WhatsApp and we'll show you the closest fit.",
      },
      {
        q: "Can I pay in instalments?",
        a: "Yes, for packages ₦300,000 and up. Typical split: 50% to start, 50% before delivery. For ongoing services (Medialy monthly, Bizdoc compliance), we bill at the start of each cycle. WhatsApp the CSO team to set up a plan.",
      },
    ],
  },
  {
    id: "start",
    title: "Getting Started",
    summary: "What happens after you reach out",
    icon: Rocket,
    accent: "#1D4ED8",
    items: [
      {
        q: "How do I actually start?",
        a: "Tap the WhatsApp button at the bottom of this page. You'll reach our CSO Lead Handler within 2 hours. They'll ask 3 short questions (what service, timeline, budget range), then route you to the right Closer — either a direct proposal or a short diagnosis form.",
      },
      {
        q: "What information will you ask me for?",
        a: "At first contact: your name, the service you need, your timeline, and a rough budget. That's it. If the project is complex, we send a short form to get the detail we need before quoting. We never ask for payment details in chat.",
      },
      {
        q: "How fast do you respond?",
        a: "Lead Handler acknowledges within 2 hours. Closer contacts you within 24 hours. Strategy PDFs (for complex projects) are back within 24 hours of you completing the diagnosis form. All locked into our CSO flow.",
      },
      {
        q: "Do I need to prepare anything before we talk?",
        a: "Not really. A rough idea of what you want and when you want it live is enough. If you have a reference site you like, a logo, or documents (like CAC certificate for existing companies), have them on hand — but we can start without them.",
      },
      {
        q: "Can we meet in person?",
        a: "Yes — we're in Kano. Book a visit through the CSO team on WhatsApp. Most clients don't need an in-person meeting; WhatsApp + one short call usually covers it.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment & Invoices",
    summary: "How billing works",
    icon: ShieldCheck,
    accent: "#1E3A5F",
    items: [
      {
        q: "How do I pay?",
        a: "By bank transfer to our company account. The CSO team sends you an invoice with the exact account number and reference code (format: HMZ-INV-XXX). Never send money to a personal account — every legitimate invoice uses the company account on the invoice document.",
      },
      {
        q: "Do you accept card or crypto?",
        a: "Bank transfer is primary. For international clients we can accept USD wire or Wise transfer by arrangement. We don't accept crypto at the moment.",
      },
      {
        q: "What's your refund policy?",
        a: "Work not started: full refund. Work started: pro-rated refund based on hours logged. We want you happy — if something's wrong, tell the Closer first and we'll usually fix it rather than refund. Refunds are escalated to the founder for approval.",
      },
      {
        q: "Can you send a receipt?",
        a: "Yes — once payment clears, the Coordinator sends an official receipt by email and WhatsApp within the same day, plus a formal Tax Invoice if your business needs it for accounting.",
      },
      {
        q: "What does my invoice reference mean?",
        a: "Every invoice is HMZ-INV-XXX (three digits, sequential). Every client tracking code is HMZ-YY/M-XXXX (year/month/phone-last-4). Quote this code in every message and it goes straight to the right file.",
      },
    ],
  },
  {
    id: "compliance",
    title: "Tax & Compliance",
    summary: "Bizdoc-specific questions",
    icon: BookOpen,
    accent: "#1B4D3E",
    items: [
      {
        q: "Am I owing tax penalties?",
        a: "Possibly — any Nigerian business that's missed filing dates may have late-filing penalties. Bizdoc runs a free compliance check: we look up your CAC / TIN status and tell you exactly what's outstanding. WhatsApp us your company name and we'll come back within 24 hours with the full picture.",
      },
      {
        q: "I haven't filed annual returns in years. Is it too late?",
        a: "No. Bizdoc regularly clears 5 – 10 years of missed returns in one batch filing. Penalties apply, but they cap — and your company stays active. Send your CAC number to our WhatsApp; we'll quote the exact back-filing cost.",
      },
      {
        q: "Do I need SCUML?",
        a: "Only if your business is in a regulated category (property, jewellery, precious-metals, car dealership, legal practice, accounting, etc.) or you deal with cash over regulatory thresholds. Bizdoc will tell you whether you need it before you pay for it.",
      },
      {
        q: "What is Tax ProMax?",
        a: "Tax ProMax is our annual tax-management service — ₦150,000/year. We file all your monthly, quarterly, and annual returns on time, liaise with FIRS on your behalf, and make sure you never miss a deadline. Included in the Pro and Enterprise packages.",
      },
      {
        q: "How long does CAC registration take?",
        a: "Business Name: 5 – 7 working days. Limited Company: 10 – 14 working days. Name reservation is usually 48 hours. We submit digitally the same day you pay and the name is approved.",
      },
    ],
  },
  {
    id: "timelines",
    title: "Timelines & Delivery",
    summary: "How long things take",
    icon: Clock,
    accent: "#B48C4C",
    items: [
      {
        q: "How long does a Scalar website take?",
        a: "Presence package: 7 – 10 working days. Growth: 2 – 3 weeks. Automate: 4 – 6 weeks (because of CRM + automations). Platform: 6 – 10 weeks depending on complexity. We agree the exact schedule at proposal stage.",
      },
      {
        q: "How fast can Medialy go live?",
        a: "Setup completes in 5 working days (profile tuning + content plan). Content goes live from week 2. First measurable growth appears by week 6 with consistent posting.",
      },
      {
        q: "Can you rush it?",
        a: "Sometimes, yes — priority delivery available on most services for a 30% rush fee. Ask the CSO team when you brief the project; we'll tell you honestly whether the rush is possible before you pay extra.",
      },
      {
        q: "What if you're late?",
        a: "If we miss a committed delivery date, the Coordinator notifies you before the date, not after. We propose a new timeline and usually add a small bonus (extra pages, extra posts, extra training hour) to keep the trust. We don't go dark.",
      },
      {
        q: "What happens after delivery?",
        a: "Scalar: 30 days of free tweaks after go-live, then paid support packages. Bizdoc: ongoing Compliance Management subscription (₦50,000/mo) keeps you covered. Medialy: service is monthly — you can pause any month with 30 days notice. HUB: lifetime access to course materials.",
      },
    ],
  },
  {
    id: "team",
    title: "Who We Are",
    summary: "Team, location, and the founder",
    icon: Users,
    accent: "#8B4513",
    items: [
      {
        q: "Where is HAMZURY based?",
        a: "Kano, Nigeria. We serve clients across Nigeria, West Africa, and diaspora markets. The core team is 18 people across the four divisions.",
      },
      {
        q: "Who founded HAMZURY?",
        a: "Muhammad Hamzury — founder and primary architect of the firm's operations. He leads product decisions, Founder Roadmap content, and final approvals on custom work. You don't normally deal with him directly; the Closer handles your project and escalates only if needed.",
      },
      {
        q: "Who will I actually work with?",
        a: "Lead Handler (first contact, adds you to tracking) → Closer (your assigned advisor, owns your project end-to-end) → Division lead (Abdullahi for Bizdoc, Dajot for Scalar, Hikma for Medialy, Idris for HUB). Every handoff is logged so nothing drops.",
      },
      {
        q: "How secure is my information?",
        a: "We keep client files in a locked cloud workspace. We never share invoices, contracts, or business documents with third parties without written approval. Staff sign an NDA before joining. Internal chats referring to your project use only your HMZ reference code — never public names.",
      },
      {
        q: "Do you have case studies?",
        a: "Yes — examples include Tilz Spa, Tel Tel Drugstores, Jeff Optimum, and others. Ask the CSO team on WhatsApp for the specific case study that matches your industry and we'll send the PDF.",
      },
    ],
  },
];

/* ── Contact template helpers ──────────────────────────────────────────── */
/**
 * Build a WhatsApp link that pre-fills a message to the CSO Lead Handler.
 * The Lead Handler reads it and enters Stage 1 of the CSO flow
 * (add to tracking sheet within 30 min).
 */
function whatsappLink(message: string): string {
  return `https://wa.me/${CSO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/** Default greeting used when user taps the WhatsApp bubble cold (no FAQ context) */
const WA_COLD_OPEN = "Hello HAMZURY — I'd like to talk. Please help.";

/** Template used after a user reads an FAQ answer and still wants a human */
function waAfterFaq(category: string, question: string): string {
  return (
    `Hello HAMZURY — I just read your FAQ about "${question}" (${category}). ` +
    `I'd like to talk to a human about this.`
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Inner FAQ panel
   ══════════════════════════════════════════════════════════════════════════ */
function FAQPanel({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const brand = DEPT_BRAND[department];

  const currentCat = useMemo(
    () => FAQ_CATEGORIES.find((c) => c.id === categoryId) || null,
    [categoryId]
  );

  // Search across all categories when user types
  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const hits: { category: FAQCategory; item: FAQ }[] = [];
    for (const cat of FAQ_CATEGORIES) {
      for (const it of cat.items) {
        if (it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)) {
          hits.push({ category: cat, item: it });
        }
      }
    }
    return hits.slice(0, 8);
  }, [search]);

  return (
    <div
      className="fixed z-[70] flex flex-col"
      style={{
        bottom: 16, right: 16,
        width: "min(380px, calc(100vw - 32px))",
        height: "min(640px, calc(100vh - 32px))",
        backgroundColor: CREAM,
        borderRadius: 18,
        boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
        overflow: "hidden",
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: brand.header,
          color: brand.accent,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {(categoryId || search) && (
            <button
              onClick={() => {
                if (search) setSearch("");
                else { setCategoryId(null); setOpenQ(null); }
              }}
              aria-label="Back"
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.12)", color: brand.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              {brand.name} · Help Centre
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {search ? `Results for "${search}"` : currentCat ? currentCat.title : "How can we help?"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
            backgroundColor: "rgba(255,255,255,0.12)", color: brand.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search bar */}
      <div style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            backgroundColor: "#fff",
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 10, padding: "8px 12px",
          }}
        >
          <Search size={14} color={MUTED} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCategoryId(null); setOpenQ(null); }}
            placeholder="Search the FAQ…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 13, background: "transparent", color: DARK,
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        {/* Search results take priority */}
        {search ? (
          searchHits.length === 0 ? (
            <EmptySearch query={search} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {searchHits.map((h, i) => (
                <AnswerCard
                  key={`${h.category.id}-${i}`}
                  category={h.category}
                  item={h.item}
                />
              ))}
            </div>
          )
        ) : currentCat ? (
          /* ── Category detail: questions list ─────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>
              {currentCat.summary}
            </p>
            {currentCat.items.map((it, i) => {
              const isOpen = openQ === i;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#fff",
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenQ(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 14px",
                      border: "none", cursor: "pointer", textAlign: "left",
                      backgroundColor: "transparent",
                      color: DARK, fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <span>{it.q}</span>
                    <ChevronRight
                      size={15}
                      color={MUTED}
                      style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 14px 14px" }}>
                      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: "0 0 12px" }}>
                        {it.a}
                      </p>
                      <DeflectRow category={currentCat.title} question={it.q} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Top-level: category grid ──────────────────────────── */
          <CategoryGrid onPick={(id) => { setCategoryId(id); setOpenQ(null); }} />
        )}
      </div>

      {/* Footer: always-available human escape hatch */}
      <div
        style={{
          borderTop: `1px solid ${HAIRLINE}`,
          padding: "10px 14px",
          backgroundColor: "#fff",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: MUTED, flex: 1 }}>
          Need a human? Our CSO team replies on WhatsApp within 2 hours.
        </span>
        <a
          href={whatsappLink(WA_COLD_OPEN)}
          target="_blank" rel="noreferrer"
          style={{
            fontSize: 11, fontWeight: 600,
            padding: "6px 12px", borderRadius: 999,
            color: "#fff", backgroundColor: "#25D366",
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}

function CategoryGrid({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {FAQ_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onPick(cat.id)}
            style={{
              backgroundColor: "#fff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 12,
              padding: "14px 12px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <span
              style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: `${cat.accent}18`, color: cat.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon size={16} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.2 }}>
                {cat.title}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.3 }}>
                {cat.summary}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AnswerCard({ category, item }: { category: FAQCategory; item: FAQ }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 10, color: category.accent, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>
        {category.title}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>
        {item.q}
      </div>
      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: "0 0 10px" }}>
        {item.a}
      </p>
      <DeflectRow category={category.title} question={item.q} />
    </div>
  );
}

function DeflectRow({ category, question }: { category: string; question: string }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <a
        href={whatsappLink(waAfterFaq(category, question))}
        target="_blank" rel="noreferrer"
        style={{
          fontSize: 11, fontWeight: 600,
          padding: "6px 12px", borderRadius: 999,
          color: "#fff", backgroundColor: "#25D366",
          textDecoration: "none",
        }}
      >
        Still need help? WhatsApp us
      </a>
      <a
        href={`tel:+${CSO_PHONE}`}
        style={{
          fontSize: 11, fontWeight: 600,
          padding: "6px 12px", borderRadius: 999,
          color: DARK, backgroundColor: "#F3F4F6",
          textDecoration: "none",
        }}
      >
        Call
      </a>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div
      style={{
        padding: "24px 16px",
        backgroundColor: "#fff",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 4 }}>
        No FAQ match for "{query}"
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
        Your question is better answered by a human. Tap below — our CSO Lead
        Handler replies within 2 hours.
      </p>
      <a
        href={whatsappLink(`Hello HAMZURY — I have a question about: ${query}`)}
        target="_blank" rel="noreferrer"
        style={{
          display: "inline-block",
          fontSize: 12, fontWeight: 600,
          padding: "8px 16px", borderRadius: 999,
          color: "#fff", backgroundColor: "#25D366",
          textDecoration: "none",
        }}
      >
        Ask on WhatsApp
      </a>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — floating contact stack
   ══════════════════════════════════════════════════════════════════════════ */
export default function ChatWidget({
  department = "general",
  open: externalOpen,
  onClose,
  isDashboard: _isDashboard,
}: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? externalOpen : internalOpen;

  const close = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  /* ── Bubble notifications (teaser messages above bubble) ─────────────── */
  const [bubbleNotes, setBubbleNotes] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen || isControlled) return;
    const NOTES = [
      "Hi! 👋 Questions? Tap for our FAQ.",
      department === "bizdoc"
        ? "Ask about compliance & tax"
        : department === "systemise"
        ? "Ask about websites & systems"
        : department === "skills"
        ? "Ask about our programs"
        : "We're here to help",
    ];
    const t1 = setTimeout(() => setBubbleNotes([NOTES[0]]), 1800);
    const t2 = setTimeout(() => setBubbleNotes([NOTES[0], NOTES[1]]), 3200);
    const t3 = setTimeout(() => setBubbleNotes([]), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen, isControlled, department]);

  /* ── Contact menu + rating ───────────────────────────────────────────── */
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showBadge, setShowBadge] = useState(true);

  const brand = DEPT_BRAND[department];

  return (
    <>
      {isOpen && <FAQPanel department={department} onClose={close} />}

      {/* Teaser notifications */}
      {!isControlled && !isOpen && bubbleNotes.length > 0 && (
        <div className="fixed bottom-[88px] right-4 z-[60] flex flex-col items-end gap-1.5">
          {bubbleNotes.map((note, i) => (
            <div
              key={i}
              onClick={() => { setBubbleNotes([]); setShowBadge(false); setContactMenuOpen(true); }}
              className="px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg text-[13px] font-medium max-w-[220px] cursor-pointer"
              style={{ backgroundColor: brand.header, color: "#fff" }}
            >
              {note}
            </div>
          ))}
        </div>
      )}

      {/* Floating contact stack — only when widget is uncontrolled */}
      {!isControlled && (
        <>
          {/* Expanded 3-option menu */}
          {contactMenuOpen && !isOpen && (
            <div className="fixed bottom-[84px] right-4 z-[60] flex flex-col items-end gap-2.5">
              {/* WhatsApp — hands over to CSO Lead Handler (Stage 1) */}
              <a
                href={whatsappLink(WA_COLD_OPEN)}
                target="_blank" rel="noreferrer"
                onClick={() => setContactMenuOpen(false)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#25D366", color: "#FFFFFF" }}
                title="WhatsApp us"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.03 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.11 1.58 5.9L0 24l6.44-1.69a11.8 11.8 0 0 0 5.59 1.42h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.13-3.35-8.43Zm-8.49 18.2h-.01a9.76 9.76 0 0 1-4.97-1.36l-.36-.21-3.82 1 1.02-3.72-.23-.38a9.77 9.77 0 0 1-1.5-5.19c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.02 6.93 2.87a9.75 9.75 0 0 1 2.87 6.94c0 5.4-4.4 9.85-9.74 9.85Zm5.38-7.36c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.67.15-.2.29-.77.96-.95 1.16-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.35-1.45a8.8 8.8 0 0 1-1.63-2.02c-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.14-.17.19-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.72.23 1.37.2 1.89.12.58-.09 1.77-.73 2.02-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.56-.35Z"/>
                  </svg>
                </span>
                <span className="text-[12px] font-medium">WhatsApp</span>
              </a>
              {/* Call */}
              <a
                href={`tel:+${CSO_PHONE}`}
                onClick={() => setContactMenuOpen(false)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#1F2937", color: "#FFFFFF" }}
                title="Call us"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <Phone size={13} strokeWidth={2.2} />
                </span>
                <span className="text-[12px] font-medium">Call</span>
              </a>
              {/* Chat = FAQ */}
              <button
                data-chat-trigger
                onClick={() => {
                  setContactMenuOpen(false);
                  setBubbleNotes([]);
                  setInternalOpen(true);
                  setShowBadge(false);
                }}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: brand.header, color: brand.accent }}
                title="Browse FAQ"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <MessageSquare size={13} strokeWidth={2.2} />
                </span>
                <span className="text-[12px] font-medium">FAQ</span>
              </button>
            </div>
          )}

          {/* Bottom row: Rate + main bubble */}
          <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
            <button
              onClick={() => setFeedbackOpen((v) => !v)}
              className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border"
              style={{ backgroundColor: "white", borderColor: "rgba(45,45,45,0.1)", color: GOLD }}
              title="Rate us"
            >
              <Star size={18} />
            </button>
            <button
              data-chat-trigger
              onClick={() => {
                if (isOpen) { close(); return; }
                // 2026-04 founder decision: always show the 3-option menu
                // (WhatsApp / Call / FAQ). Never open FAQ directly — keeps
                // behaviour consistent regardless of teaser-bubble state.
                setBubbleNotes([]);
                setShowBadge(false);
                setContactMenuOpen((v) => !v);
              }}
              className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
              style={{ backgroundColor: brand.header, color: brand.accent }}
              aria-label={isOpen ? "Close chat" : contactMenuOpen ? "Hide options" : "Contact us"}
            >
              {isOpen || contactMenuOpen ? <X size={22} /> : <MessageSquare size={22} />}
              {!isOpen && !contactMenuOpen && showBadge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
              )}
            </button>
          </div>
        </>
      )}

      {/* Feedback popup */}
      {feedbackOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#1A1A1A]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: CHARCOAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? GOLD : "none"} stroke={n <= feedbackRating ? GOLD : "#D1D5DB"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none h-20 mb-3"
            style={{ borderColor: "rgba(45,45,45,0.1)", backgroundColor: "#FAFAFA" }}
          />
          <button
            onClick={() => {
              if (feedbackRating) {
                toast.success(`Thank you for your ${feedbackRating}-star feedback`);
                setFeedbackOpen(false); setFeedbackRating(0); setFeedbackMsg("");
              }
            }}
            disabled={feedbackRating === 0}
            className="w-full py-2.5 rounded-full text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: CHARCOAL }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}
