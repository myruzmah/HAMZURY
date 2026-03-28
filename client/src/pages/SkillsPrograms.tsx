import { useState, useEffect, useRef, useCallback } from "react";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ChevronDown, ChevronRight,
  Users, GraduationCap, Star, Target,
  Lightbulb, BookOpen, Send, X, CheckCircle, RotateCcw, Loader2, Menu,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS — PROGRAMS PAGE  /skills/programs
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1B2A4A";   // Dark navy blue — Skills primary
const GOLD  = "#C9A97E";   // Gold accent (5% usage)
const TEXT  = "#1D1D1F";
const BG    = "#FAFAF8";   // Milk white background
const CREAM = "#F5F3EF";   // Soft cream for cards
const W     = "#FFFFFF";

// ── WHAT YOU GET — accordion cards ───────────────────────────────────────────
const SKILL_CARDS = [
  {
    icon: Users, badge: "DIGITAL MARKETING",
    pain: "I'm spending money on ads — but getting little to no results",
    program: "Digital Marketing", price: "₦45,000", duration: "8 Weeks · Virtual & Physical",
    description: "Most business owners waste ad spend because there's no strategy behind it. This program teaches you how to build an audience, create content that converts, and run profitable campaigns — starting from zero.",
    outcomes: [
      "Social media strategy built for your business and audience",
      "SEO fundamentals — be found on Google without paying for ads",
      "Content creation system (batch, schedule, repeat)",
      "Paid advertising — Meta, Google, and TikTok basics",
      "Live campaigns running before you finish the program",
    ],
  },
  {
    icon: Target, badge: "BUSINESS DEVELOPMENT",
    pain: "I have a great product but I can't grow my client base",
    program: "Business Development", price: "₦35,000", duration: "6 Weeks · Virtual & Physical",
    description: "Most founders plateau because they have no structured sales system — they rely on referrals and hope. This program gives you a repeatable framework for finding, closing, and retaining clients.",
    outcomes: [
      "Market positioning — know exactly who you're selling to and why",
      "Sales pipeline system — from first contact to closed deal",
      "Client acquisition frameworks built for the Nigerian market",
      "Negotiation and objection handling techniques",
      "A 90-day business growth plan ready at graduation",
    ],
  },
  {
    icon: Star, badge: "DATA ANALYSIS",
    pain: "I make decisions by gut feeling — I don't understand my numbers",
    program: "Data Analysis", price: "₦55,000", duration: "10 Weeks · Virtual",
    description: "Businesses that track their numbers grow faster and waste less. This program takes you from raw data to clear, actionable dashboards — no prior experience needed.",
    outcomes: [
      "Excel mastery — formulas, pivot tables, data cleaning",
      "Power BI dashboard design and publishing",
      "Business intelligence — turning data into decisions",
      "Financial analysis and KPI tracking",
      "Real business datasets used throughout — not textbook exercises",
    ],
  },
  {
    icon: BookOpen, badge: "CONTENT CREATION",
    pain: "I want to build an online presence but I'm scared of the camera",
    program: "Faceless Content Intensive", price: "₦25,000", duration: "2 Weeks · Virtual",
    description: "You don't need to show your face to build authority online. This intensive teaches you to create professional, algorithm-friendly content using AI voiceover, scripting, and editing — all off-camera.",
    outcomes: [
      "Content pillars built around your niche and audience",
      "AI voiceover setup and integration",
      "Script writing framework for short-form and long-form",
      "Video editing workflow (mobile and desktop)",
      "30 days of ready-to-publish content created during the program",
    ],
  },
  {
    icon: Lightbulb, badge: "AI FOR BUSINESS",
    pain: "Everyone is using AI — I don't know where to start for my business",
    program: "AI-Powered Business Courses", price: "From ₦25,000", duration: "2–3 Days · Virtual",
    description: "AI is not replacing business owners — but owners who use AI will outpace those who don't. This short intensive gives you practical AI workflows you can implement in your business the same week.",
    outcomes: [
      "AI for lead generation — build prospect lists automatically",
      "AI for content creation — captions, emails, scripts in minutes",
      "AI for business automation — reduce repetitive admin to near zero",
      "ChatGPT / Claude workflows configured for your exact role",
      "Tool stack: free and paid AI tools mapped to your budget",
    ],
  },
  {
    icon: GraduationCap, badge: "INTERNSHIP",
    pain: "I graduated but can't find real work experience anywhere",
    program: "Internship Programme", price: "Free / Stipend-based", duration: "3 Months · Physical & Hybrid",
    description: "Paper qualifications alone no longer get jobs in Nigeria. This programme places you inside HAMZURY's active departments — working on real client projects, with real deadlines and real deliverables.",
    outcomes: [
      "Hands-on work in BizDoc, Systemize, or Skills department",
      "Real client projects you can show in your portfolio",
      "Professional reference letter from HAMZURY leadership",
      "Certificate of completion with specialisation track",
      "Career mentorship session at end of programme",
    ],
  },
];

