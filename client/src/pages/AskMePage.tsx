import { useState } from "react";
import { Link } from "wouter";
import PageMeta from "../components/PageMeta";
import { ChevronDown, ChevronUp, MessageCircle, Phone } from "lucide-react";

const TEAL = "#0A1F1C";
const GOLD = "#C9A97E";
const MILK = "#FBF8EE";
const WHITE = "#FFFFFF";
const TEXT = "#2C2C2C";

// ─── FAQ data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How long does CAC registration take?",
    a: "Standard CAC registration takes 7–14 business days. Complex cases (e.g., companies with multiple directors or foreign shareholders) may take up to 21 days.",
  },
  {
    q: "What is the 70% deposit policy?",
    a: "We require 70% of the total service fee upfront to begin work. The remaining 30% is due upon delivery or completion of the engagement.",
  },
  {
    q: "Can I get a refund if I'm not satisfied?",
    a: "Refunds are only available before work commences. Once we begin your project, we commit fully to delivering the best outcome. We do offer a free revision cycle to address concerns.",
  },
  {
    q: "How do I track my project?",
    a: "Use the 'My Update' section on the homepage. Enter your reference number (e.g. BZ-2026-0041) and the phone number you registered with. Your reference number is sent to you once your file is activated — if you haven't received it, contact your CSO on WhatsApp.",
  },
  {
    q: "What documents do I need for CAC registration?",
    a: "You will need: a passport photograph, a valid government-issued ID (NIN slip, international passport, or driver's license), your proposed business name(s), and a registered business address.",
  },
  {
    q: "Do you work with startups?",
    a: "Yes! We specialize in helping early-stage Nigerian businesses get properly set up — from name reservation to full incorporation and post-registration compliance.",
  },
  {
    q: "How do commissions work?",
    a: "Affiliates earn 5–13% commission based on their referral tier. Payment is made 30 days after client payment confirmation. Minimum withdrawal is ₦20,000.",
  },
  {
    q: "What is the RIDI program?",
    a: "RIDI (Rural Innovation Development Initiative) is our community empowerment program under Hamzury Skills. It provides free, practical skills training to underserved communities across Nigeria — currently active in 28 communities. Every participant receives the same certification as paid students.",
  },
  {
    q: "How do I contact the CSO?",
    a: "Use the live chat widget on any of our service pages or email our Client Services Office directly at cso@hamzury.com.",
  },
  {
    q: "What is Systemise?",
    a: "Systemise is our business automation and systems design department. We help companies build efficient workflows, automate repetitive processes, and scale with structured operational systems — from brand identity and websites to CRM and full business operating systems.",
  },
  {
    q: "What is Hamzury Skills?",
    a: "Hamzury Skills is our training and capacity-building department, offering cohort-based programs in digital marketing, data analysis, and business development for Nigerian professionals.",
  },
  {
    q: "Can foreign nationals register a business in Nigeria?",
    a: "Yes, foreign nationals can register a business in Nigeria, though additional documentation and compliance steps are required. Contact our BizDoc Consult team for a personalized checklist.",
  },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: isOpen ? `1.5px solid ${GOLD}` : "1.5px solid #E8E3DC",
        marginBottom: "0.75rem",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ background: isOpen ? `${TEAL}08` : WHITE }}
      >
        <span
          className="text-sm font-semibold pr-4 leading-snug"
          style={{ color: TEAL }}
        >
          {question}
        </span>
        <span className="flex-shrink-0" style={{ color: GOLD }}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <div
          className="px-6 pb-5"
          style={{ background: WHITE, borderTop: "1px solid #F0EBE3" }}
        >
          <p className="text-sm leading-relaxed pt-3" style={{ color: "#555" }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AskMePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <div style={{ background: WHITE, minHeight: "100vh", color: TEXT }}>
      <PageMeta
        title="Ask Me Anything — HAMZURY Innovation Hub"
        description="FAQs, refund policy, deposit requirements, and everything you need to know about HAMZURY's services."
      />

      {/* ────────────────────────────── HEADER ───────────────────────────────────── */}
      <header style={{ background: TEAL }} className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,169,126,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,126,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <Link href="/">
            <span
              className="text-xs font-bold tracking-[0.3em] cursor-pointer inline-block mb-6"
              style={{ color: GOLD, textTransform: "uppercase" }}
            >
              Hamzury Innovation Hub
            </span>
          </Link>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#FFFFFF" }}
          >
            Ask Me{" "}
            <span style={{ color: GOLD }}>Anything</span>
          </h1>
          <p
            className="text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Your questions about our services, policies, and how we work —
            answered.
          </p>
        </div>
      </header>

      {/* ────────────────────────────── REFUND & DEPOSIT POLICY ─────────────────── */}
      <section style={{ background: MILK }} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: TEAL }}
          >
            Refund &amp; Deposit Policy
          </h2>

          {/* Deposit card */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: WHITE,
              borderLeft: `4px solid ${GOLD}`,
              border: `1px solid #EDE8DF`,
              borderLeftWidth: "4px",
              borderLeftColor: GOLD,
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest mb-3"
              style={{ color: GOLD, textTransform: "uppercase" }}
            >
              Deposit Requirement
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
              All services require a minimum{" "}
              <strong>70% upfront deposit</strong> before work begins. The
              remaining <strong>30%</strong> is due upon completion or delivery
              of the engagement.
            </p>
          </div>

          {/* Refund card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: WHITE,
              border: `1px solid #EDE8DF`,
              borderLeftWidth: "4px",
              borderLeftColor: TEAL,
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest mb-4"
              style={{ color: TEAL, textTransform: "uppercase" }}
            >
              Refund Policy
            </h3>
            <ul className="space-y-3">
              {[
                "Refund requests must be submitted within 7 days of deposit payment",
                "Refunds are only applicable if work has not commenced",
                "Once work has begun, no refund is issued — a credit note may be offered",
                "Processing fees (banking charges) are non-refundable",
                "Disputes are resolved by the Founder's Office",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ background: GOLD }}
                  />
                  <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── FAQ ACCORDION ────────────────────────────── */}
      <section style={{ background: WHITE }} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ color: TEAL }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              {FAQS.length} questions answered — tap to expand
            </p>
          </div>

          <div>
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── STILL HAVE QUESTIONS ────────────────────── */}
      <section style={{ background: TEAL }} className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: WHITE }}
          >
            Still Have Questions?
          </h2>
          <p
            className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Our team is available to help. Reach out via live chat or give us a
            call during business hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
                style={{ background: GOLD, color: TEAL }}
              >
                <MessageCircle size={17} />
                Chat with Us
              </button>
            </Link>

            <a
              href="https://wa.me/2349130700056"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition"
              style={{
                background: "transparent",
                border: `1.5px solid rgba(201,169,126,0.4)`,
                color: GOLD,
              }}
            >
              <Phone size={17} />
              Book a Call
            </a>
          </div>
          <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            To speak with us directly, book a call via chat and we'll confirm an available time slot.
            BizDoc enquiries: 08067149356 · Skills &amp; Systemise: 09130700056
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          background: TEAL,
          borderTop: "1px solid rgba(201,169,126,0.15)",
        }}
        className="py-8 text-center"
      >
        <Link href="/">
          <span
            className="text-sm font-bold tracking-widest cursor-pointer"
            style={{ color: GOLD, letterSpacing: "0.2em" }}
          >
            HAMZURY
          </span>
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          &copy; {new Date().getFullYear()} HAMZURY Innovation Hub. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