// ── SKILLS DESK — Pure AI-driven conversational intake ────────────────────
const SD = "#2C1A00";
const SG = "#D4941A";
const SB = "#FFFEF8";

interface SkillsMsg { id: string; role: "bot" | "user"; text: string }
type SPhase = "chat" | "contact" | "payment";

function SkillsDesk({ open, onClose, preselectedProgram }: { open: boolean; onClose: () => void; preselectedProgram?: string }) {
  const skillsChat = trpc.skills.chat.useMutation();
  const [messages, setMessages]         = useState<SkillsMsg[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [phase, setPhase]               = useState<SPhase>("chat");
  const [showReadyBtn, setShowReadyBtn] = useState(false);
  const [contactName, setContactName]   = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentDone, setPaymentDone]   = useState(false);
  const [initialized, setInitialized]   = useState(false);
  const [mounted, setMounted]           = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uid = () => `${Date.now()}-${Math.random()}`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, phase, showReadyBtn]);

  useEffect(() => {
    if (open && !initialized) {
      const greeting = preselectedProgram
        ? `Hi 👋 I'm Zara, your Skills advisor. I can see you're looking at the ${preselectedProgram} program — what's your name?`
        : "Hi 👋 I'm Zara, your Skills advisor. Before anything — what's your name?";
      setMessages([{ id: uid(), role: "bot", text: greeting }]);
      setInitialized(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, initialized, preselectedProgram]);

  useEffect(() => {
    if (!open) {
      setInitialized(false); setMessages([]); setInput(""); setPhase("chat");
      setShowReadyBtn(false); setPaymentDone(false); setContactName(""); setContactPhone("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [open]);

  const addBot = useCallback((text: string) => {
    setMessages(p => [...p, { id: uid(), role: "bot", text }]);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput(""); setShowReadyBtn(false);
    setMessages(p => [...p, { id: uid(), role: "user", text }]);
    setLoading(true);
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" as const : "user" as const, text: m.text }));
    try {
      const res = await skillsChat.mutateAsync({ message: text, history });
      let reply = res.reply;
      const hasReady = reply.includes("[READY]");
      const hasPayment = reply.includes("[SHOW_PAYMENT]");
      reply = reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();
      setLoading(false);
      if (reply) addBot(reply);
      if (hasPayment) setPhase("payment");
      else if (hasReady) setShowReadyBtn(true);
    } catch {
      setLoading(false);
      addBot("I'm having a moment — please try again.");
    }
  }, [messages, loading, skillsChat, addBot]);

  const submitContact = useCallback(async () => {
    if (!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7) return;
    setPhase("chat"); setLoading(true);
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" as const : "user" as const, text: m.text }));
    try {
      const res = await skillsChat.mutateAsync({
        message: `[System: Contact collected — Name: ${contactName}, Phone: ${contactPhone}. Please confirm warmly and proceed to payment.]`,
        history,
      });
      let reply = res.reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();
      setLoading(false);
      if (reply) addBot(reply);
      setTimeout(() => setPhase("payment"), 400);
    } catch { setLoading(false); setPhase("payment"); }
  }, [contactName, contactPhone, messages, skillsChat, addBot]);

  const restart = useCallback(() => {
    setMessages([]); setPhase("chat"); setShowReadyBtn(false);
    setPaymentDone(false); setContactName(""); setContactPhone(""); setInitialized(false);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]"
      style={{ backgroundColor: "rgba(44,26,0,0.50)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className={`absolute top-0 right-0 h-full w-full md:w-[430px] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${mounted ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: SB }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ backgroundColor: SD }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: SG, color: SD }}>Z</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white">HAMZURY SKILLS</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>Zara · Skills Advisor</p>
            </div>
          </div>
          <button onClick={restart} className="p-1.5 text-white/40 hover:text-white/80 transition-colors" title="Restart"><RotateCcw size={15} /></button>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white/80 transition-colors"><X size={18} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === "user"
                  ? { backgroundColor: SD, color: SG, borderBottomRightRadius: 4 }
                  : { backgroundColor: W, color: "#2C2C2C", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ backgroundColor: W, borderBottomLeftRadius: 4 }}>
                {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: SD, opacity: 0.4, animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}

          {showReadyBtn && !loading && (
            <div className="flex justify-center pt-1">
              <button onClick={() => { setShowReadyBtn(false); setPhase("contact"); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                style={{ backgroundColor: SD, color: SG }}>
                Enrol Now →
              </button>
            </div>
          )}

          {phase === "contact" && (
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: W, borderColor: `${SD}20` }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: SD }}>A few quick details</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>To confirm your seat in the next cohort.</p>
              <input placeholder="Full name" value={contactName} onChange={e => setContactName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-2 outline-none border"
                style={{ borderColor: `${SD}25`, backgroundColor: SB, color: "#2C2C2C" }} />
              <input placeholder="WhatsApp number" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitContact()}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none border"
                style={{ borderColor: `${SD}25`, backgroundColor: SB, color: "#2C2C2C" }} />
              <button onClick={submitContact}
                disabled={!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7}
                className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                style={{ backgroundColor: SD, color: SG }}>
                Continue →
              </button>
            </div>
          )}

          {phase === "payment" && (
            <div className="rounded-2xl p-4 border-l-4" style={{ backgroundColor: W, borderLeftColor: SG }}>
              <p className="text-sm font-bold mb-0.5" style={{ color: SD }}>Make Payment</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>Transfer your program fee to secure your seat in the next cohort.</p>
              <div className="rounded-xl p-3 mb-3 space-y-1.5 text-[13px]" style={{ backgroundColor: SB }}>
                <div><span style={{ color: "#9CA3AF" }}>Bank</span> · <strong style={{ color: "#1A1A1A" }}>Moniepoint</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Account</span> · <strong className="tracking-widest text-[15px]" style={{ color: "#1A1A1A" }}>8067149356</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Name</span> · <strong style={{ color: "#1A1A1A" }}>HAMZURY SKILLS</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Reference</span> · <strong style={{ color: "#1A1A1A" }}>Your full name</strong></div>
              </div>
              {!paymentDone ? (
                <button onClick={() => setPaymentDone(true)}
                  className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: SD, color: SG }}>
                  I've Made the Payment →
                </button>
              ) : (
                <div className="rounded-xl p-3 text-xs space-y-2" style={{ backgroundColor: "#FFF9E6", border: `1px solid ${SG}40` }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: SG }} />
                    <strong style={{ color: SD }}>Confirming your payment…</strong>
                  </div>
                  <p style={{ color: "#374151" }}>We'll verify your transfer and confirm your seat within 2 hours during business hours (Mon–Sat, 8am–6pm).</p>
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        {phase === "chat" && (
          <div className="px-3 py-3 shrink-0 border-t" style={{ borderColor: `${SD}12`, backgroundColor: W }}>
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ backgroundColor: SB, border: `1.5px solid ${SD}18` }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Tell me about your goal…"
                className="flex-1 text-sm outline-none bg-transparent" style={{ color: "#2C2C2C" }} />
              <button onClick={() => send(input)} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ backgroundColor: SD }}>
                {loading ? <Loader2 size={14} style={{ color: SG }} className="animate-spin" /> : <Send size={13} style={{ color: SG }} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkillsPrograms() {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [skillsChatOpen, setSkillsChatOpen] = useState(false);
  const [chatProgram, setChatProgram] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function openChat(program?: string) {
    setChatProgram(program);
    setSkillsChatOpen(true);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <PageMeta
        title="Programs — HAMZURY Skills"
        description="Six programs. One real outcome each. Digital marketing, business development, data analysis, AI and more."
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 relative"
        style={{
          backgroundColor: `${W}F5`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${GOLD}18`,
          boxShadow: "0 1px 20px rgba(0,0,0,0.04)",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <a href="/skills" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: TEXT }}>
            ← Back to Skills
          </a>
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: TEXT }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-t"
            style={{ backgroundColor: W, borderColor: `${GOLD}20`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Systemise", href: "/systemise" },
                { label: "BizDoc Consult", href: "/bizdoc" },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                  style={{ color: TEXT }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>OUR PROGRAMS</p>
          <h1 className="text-[clamp(32px,5vw,52px)] leading-[1.05] font-normal tracking-tight mb-4" style={{ color: TEXT }}>
            Six programs.<br />One real outcome each.
          </h1>
          <p className="text-[16px] leading-relaxed font-light max-w-[480px]" style={{ color: `${TEXT}CC` }}>
            Every program is built for execution — not theory. Pick the gap you want to close.
          </p>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="pb-24 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-3">
            {SKILL_CARDS.map((card) => {
              const isOpen = openCard === card.program;
              const Icon = card.icon;
              return (
                <div key={card.program} className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ backgroundColor: isOpen ? DARK : W, border: `1.5px solid ${isOpen ? DARK : GOLD + "30"}`, boxShadow: isOpen ? `0 8px 32px ${DARK}18` : "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setOpenCard(isOpen ? null : card.program)} className="w-full text-left px-6 py-5 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" style={{ color: isOpen ? GOLD : TEXT }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: isOpen ? `${GOLD}25` : `${TEXT}12`, color: isOpen ? GOLD : `${TEXT}80` }}>
                          {card.badge}
                        </span>
                        <span className="text-[10px] font-semibold" style={{ color: isOpen ? `${GOLD}90` : `${TEXT}55` }}>{card.price}</span>
                      </div>
                      <p className="text-[15px] font-semibold leading-snug pr-4" style={{ color: isOpen ? W : TEXT }}>{card.pain}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: isOpen ? GOLD : `${TEXT}55` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "560px" : "0px" }}>
                    <div className="px-6 pb-6">
                      <div className="pl-9">
                        <p className="text-[13px] font-semibold mb-1" style={{ color: GOLD }}>{card.program} — {card.duration}</p>
                        <p className="text-[13px] leading-relaxed mb-4 opacity-70" style={{ color: W }}>{card.description}</p>
                        <ul className="space-y-1.5 mb-5">
                          {card.outcomes.map((o, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                              {o}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => openChat(card.program)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5"
                          style={{ backgroundColor: GOLD, color: W }}>
                          Ask Me <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 text-center" style={{ backgroundColor: CREAM }}>
        <p className="text-sm mb-3 opacity-60" style={{ color: TEXT }}>Ready to enroll or have questions?</p>
        <button onClick={() => openChat()}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: DARK, color: W }}>
          Talk to Zara <ArrowRight size={15} />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, color: `${BG}bb` }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-normal tracking-widest text-sm uppercase" style={{ color: BG }}>Hamzury Skills</span>
          <div className="flex items-center gap-6 text-xs flex-wrap justify-center sm:justify-end" style={{ color: `${BG}55` }}>
            <a href="/skills" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>← Skills Home</a>
            <a href="/skills/blueprint" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Course Blueprint</a>
            <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Privacy</a>
            <a href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Terms</a>
          </div>
        </div>
      </footer>

      {/* ── SKILLS DESK ── */}
      <SkillsDesk
        open={skillsChatOpen}
        onClose={() => { setSkillsChatOpen(false); setChatProgram(undefined); }}
        preselectedProgram={chatProgram}
      />
    </div>
  );
}
