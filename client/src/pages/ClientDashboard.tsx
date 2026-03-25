import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  LogOut, CheckCircle, Clock, AlertCircle,
  FileText, Download, Eye, MessageCircle,
  Send, Building2, User,
  Calendar, DollarSign, RefreshCw,
  ShieldCheck, Cpu, GraduationCap, Lock,
  LayoutDashboard, HelpCircle, ChevronRight,
  Upload, TrendingUp, Sparkles, BookOpen,
  Folder, Monitor, Globe, Users, Rocket,
  Lightbulb, Star, ArrowRight, Trophy,
  Zap, Activity, Heart, Target, Award,
} from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../components/PageMeta";

// ─── Colors ──────────────────────────────────────────────────────────────────
const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const WHITE = "#FFFFFF";
const DARK  = "#2C2C2C";

// ─── Business Level System ────────────────────────────────────────────────────
const BUSINESS_LEVELS = [
  { level: 1, name: "Seedling",      desc: "Your business is officially registered",         color: "#16A34A", bg: "#DCFCE7", icon: "🌱", requirement: "CAC registered" },
  { level: 2, name: "Rooted",        desc: "Fully compliant and tax-ready",                  color: "#0369A1", bg: "#DBEAFE", icon: "🌿", requirement: "TIN + Annual Returns" },
  { level: 3, name: "Visible",       desc: "Customers can find you online",                  color: "#7C3AED", bg: "#EDE9FE", icon: "🌳", requirement: "Website + Social Active" },
  { level: 4, name: "Systemised",    desc: "Operations run without you",                     color: "#B45309", bg: "#FEF3C7", icon: "⚙️", requirement: "CRM + Automation Active" },
  { level: 5, name: "Scale-Ready",   desc: "All 3 HAMZURY departments fully activated",      color: GOLD,      bg: "#FFF7ED", icon: "🚀", requirement: "All departments active" },
];

// ─── Daily Industry Insights (rotates by day of week) ────────────────────────
const FASHION_INSIGHTS: { icon: string; headline: string; detail: string; action?: string }[] = [
  {
    icon: "📦",
    headline: "African fashion exports to the UK grew 34% in 2025.",
    detail: "Diaspora demand for authentic African brands is at an all-time high. Brands with proper documentation (CAC, trademark) are eligible for export facilitation grants.",
    action: "Ask your CSO about export readiness",
  },
  {
    icon: "📝",
    headline: "Trademark-registered brands are 3× less likely to face brand theft.",
    detail: "In Abuja's fashion market, brand name disputes are increasing. Once your business is registered, trademark protection should be your next legal step.",
    action: "Talk to BizDoc about trademark filing",
  },
  {
    icon: "💳",
    headline: "Fashion businesses offering payment plans see 40% higher conversion.",
    detail: "Nigerian consumers want to buy but cash flow is a barrier. Instalment options (even informal ones) significantly increase average order values.",
  },
  {
    icon: "⚠️",
    headline: "Annual returns must be filed within 42 days of your anniversary date.",
    detail: "Missing this deadline attracts penalties from CAC. Your HAMZURY package includes annual returns filing — your CSO will remind you when it's due.",
    action: "Check your compliance calendar",
  },
  {
    icon: "📱",
    headline: "Businesses posting 5+ times weekly get 3× more customer inquiries.",
    detail: "Consistency beats perfection on social media. A content calendar + Canva templates (both in your Systemize package) make this achievable without a full-time designer.",
    action: "Activate Systemize for social media setup",
  },
  {
    icon: "👥",
    headline: "Most successful fashion brands hire a social media manager before Year 2.",
    detail: "Social media is a full-time job — not a side task for the founder. HAMZURY Skills can train your first hire or help you find a qualified candidate.",
    action: "Explore Skills training programmes",
  },
  {
    icon: "📊",
    headline: "Clients who activate Systemize within 6 months grow 60% faster.",
    detail: "Based on HAMZURY client data: businesses that combine BizDoc compliance with Systemize infrastructure in the first year reach break-even 3× faster than those who don't.",
    action: "View Systemize activation",
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const getMockClient = (phone: string) => ({
  name: "Adebayo Enterprises",
  owner: "Adebayo Okafor",
  ownerFirst: "Adebayo",
  phone,
  reference: `HAM-2026-${phone.slice(-5)}`,
  businessType: "SME Retail",
  industry: "Fashion & Apparel",
  stage: "Active",
  servicePackage: "BizDoc Pro",
  assignedCSO: "Aisha Musa",
  startDate: "Jan 15, 2026",
  startDateMs: new Date("2026-01-15").getTime(),
  progress: 65,
  currentPhase: "Document Review",
  nextAction: "Submit your NIN slip and signature specimen to complete CAC filing",
  businessLevel: 1,
  totalFee: 250000,
  paid: 150000,
  balance: 100000,
  nextPaymentDate: "Apr 1, 2026",
  renewalDays: 297,
  daysActive: 68,
  // Value stats
  documentsHandled: 3,
  complianceItems: 4,
  estimatedHoursSaved: 32,
  estimatedNairaSaved: 240000,
});

const INIT_MESSAGES = [
  { from: "cso",    text: "Welcome to HAMZURY! Your BizDoc Pro package is now active. We'll keep you updated here.", time: "Jan 15" },
  { from: "cso",    text: "Your Business Plan draft is ready for review. Please check the Documents section.", time: "Feb 1" },
  { from: "client", text: "Thank you! When will the CAC registration be completed?", time: "Feb 3" },
  { from: "cso",    text: "We've submitted your CAC documents. We're waiting on your NIN slip and signature specimen before we can proceed. Please send these at your earliest convenience.", time: "Feb 3" },
];

// ─── Session helpers ──────────────────────────────────────────────────────────
const SESSION_KEY = "hamzury-client-session";

interface ClientSession {
  phone: string;
  name: string;
  ref: string;
  businessName?: string;
  service?: string;
  status?: string;
  expiresAt: number;
}

function saveSession(phone: string, overrides?: Partial<ClientSession>) {
  const data = getMockClient(phone);
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    phone,
    name: overrides?.name ?? data.name,
    ref: overrides?.ref ?? data.reference,
    businessName: overrides?.businessName,
    service: overrides?.service,
    status: overrides?.status,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }));
}

function loadSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.expiresAt || Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed:   { bg: "#DCFCE7", color: "#15803D", label: "Completed" },
    in_progress: { bg: "#FEF3C7", color: "#B45309", label: "In Progress" },
    pending:     { bg: "#F3F4F6", color: "#6B7280", label: "Pending" },
    active:      { bg: "#DCFCE7", color: "#15803D", label: "Active" },
    delivered:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Delivered" },
    upcoming:    { bg: "#FEF3C7", color: "#B45309", label: "Upcoming" },
  };
  const s = map[status] ?? map.pending;
  return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
}

// ─── Login Card ───────────────────────────────────────────────────────────────
function LoginCard({ onLogin, loading, error: externalError }: { onLogin: (phone: string) => void; loading?: boolean; error?: string }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) { setError("Please enter a valid phone number (10–11 digits)."); return; }
    setError(""); onLogin(phone);
  }
  const displayError = error || externalError || "";
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: CREAM }}>
      <div className="w-full max-w-sm rounded-3xl p-8 border" style={{ backgroundColor: WHITE, borderColor: GOLD + "30", boxShadow: "0 4px 40px rgba(10,31,28,0.07)" }}>
        <div className="text-2xl font-semibold tracking-tight mb-2 text-center" style={{ color: TEAL, letterSpacing: "-0.03em" }}>HAMZURY</div>
        <p className="text-[11px] text-center mb-8" style={{ color: DARK, opacity: 0.35 }}>Innovation Hub — Client Portal</p>
        <h1 className="text-xl font-semibold tracking-tight text-center mb-1" style={{ color: TEAL }}>Welcome Back</h1>
        <p className="text-[13px] text-center mb-6" style={{ color: DARK, opacity: 0.5 }}>Enter your registered phone number to access your dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>Phone Number</label>
            <input type="tel" placeholder="08034620520" maxLength={11} value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all disabled:opacity-50"
              style={{ borderColor: displayError ? "#EF4444" : GOLD + "40", backgroundColor: CREAM, color: DARK }}
              onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
              onBlur={e => (e.currentTarget.style.borderColor = displayError ? "#EF4444" : GOLD + "40")} />
            {displayError && <p className="text-[11px] mt-1.5" style={{ color: "#EF4444" }}>{displayError}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: TEAL, color: WHITE }}>
            {loading ? "Accessing…" : "Access My Dashboard"}
          </button>
        </form>
        <p className="text-[11px] text-center mt-6 opacity-40" style={{ color: DARK }}>No password needed — your phone number is your key</p>
      </div>
    </div>
  );
}

// ─── Tab types + Nav ──────────────────────────────────────────────────────────
type Tab = "overview" | "roadmap" | "documents" | "services" | "payments" | "messages" | "support";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview",   label: "Overview",       icon: <LayoutDashboard size={17} /> },
  { id: "roadmap",    label: "Business Guide", icon: <BookOpen size={17} /> },
  { id: "documents",  label: "Documents",      icon: <FileText size={17} />, badge: 2 },
  { id: "services",   label: "My Services",    icon: <ShieldCheck size={17} /> },
  { id: "payments",   label: "Payments",       icon: <DollarSign size={17} /> },
  { id: "messages",   label: "Messages",       icon: <MessageCircle size={17} /> },
  { id: "support",    label: "Support",        icon: <HelpCircle size={17} /> },
];

// ─── Industry Roadmap Data ─────────────────────────────────────────────────────
type RoadmapStatus = "done" | "inprogress" | "todo";
interface RoadmapItem { name: string; why: string; status: RoadmapStatus; hamzury?: string; tag?: string; }
interface RoadmapPhase { id: string; icon: React.ReactNode; title: string; subtitle: string; color: string; items: RoadmapItem[]; }

const INDUSTRY_ROADMAPS: Record<string, RoadmapPhase[]> = {
  "Fashion & Apparel": [
    {
      id: "legal", icon: <ShieldCheck size={16} />, color: "#1B4D3E",
      title: "Phase 1 — Get Your Business Legal",
      subtitle: "Before you sell a single item, these protect you and make you official.",
      items: [
        { name: "CAC Business Registration",           why: "Makes your business officially recognized by law. Without this, you legally don't exist as a business.",                        status: "inprogress", hamzury: "BizDoc",  tag: "Legal" },
        { name: "Tax Identification Number (TIN)",     why: "Required to pay tax, open a corporate bank account, and bid for contracts.",                                                   status: "todo",       hamzury: "BizDoc",  tag: "Legal" },
        { name: "Trademark Your Brand Name & Logo",    why: "Stops anyone else from using your brand name. Once you're known, people will copy you.",                                       status: "todo",       hamzury: "BizDoc",  tag: "Legal" },
        { name: "SONCAP Certificate (if importing)",   why: "Required by Customs if you import fabrics or clothing. Without it, your goods can be seized at the port.",                     status: "todo",       hamzury: "BizDoc",  tag: "Compliance" },
        { name: "Corporate Bank Account",              why: "Separate your personal money from business money. Required for proper bookkeeping and invoicing.",                             status: "todo",       tag: "Banking" },
        { name: "Business Address Registration",       why: "Your official registered address used on all legal documents, CAC filings, and customer communications.",                      status: "done",       hamzury: "BizDoc",  tag: "Legal" },
      ],
    },
    {
      id: "ops", icon: <Monitor size={16} />, color: "#0A1F1C",
      title: "Phase 2 — Set Up Your Operations",
      subtitle: "The tools and systems that run your business automatically, even when you're asleep.",
      items: [
        { name: "Accounting Software (Wave or QuickBooks)", why: "Track every naira in and out. Know if you're making profit or losing money at a glance.",                                status: "todo", hamzury: "Systemize", tag: "AI Tool" },
        { name: "Inventory Management System",             why: "Know exactly what fabric, sizes, and products you have in stock. Prevent overselling and stock loss.",                    status: "todo", hamzury: "Systemize", tag: "Software" },
        { name: "CRM — Customer Database",                 why: "Remember every customer: their size, preferences, birthday, last purchase. Turn one-time buyers into loyal fans.",        status: "todo", hamzury: "Systemize", tag: "Software" },
        { name: "WhatsApp Business Account",               why: "Professional customer communication with catalogues, quick replies, and business hours. Separate from personal.",          status: "todo", tag: "Communication" },
        { name: "ChatGPT / AI Writing Assistant",          why: "Write product descriptions, Instagram captions, emails, and proposals in minutes instead of hours.",                       status: "todo", tag: "AI Tool" },
        { name: "Canva Pro (Design Tool)",                  why: "Create professional flyers, lookbooks, social posts, and marketing materials without hiring a designer.",                  status: "todo", tag: "AI Tool" },
        { name: "Order Management System",                 why: "Track every order from placement to delivery. Never lose an order or miss a delivery date again.",                         status: "todo", hamzury: "Systemize", tag: "Software" },
      ],
    },
    {
      id: "visibility", icon: <Globe size={16} />, color: "#7C3AED",
      title: "Phase 3 — Get Your Business Seen",
      subtitle: "If people can't find you, you don't exist to them. This phase makes you discoverable.",
      items: [
        { name: "Professional Business Website",           why: "Your 24/7 digital storefront. Customers decide to buy in under 5 seconds — your site makes or breaks the sale.",          status: "todo", hamzury: "Systemize", tag: "Digital" },
        { name: "Instagram Business Account",              why: "Fashion's #1 platform. 70% of customers discover new brands on Instagram. Post daily to stay in front of buyers.",         status: "todo", hamzury: "Systemize", tag: "Social" },
        { name: "Google My Business Profile",              why: "When someone searches 'fashion store near me' in Abuja, you show up. Free and essential for local discovery.",              status: "todo", hamzury: "Systemize", tag: "Digital" },
        { name: "Professional Brand Photography",          why: "First impressions happen in 3 seconds. Amateur photos = amateur brand. Quality photos justify premium prices.",            status: "todo", hamzury: "Systemize", tag: "Brand" },
        { name: "TikTok Business Account",                 why: "Fastest-growing platform for fashion. Behind-the-scenes content and styling videos go viral and bring free traffic.",      status: "todo", hamzury: "Systemize", tag: "Social" },
        { name: "Pinterest Business Account",              why: "Pinterest users spend 2× more than other social shoppers. Style boards bring organic traffic for months.",                 status: "todo", tag: "Social" },
        { name: "Business Email (yourname@yourbrand.com)", why: "Professional email builds trust instantly. Customers take gmail/yahoo addresses less seriously for large orders.",          status: "todo", hamzury: "Systemize", tag: "Digital" },
      ],
    },
    {
      id: "positioning", icon: <Star size={16} />, color: "#B45309",
      title: "Phase 4 — Stand Out From the Competition",
      subtitle: "In a crowded market, the business with the clearest identity wins.",
      items: [
        { name: "Define Your Target Customer",             why: "Who exactly buys from you? Age, income, lifestyle, problems. The clearer your target, the more your marketing converts.",  status: "done",  hamzury: "BizDoc",    tag: "Strategy" },
        { name: "Craft Your Brand Story",                  why: "Why does your brand exist? People don't buy products — they buy stories and identities. Your 'why' creates loyalty.",      status: "todo",  hamzury: "Systemize", tag: "Brand" },
        { name: "Design Your Brand Identity",              why: "Logo, colours, fonts, tone of voice. Consistency across everything makes you look established and trustworthy.",            status: "todo",  hamzury: "Systemize", tag: "Brand" },
        { name: "Set Your Pricing Strategy",               why: "Price based on value, not just cost. Cheap pricing attracts difficult customers and kills your profit margin.",             status: "todo",  hamzury: "BizDoc",    tag: "Strategy" },
        { name: "Own a Specific Niche",                    why: "Don't try to sell to everyone. Specialising (bridal, corporate, streetwear) makes you the expert people seek out.",        status: "todo",  tag: "Strategy" },
        { name: "Business Positioning Statement",          why: "A clear one-line description of what you do, who it's for, and why you're different. Used on your website and pitch.",     status: "todo",  hamzury: "BizDoc",    tag: "Strategy" },
      ],
    },
    {
      id: "team", icon: <Users size={16} />, color: "#0369A1",
      title: "Phase 5 — Build the Right Team",
      subtitle: "You can't do everything alone. The right people multiply your results.",
      items: [
        { name: "Brand & Creative Manager",                why: "Manages the look, feel, and consistency of your brand. Ensures every touchpoint looks professional and on-brand.",        status: "todo",  hamzury: "Skills", tag: "Staff Role" },
        { name: "Social Media Manager",                    why: "Posts daily, engages followers, responds to DMs. Social media is a full-time job — not a side task.",                       status: "todo",  hamzury: "Skills", tag: "Staff Role" },
        { name: "Sales & Customer Service Rep",            why: "Handles inquiries, follows up on orders, resolves complaints. Great customer service turns buyers into ambassadors.",       status: "todo",  hamzury: "Skills", tag: "Staff Role" },
        { name: "Production Lead / Head Tailor",           why: "Oversees garment quality, production timelines, and supplier relationships. The backbone of your product delivery.",       status: "todo",  tag: "Staff Role" },
        { name: "Bookkeeper / Finance Assistant",          why: "Handles invoices, tracks expenses, prepares reports for tax season. Keep this separate from operations to avoid fraud.",   status: "todo",  hamzury: "Skills", tag: "Staff Role" },
        { name: "Digital Skills Training for Team",        why: "Your team needs to know how to use your CRM, posting tools, and accounting software. Untrained staff create errors.",      status: "todo",  hamzury: "Skills", tag: "Training" },
      ],
    },
    {
      id: "growth", icon: <Rocket size={16} />, color: "#7C3AED",
      title: "Phase 6 — Grow and Scale",
      subtitle: "Once your foundation is solid, these are the moves that multiply your revenue.",
      items: [
        { name: "E-commerce Store (Sell Online 24/7)",     why: "Your physical store closes at 9pm. An online store sells while you sleep. Critical for reaching customers beyond Abuja.",  status: "todo",  hamzury: "Systemize", tag: "Growth" },
        { name: "Wholesale Strategy",                      why: "Sell in bulk to other retailers, boutiques, and resellers. One wholesale deal can equal 50 individual retail sales.",       status: "todo",  hamzury: "BizDoc",    tag: "Growth" },
        { name: "Affiliate & Referral Programme",          why: "Let your happy customers earn commissions by bringing you new clients. Word-of-mouth at scale.",                            status: "todo",  tag: "Growth" },
        { name: "Export Market Research",                  why: "African fashion is in global demand. Research UK, USA, and diaspora markets to take your brand international.",              status: "todo",  hamzury: "BizDoc",    tag: "Growth" },
        { name: "Business Automation (Save 20hrs/week)",   why: "Automate order confirmations, payment reminders, social posts, and follow-up emails. Grow without hiring more staff.",     status: "todo",  hamzury: "Systemize", tag: "AI Tool" },
        { name: "Annual Business Review & Rebrand",        why: "Every year, review what's working. Update your strategy, refresh your brand, set new revenue targets.",                    status: "todo",  hamzury: "BizDoc",    tag: "Strategy" },
      ],
    },
  ],
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [roadmapChecks, setRoadmapChecks] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState(INIT_MESSAGES.map(m => ({ ...m, id: Math.random() })));
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");

  // Real lookup query — fires when lookupPhone is set
  const lookupQuery = trpc.tracking.lookupByPhone.useQuery(
    { phone: lookupPhone },
    { enabled: lookupPhone.length >= 7, retry: false, refetchOnWindowFocus: false, staleTime: 0 }
  );

  // Watch lookup result and set session
  useEffect(() => {
    if (!lookupPhone || !loginLoading) return;
    if (lookupQuery.isLoading || lookupQuery.isFetching) return;
    const data = lookupQuery.data;
    if (data?.found) {
      const s: ClientSession = {
        phone: lookupPhone,
        name: data.clientName || getMockClient(lookupPhone).name,
        ref: data.ref,
        businessName: data.businessName ?? undefined,
        service: data.service ?? undefined,
        status: data.status ?? undefined,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      saveSession(lookupPhone, s);
      setSession(s);
      setLoginLoading(false);
      const saved = localStorage.getItem(`hamzury-roadmap-${lookupPhone}`);
      if (saved) setRoadmapChecks(JSON.parse(saved));
    } else if (data && !data.found) {
      setLoginError("No file found for this number. Contact your CSO on 08067149356 or 09130700056.");
      setLoginLoading(false);
      setLookupPhone("");
    } else if (lookupQuery.isError) {
      setLoginError("Could not connect. Please try again or contact your CSO.");
      setLoginLoading(false);
      setLookupPhone("");
    }
  }, [lookupQuery.data, lookupQuery.isLoading, lookupQuery.isFetching, lookupQuery.isError, lookupPhone, loginLoading]);

  useEffect(() => {
    const s = loadSession();
    if (s) {
      setSession(s);
      const saved = localStorage.getItem(`hamzury-roadmap-${s.phone}`);
      if (saved) setRoadmapChecks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleLogin = useCallback((phone: string) => {
    setLoginLoading(true);
    setLoginError("");
    setLookupPhone(phone);
  }, []);

  function handleSignOut() { localStorage.removeItem(SESSION_KEY); setSession(null); setLookupPhone(""); setLoginError(""); }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, { from: "client", text, time: "Now", id: Math.random() }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "cso", text: "Thanks for your message! A member of the Hamzury team will respond within 24 hours.", time: "Now", id: Math.random() }]);
    }, 1200);
  }

  function toggleRoadmapItem(itemName: string) {
    if (!session) return;
    const updated = { ...roadmapChecks, [itemName]: !roadmapChecks[itemName] };
    setRoadmapChecks(updated);
    localStorage.setItem(`hamzury-roadmap-${session.phone}`, JSON.stringify(updated));
    if (!roadmapChecks[itemName]) {
      toast.success(`✓ Milestone marked complete! Great progress — your CSO has been notified.`, { duration: 3500 });
    }
  }

  if (!session) return <LoginCard onLogin={handleLogin} loading={loginLoading} error={loginError} />;

  const client = getMockClient(session.phone);
  // Override with real data from session where available
  const displayName = session.name || client.name;
  const displayRef = session.ref || client.reference;
  const displayService = session.service || client.servicePackage;
  const displayStatus = session.status || client.stage;
  const levelData = BUSINESS_LEVELS[client.businessLevel - 1];
  const nextLevel = BUSINESS_LEVELS[client.businessLevel] ?? null;

  // Today's insight (rotates daily)
  const todayInsight = FASHION_INSIGHTS[new Date().getDay() % FASHION_INSIGHTS.length];

  // Roadmap computed
  const phases = INDUSTRY_ROADMAPS[client.industry] ?? INDUSTRY_ROADMAPS["Fashion & Apparel"];
  const allItems = phases.flatMap(p => p.items);
  const systemDone   = allItems.filter(i => i.status === "done").length;
  const userChecked  = allItems.filter(i => roadmapChecks[i.name]).length;
  const totalDone    = systemDone + userChecked;
  const roadmapPct   = Math.round((totalDone / allItems.length) * 100);

  // CAC docs
  const cacDocs = [
    { name: "Preferred Business Name", hint: "First, second & third choice", status: "done" },
    { name: "Nature of Business",      hint: "What the business does (brief description)", status: "done" },
    { name: "NIN Slip — All Directors",           hint: "National ID Number slip for each director", status: "pending" },
    { name: "Signature Specimen — All Directors", hint: "Clear handwritten signature on white paper", status: "pending" },
  ];
  const cacDone    = cacDocs.filter(d => d.status === "done").length;
  const cacPct     = Math.round((cacDone / cacDocs.length) * 100);
  const cacPending = cacDocs.filter(d => d.status === "pending").length;

  const deliverables = [
    { name: "Business Plan",           status: "completed",   date: "Feb 1, 2026",  est: null },
    { name: "CAC Registration",        status: "in_progress", date: null,           est: "Mar 30, 2026" },
    { name: "Tax ID (TIN)",            status: "pending",     date: null,           est: null },
    { name: "Corporate Account Setup", status: "pending",     date: null,           est: null },
  ];
  const completedCount = deliverables.filter(d => d.status === "completed").length;
  const delivPct       = Math.round((completedCount / deliverables.length) * 100);

  const issuedDocs = [
    { name: "Business Plan",    status: "delivered", issueDate: "Feb 1, 2026", renewDate: "N/A",          action: "download" },
    { name: "CAC Certificate",  status: "active",    issueDate: "—",           renewDate: "Jan 15, 2027", action: "view" },
    { name: "TIN Certificate",  status: "pending",   issueDate: "—",           renewDate: "—",            action: null },
    { name: "NHF Compliance",   status: "upcoming",  issueDate: "—",           renewDate: "Jun 2026",     action: null },
  ];

  const payments = [
    { date: "Jan 15, 2026", amount: 100000, status: "paid" },
    { date: "Feb 28, 2026", amount: 50000,  status: "paid" },
    { date: "Apr 1, 2026",  amount: 100000, status: "upcoming" },
  ];
  const paymentData = [{ name: "Paid", value: client.paid }, { name: "Balance", value: client.balance }];

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Tag colors
  const tagColors: Record<string, { bg: string; text: string }> = {
    "Legal":         { bg: "#DCFCE7", text: "#15803D" },
    "Compliance":    { bg: "#FEF3C7", text: "#B45309" },
    "Banking":       { bg: "#DBEAFE", text: "#1D4ED8" },
    "Software":      { bg: "#EDE9FE", text: "#6D28D9" },
    "AI Tool":       { bg: "#FDF4FF", text: "#9333EA" },
    "Communication": { bg: "#DCFCE7", text: "#15803D" },
    "Digital":       { bg: "#DBEAFE", text: "#1D4ED8" },
    "Social":        { bg: "#FCE7F3", text: "#BE185D" },
    "Brand":         { bg: "#FFF7ED", text: "#C2410C" },
    "Strategy":      { bg: "#FEF3C7", text: "#B45309" },
    "Staff Role":    { bg: "#F0FDF4", text: "#15803D" },
    "Training":      { bg: "#EDE9FE", text: "#6D28D9" },
    "Growth":        { bg: "#FDF4FF", text: "#9333EA" },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: "'Inter', sans-serif" }}>
      <PageMeta title="My Update — Hamzury Innovation Hub" description="Track your project status, documents, and payments." />

      {/* ─── Top bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between gap-3"
        style={{ backgroundColor: WHITE, borderBottom: `1px solid ${GOLD}20`, boxShadow: "0 1px 12px rgba(10,31,28,0.05)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: TEAL }}>← hamzury.com</a>
          <span className="hidden sm:block text-base font-semibold tracking-tight shrink-0" style={{ color: TEAL, letterSpacing: "-0.03em" }}>HAMZURY</span>
          <span className="hidden sm:block text-[11px] font-medium opacity-40 shrink-0" style={{ color: DARK }}>{client.reference}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: levelData.bg, color: levelData.color }}>
            {levelData.icon} Level {levelData.level} — {levelData.name}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#DCFCE720", color: "#15803D", border: "1px solid #86EFAC40" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            BizDoc Pro — Active
          </span>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: GOLD + "40", color: DARK }}>
            <LogOut size={12} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex pt-[52px] min-h-screen">

        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden md:flex flex-col fixed left-0 top-[52px] bottom-0 w-56 border-r z-30"
          style={{ backgroundColor: WHITE, borderColor: GOLD + "20" }}>

          {/* Business info + level */}
          <div className="px-5 py-5 border-b" style={{ borderColor: GOLD + "15" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 font-bold text-base" style={{ backgroundColor: TEAL, color: GOLD }}>
              {client.name[0]}
            </div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: TEAL }}>{client.name}</p>
            <p className="text-[11px] mt-0.5 mb-3" style={{ color: DARK, opacity: 0.4 }}>{client.servicePackage}</p>

            {/* Level badge */}
            <div className="rounded-xl p-3" style={{ backgroundColor: levelData.bg, border: `1px solid ${levelData.color}25` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: levelData.color }}>
                  {levelData.icon} Level {levelData.level}
                </span>
                {nextLevel && <span className="text-[9px]" style={{ color: levelData.color, opacity: 0.6 }}>→ {nextLevel.name}</span>}
              </div>
              <p className="text-[12px] font-semibold" style={{ color: levelData.color }}>{levelData.name}</p>
              {nextLevel && (
                <>
                  <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: levelData.color + "20" }}>
                    <div className="h-full rounded-full" style={{ width: "35%", backgroundColor: levelData.color }} />
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: levelData.color, opacity: 0.6 }}>Next: {nextLevel.requirement}</p>
                </>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
                style={{ backgroundColor: tab === item.id ? TEAL : "transparent", color: tab === item.id ? WHITE : DARK, opacity: tab === item.id ? 1 : 0.6 }}>
                <span style={{ color: tab === item.id ? GOLD : "inherit" }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && tab !== item.id && (
                  <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EA580C", color: WHITE }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* CSO */}
          <div className="px-5 py-4 border-t" style={{ borderColor: GOLD + "15" }}>
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: DARK, opacity: 0.35 }}>Your CSO</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: GOLD, color: TEAL }}>{client.assignedCSO[0]}</div>
              <span className="text-[12px] font-semibold" style={{ color: TEAL }}>{client.assignedCSO}</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 md:ml-56 min-h-screen pb-24 md:pb-8">

          {/* ══════════════════════════════════════════════════════════════
              OVERVIEW TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "overview" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">

              {/* ── Personalized Hero ── */}
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: TEAL }}>
                {/* decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ backgroundColor: GOLD, transform: "translate(30%, -30%)" }} />
                <div className="absolute bottom-0 right-16 w-20 h-20 rounded-full opacity-5" style={{ backgroundColor: GOLD, transform: "translateY(40%)" }} />

                <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {greeting}, <span style={{ color: GOLD }}>{client.ownerFirst}</span> 👋
                </p>
                <h2 className="text-white text-[18px] font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                  {client.name}
                </h2>
                <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {client.currentPhase} · Day {client.daysActive} of your business journey
                </p>

                {/* Progress bar */}
                <div className="mb-1">
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span>Overall Progress</span>
                    <span style={{ color: GOLD }}>{client.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${client.progress}%`, backgroundColor: GOLD }} />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <strong style={{ color: GOLD }}>Action needed: </strong>{client.nextAction}
                  </p>
                </div>
              </div>

              {/* ── HAMZURY Has Handled For You ── */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={15} style={{ color: GOLD }} />
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>HAMZURY Has Handled For You</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: `${client.documentsHandled}`,                              label: "Documents Filed",          sub: "on your behalf",        color: "#1B4D3E" },
                    { value: `${client.daysActive}`,                                    label: "Days Monitored",           sub: "of compliance coverage", color: TEAL },
                    { value: `~${client.estimatedHoursSaved}hrs`,                       label: "Hours Saved",              sub: "you didn't have to spend", color: "#7C3AED" },
                    { value: `₦${(client.estimatedNairaSaved/1000).toFixed(0)}k`,       label: "Estimated Value",          sub: "vs doing it alone",      color: "#B45309" },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-3.5 text-center" style={{ backgroundColor: stat.color + "07", border: `1px solid ${stat.color}18` }}>
                      <p className="text-[22px] font-black leading-none mb-1" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-[11px] font-semibold leading-tight" style={{ color: DARK }}>{stat.label}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: DARK, opacity: 0.4 }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Today's Business Insight ── */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: WHITE, border: `1px solid ${GOLD}22` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} style={{ color: GOLD }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Today's Business Insight</p>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: TEAL + "10", color: TEAL }}>{client.industry}</span>
                </div>
                <p className="text-[14px] font-bold mb-2 leading-snug" style={{ color: TEAL }}>
                  {todayInsight.icon} {todayInsight.headline}
                </p>
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: DARK, opacity: 0.55 }}>{todayInsight.detail}</p>
                {todayInsight.action && (
                  <button
                    className="flex items-center gap-1.5 text-[11px] font-bold transition-opacity hover:opacity-70"
                    style={{ color: GOLD }}
                    onClick={() => toast.info("Your CSO will be in touch. You can also send a message in the Messages tab.")}
                  >
                    {todayInsight.action} <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {/* ── Urgent action banner ── */}
              {cacPending > 0 && (
                <div className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
                  onClick={() => setTab("documents")}>
                  <Upload size={18} className="shrink-0 mt-0.5" style={{ color: "#EA580C" }} />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold" style={{ color: "#9A3412" }}>
                      {cacPending} document{cacPending > 1 ? "s" : ""} required before CAC filing can proceed
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: "#B45309" }}>
                      Send your NIN slip and signature specimen — your registration is on hold until we receive these.
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: "#EA580C" }} className="shrink-0 mt-0.5" />
                </div>
              )}

              {/* ── Quick stats row ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Docs Submitted",  value: `${cacDone}/${cacDocs.length}`, sub: "CAC filing",     icon: <FileText size={15} />,   urgent: cacPending > 0 },
                  { label: "Deliverables",    value: `${delivPct}%`,                 sub: "Complete",       icon: <Target size={15} />,     urgent: false },
                  { label: "Balance Due",     value: "₦100k",                        sub: "Due Apr 1",      icon: <DollarSign size={15} />, urgent: true },
                  { label: "Business Guide",  value: `${roadmapPct}%`,               sub: "Ready",          icon: <BookOpen size={15} />,   urgent: false },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-4 border cursor-pointer hover:shadow-sm transition-all"
                    style={{ backgroundColor: WHITE, borderColor: stat.urgent ? "#FED7AA" : GOLD + "20", borderLeft: stat.urgent ? "3px solid #EA580C" : undefined }}
                    onClick={() => {
                      if (stat.label === "Business Guide") setTab("roadmap");
                      if (stat.label === "Balance Due") setTab("payments");
                      if (stat.label === "Docs Submitted") setTab("documents");
                    }}>
                    <span style={{ color: stat.urgent ? "#EA580C" : GOLD }}>{stat.icon}</span>
                    <p className="text-[20px] font-bold leading-none mt-2 mb-0.5" style={{ color: TEAL }}>{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: DARK, opacity: 0.4 }}>{stat.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: DARK, opacity: 0.3 }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Monthly Activity Summary ── */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={15} style={{ color: GOLD }} />
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>This Month's Activity</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: TEAL + "10", color: TEAL }}>March 2026</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: "✅", text: "Business Plan completed and delivered to your email", date: "Mar 1" },
                    { icon: "📤", text: "CAC application submitted to Corporate Affairs Commission", date: "Mar 5" },
                    { icon: "⏳", text: "Awaiting NIN slip and signature specimen from you", date: "Mar 10" },
                    { icon: "🔔", text: "Next payment of ₦100,000 is due Apr 1", date: "Upcoming" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-[12px]">
                      <span className="text-base leading-none mt-0.5">{item.icon}</span>
                      <p className="flex-1" style={{ color: DARK, opacity: 0.65 }}>{item.text}</p>
                      <span className="text-[10px] shrink-0 font-medium" style={{ color: DARK, opacity: 0.3 }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Business Guide teaser ── */}
              <button onClick={() => setTab("roadmap")} className="w-full text-left rounded-2xl p-5 border transition-all hover:shadow-md"
                style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TEAL }}>
                      <BookOpen size={15} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>Your Business Bible</p>
                      <p className="text-[13px] font-bold" style={{ color: TEAL }}>{client.industry} Roadmap</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: TEAL }}>{roadmapPct}% Ready</span>
                </div>
                <div className="h-2 rounded-full mb-2" style={{ backgroundColor: TEAL + "10" }}>
                  <div className="h-full rounded-full" style={{ width: `${roadmapPct}%`, backgroundColor: GOLD }} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px]" style={{ color: DARK, opacity: 0.45 }}>
                    {totalDone}/{allItems.length} milestones complete across 6 phases
                  </p>
                  <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: GOLD }}>
                    Open guide <ChevronRight size={12} />
                  </span>
                </div>
              </button>

              {/* ── Recent messages ── */}
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: TEAL }}>
                  <p className="text-[13px] font-semibold text-white">Recent Messages</p>
                  <button onClick={() => setTab("messages")} className="text-[11px]" style={{ color: GOLD }}>View all →</button>
                </div>
                <div className="p-4 space-y-2">
                  {messages.slice(-2).map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-[12px]"
                        style={{ backgroundColor: msg.from === "cso" ? TEAL : CREAM, color: msg.from === "cso" ? "rgba(255,255,255,0.85)" : DARK }}>
                        <p>{msg.text}</p>
                        <p className="text-[10px] mt-0.5 opacity-40">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <button onClick={() => setTab("messages")} className="w-full py-2.5 rounded-xl text-[12px] font-semibold"
                    style={{ backgroundColor: TEAL + "08", color: TEAL }}>
                    Send a message →
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              BUSINESS GUIDE / ROADMAP TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "roadmap" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">

              {/* Hero */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: TEAL }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD }}>
                    <BookOpen size={18} style={{ color: TEAL }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Your Business Bible</p>
                    <h2 className="text-white text-lg font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
                      {client.industry} — Complete Success Roadmap
                    </h2>
                    <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Everything you need to build a successful {client.industry.toLowerCase()} business — from zero to fully operational. Tick each box as you complete it.
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="flex justify-between text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <span>Business Readiness Score</span>
                    <span className="font-bold" style={{ color: GOLD }}>{roadmapPct}% Ready</span>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${roadmapPct}%`, backgroundColor: GOLD }} />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {totalDone} of {allItems.length} milestones completed across all 6 phases
                  </p>
                </div>
              </div>

              {/* Phases */}
              {phases.map((phase) => {
                const phaseDone   = phase.items.filter(i => i.status === "done" || roadmapChecks[i.name]).length;
                const phaseTotal  = phase.items.length;
                const phasePct    = Math.round((phaseDone / phaseTotal) * 100);

                return (
                  <div key={phase.id} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: WHITE, borderColor: GOLD + "20" }}>
                    {/* Phase header */}
                    <div className="px-5 py-4 flex items-start gap-3" style={{ backgroundColor: phase.color + "08", borderBottom: `2px solid ${phase.color}22` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: phase.color, color: WHITE }}>
                        {phase.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-[14px] font-bold" style={{ color: phase.color }}>{phase.title}</h3>
                          <span className="text-[11px] font-bold shrink-0" style={{ color: phasePct === 100 ? "#16A34A" : phase.color }}>
                            {phaseDone}/{phaseTotal} done
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: DARK, opacity: 0.5 }}>{phase.subtitle}</p>
                        <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: phase.color + "15" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${phasePct}%`, backgroundColor: phase.color }} />
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y" style={{ borderColor: GOLD + "10" }}>
                      {phase.items.map((item) => {
                        const isChecked  = item.status === "done" || !!roadmapChecks[item.name];
                        const isInProg   = item.status === "inprogress" && !roadmapChecks[item.name];
                        const tc         = tagColors[item.tag ?? ""] ?? { bg: GOLD + "18", text: "#8B6914" };

                        return (
                          <div key={item.name}
                            className="px-4 py-3.5 flex items-start gap-3 transition-colors"
                            style={{ backgroundColor: isInProg ? phase.color + "04" : "transparent" }}>

                            {/* Checkbox */}
                            <button
                              onClick={() => item.status !== "inprogress" && toggleRoadmapItem(item.name)}
                              className="shrink-0 mt-0.5 transition-transform hover:scale-110"
                              disabled={item.status === "inprogress"}
                              title={item.status === "inprogress" ? "Handled by HAMZURY — in progress" : isChecked ? "Mark incomplete" : "Mark complete"}
                            >
                              {isChecked  && <CheckCircle size={18} style={{ color: "#16A34A" }} />}
                              {isInProg   && <Clock       size={18} style={{ color: "#B45309" }} />}
                              {!isChecked && !isInProg && (
                                <div className="w-[18px] h-[18px] rounded-full border-2 hover:border-current transition-colors" style={{ borderColor: "#D1D5DB" }} />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 flex-wrap">
                                <p className="text-[13px] font-semibold leading-snug"
                                  style={{ color: isChecked ? "#9CA3AF" : TEAL, textDecoration: isChecked ? "line-through" : "none" }}>
                                  {item.name}
                                </p>
                                {item.tag && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: tc.bg, color: tc.text }}>
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: DARK, opacity: 0.45 }}>{item.why}</p>
                              {item.hamzury && !isChecked && (
                                <button className="mt-1.5 flex items-center gap-1 text-[10px] font-bold transition-opacity hover:opacity-70"
                                  style={{ color: phase.color }}
                                  onClick={() => {
                                    if (item.hamzury === "BizDoc") toast.info("Your BizDoc package covers this. Your CSO will handle it as part of your active plan.");
                                    if (item.hamzury === "Systemize") { toast.info("This is covered by Systemize. Activate it to unlock this milestone."); setTab("services"); }
                                    if (item.hamzury === "Skills")    { toast.info("Hamzury Skills covers this. Activate it to unlock team training."); setTab("services"); }
                                  }}>
                                  {item.hamzury === "BizDoc"     && <><ShieldCheck    size={10} /> HAMZURY handles this for you</>}
                                  {item.hamzury === "Systemize"  && <><Cpu            size={10} /> Covered by Systemize — Activate →</>}
                                  {item.hamzury === "Skills"     && <><GraduationCap  size={10} /> Covered by Skills — Activate →</>}
                                </button>
                              )}
                            </div>

                            {/* Badge */}
                            <div className="shrink-0">
                              {isChecked  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>Done ✓</span>}
                              {isInProg   && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3C7", color: "#B45309" }}>In Progress</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Phase CTA */}
                    {phasePct < 100 && phaseDone === phase.items.filter(i => i.status === "done").length && (
                      <div className="px-5 py-3 border-t" style={{ borderColor: GOLD + "15", backgroundColor: phase.color + "04" }}>
                        <button className="flex items-center gap-2 text-[12px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: phase.color }}
                          onClick={() => toast.info("Your CSO will reach out to plan this phase. You can also send them a message directly.")}>
                          <Lightbulb size={13} />
                          Discuss this phase with your CSO
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom CTA */}
              <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: TEAL }}>
                <Award size={22} style={{ color: GOLD }} className="mx-auto mb-2" />
                <p className="text-white font-bold text-sm mb-1">Ready to accelerate?</p>
                <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  HAMZURY can handle the majority of this roadmap for you. Activate all 3 departments to unlock 80% of these milestones automatically.
                </p>
                <button onClick={() => setTab("services")} className="px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: GOLD, color: TEAL }}>
                  View My Services →
                </button>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              DOCUMENTS TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "documents" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Documents</p>
                <h2 className="text-xl font-bold" style={{ color: TEAL }}>Your Document Centre</h2>
                <p className="text-[12px] mt-1" style={{ color: DARK, opacity: 0.45 }}>Track what we need from you and what we've prepared for you.</p>
              </div>

              {/* CAC checklist */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: cacPending > 0 ? "#FED7AA" : GOLD + "25" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "#EA580C" }}>Action Required</p>
                    <h3 className="text-[15px] font-bold" style={{ color: TEAL }}>CAC Registration — Documents Needed</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: DARK, opacity: 0.45 }}>These are the only 4 documents required to register your business with CAC.</p>
                  </div>
                  {cacPending > 0 && (
                    <span className="shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                      {cacPending} Pending
                    </span>
                  )}
                </div>
                <div className="mb-5">
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: DARK, opacity: 0.45 }}>
                    <span>{cacDone} of {cacDocs.length} submitted</span><span>{cacPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ backgroundColor: TEAL + "10" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cacPct}%`, backgroundColor: cacPct === 100 ? "#16A34A" : GOLD }} />
                  </div>
                </div>
                <div className="space-y-2.5">
                  {cacDocs.map(doc => (
                    <div key={doc.name} className="rounded-xl p-4 border"
                      style={{ backgroundColor: doc.status === "pending" ? "#FFF7ED" : "#F0FDF4", borderColor: doc.status === "pending" ? "#FED7AA" : "#BBF7D0" }}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {doc.status === "done" ? <CheckCircle size={18} style={{ color: "#16A34A" }} /> : <AlertCircle size={18} style={{ color: "#EA580C" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold" style={{ color: doc.status === "done" ? "#15803D" : "#9A3412" }}>{doc.name}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: DARK, opacity: 0.5 }}>{doc.hint}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                          style={{ backgroundColor: doc.status === "done" ? "#DCFCE7" : "#FEE2E2", color: doc.status === "done" ? "#15803D" : "#B91C1C" }}>
                          {doc.status === "done" ? "✓ Received" : "Send Now"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {cacPending > 0 && (
                  <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: TEAL + "06", border: `1px solid ${TEAL}15` }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: TEAL }}>📲 How to Send</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: DARK, opacity: 0.6 }}>
                      Send via WhatsApp to <strong style={{ color: TEAL }}>+234 803 462 0520</strong> or reply in Messages. Quote your reference: <strong style={{ color: TEAL }}>{client.reference}</strong>. Confirmed within 24hrs.
                    </p>
                    <button className="mt-3 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: TEAL, color: WHITE }}
                      onClick={() => window.open(`https://wa.me/2348034620520?text=Hi%20HAMZURY%20Team%2C%20I%20am%20sending%20my%20CAC%20documents%20for%20reference%20${client.reference}`, "_blank")}>
                      Send via WhatsApp →
                    </button>
                  </div>
                )}
              </div>

              {/* Issued docs */}
              <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Certificates & Files</p>
                  <h3 className="text-[15px] font-bold" style={{ color: TEAL }}>Documents We've Prepared for You</h3>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "#FEF3C720", border: "1px solid #B4530930" }}>
                  <RefreshCw size={14} style={{ color: "#B45309" }} />
                  <p className="text-[12px]" style={{ color: "#B45309" }}>CAC Certificate renews in <strong>{client.renewalDays} days</strong> (Jan 15, 2027)</p>
                </div>
                <div className="space-y-2">
                  {issuedDocs.map(doc => (
                    <div key={doc.name} className="rounded-xl border p-3.5" style={{ borderColor: GOLD + "18", backgroundColor: CREAM }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{doc.name}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-[11px]" style={{ color: DARK, opacity: 0.45 }}>
                            {doc.issueDate !== "—" && <span>Issued: {doc.issueDate}</span>}
                            {doc.renewDate !== "—" && doc.renewDate !== "N/A" && <span>Renews: {doc.renewDate}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusChip status={doc.status} />
                          {doc.action === "view" && (
                            <button className="p-1.5 rounded-lg border transition-all hover:opacity-70" style={{ borderColor: TEAL + "30", color: TEAL }}
                              onClick={() => toast.info("Document viewer coming soon. Contact your CSO for a copy.")}><Eye size={13} /></button>
                          )}
                          {doc.action === "download" && (
                            <button className="p-1.5 rounded-lg border transition-all hover:opacity-70" style={{ borderColor: GOLD + "40", color: "#8B6914" }}
                              onClick={() => toast.success("Document sent to your email. Check your inbox.")}><Download size={13} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SERVICES TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "services" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Your Package</p>
                <h2 className="text-xl font-bold mb-0.5" style={{ color: TEAL }}>The Complete Business Suite</h2>
                <p className="text-[12px]" style={{ color: DARK, opacity: 0.4 }}>3 departments. One complete business infrastructure.</p>
              </div>

              {/* BizDoc — Active */}
              <div className="rounded-2xl p-5 border-2" style={{ borderColor: "#1B4D3E50", backgroundColor: "#1B4D3E07" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>● Active</span>
                    <h4 className="text-sm font-bold mt-1.5" style={{ color: "#1B4D3E" }}>BizDoc Consult</h4>
                    <p className="text-[11px]" style={{ color: DARK, opacity: 0.4 }}>Compliance · Licensing · Legal</p>
                  </div>
                  <ShieldCheck size={22} style={{ color: "#1B4D3E", opacity: 0.4 }} />
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1.5" style={{ color: DARK, opacity: 0.4 }}>
                    <span>Filing Progress</span><span>{client.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "#1B4D3E15" }}>
                    <div className="h-full rounded-full" style={{ width: `${client.progress}%`, backgroundColor: "#1B4D3E" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                  {[
                    { label: "CAC Registration", s: "in_progress" },
                    { label: "Tax Compliance",   s: "pending" },
                    { label: "Annual Returns",   s: "upcoming" },
                    { label: "Legal Docs",       s: "completed" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      {item.s === "completed"   && <CheckCircle size={11} style={{ color: "#16A34A" }} />}
                      {item.s === "in_progress" && <Clock       size={11} style={{ color: "#B45309" }} />}
                      {(item.s === "pending" || item.s === "upcoming") && <AlertCircle size={11} style={{ color: "#9CA3AF" }} />}
                      <span className="text-[11px]" style={{ color: DARK, opacity: item.s === "in_progress" ? 0.8 : 0.4 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Systemize — Locked */}
              <div className="rounded-2xl border p-5" style={{ borderColor: GOLD + "22", backgroundColor: WHITE }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: GOLD + "18", color: "#8B6914" }}>
                      <Lock size={9} style={{ display: "inline", marginRight: 3 }} />Not Activated
                    </span>
                    <h4 className="text-sm font-bold mt-1.5" style={{ color: DARK, opacity: 0.55 }}>Systemize</h4>
                    <p className="text-[11px]" style={{ color: DARK, opacity: 0.3 }}>Brand · Website · Automation · CRM · Social Media</p>
                  </div>
                  <Cpu size={22} style={{ color: DARK, opacity: 0.18 }} />
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-4">
                  {["Brand Identity", "Website Design", "Business Automation", "CRM Setup", "Social Media System", "Growth Strategy"].map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full border" style={{ borderColor: GOLD + "50" }} />
                      <span className="text-[11px]" style={{ color: DARK, opacity: 0.3 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: GOLD + "08", border: `1px solid ${GOLD}22` }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: DARK, opacity: 0.55 }}>
                    <strong style={{ color: "#8B6914" }}>Your brand is invisible without infrastructure.</strong> Most clients who activate Systemize see measurable growth within 60 days.
                  </p>
                </div>
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: TEAL, color: GOLD }}
                  onClick={() => toast.success("Request received! Your CSO will contact you within 24 hours to discuss Systemize.")}>
                  Activate Systemize →
                </button>
              </div>

              {/* Skills — Locked */}
              <div className="rounded-2xl border p-5" style={{ borderColor: GOLD + "22", backgroundColor: WHITE }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: GOLD + "18", color: "#8B6914" }}>
                      <Lock size={9} style={{ display: "inline", marginRight: 3 }} />Not Activated
                    </span>
                    <h4 className="text-sm font-bold mt-1.5" style={{ color: DARK, opacity: 0.55 }}>Hamzury Skills</h4>
                    <p className="text-[11px]" style={{ color: DARK, opacity: 0.3 }}>Training · Internship · CEO Development</p>
                  </div>
                  <GraduationCap size={22} style={{ color: DARK, opacity: 0.18 }} />
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-4">
                  {["Digital Marketing", "Business Dev", "Data Analysis", "AI Tools", "CEO Program", "Internship"].map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full border" style={{ borderColor: GOLD + "50" }} />
                      <span className="text-[11px]" style={{ color: DARK, opacity: 0.3 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: GOLD + "08", border: `1px solid ${GOLD}22` }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: DARK, opacity: 0.55 }}>
                    <strong style={{ color: "#8B6914" }}>The skills gap is the revenue gap.</strong> Businesses that invest in team capability grow 3× faster than those that don't.
                  </p>
                </div>
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: TEAL, color: GOLD }}
                  onClick={() => toast.success("Request received! Your CSO will contact you within 24 hours to discuss Hamzury Skills.")}>
                  Activate Skills →
                </button>
              </div>

              {/* Business Health Score */}
              <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Diagnostics</p>
                  <h3 className="text-sm font-bold" style={{ color: TEAL }}>Business Health Score</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: DARK, opacity: 0.4 }}>How your business looks to the world right now.</p>
                </div>
                {[
                  { label: "Compliance & Legal",         score: 65,   active: true,  dept: null },
                  { label: "Brand Identity",             score: null, active: false, dept: "Systemize" },
                  { label: "Website & Digital Presence", score: null, active: false, dept: "Systemize" },
                  { label: "Business Automation",        score: null, active: false, dept: "Systemize" },
                  { label: "Social Media Reach",         score: null, active: false, dept: "Systemize" },
                  { label: "Team Capability",            score: null, active: false, dept: "Skills" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium" style={{ color: DARK, opacity: item.active ? 0.8 : 0.35 }}>{item.label}</span>
                      {item.active
                        ? <span className="text-[12px] font-bold" style={{ color: TEAL }}>{item.score}%</span>
                        : <button className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: GOLD + "18", color: "#8B6914" }}
                            onClick={() => toast.info(`Activate ${item.dept} to unlock this metric.`)}>
                            Activate {item.dept} →
                          </button>
                      }
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: item.active ? TEAL + "12" : "#F3F4F6" }}>
                      {item.active && item.score && <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: GOLD }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PAYMENTS TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "payments" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Billing</p>
                <h2 className="text-xl font-bold" style={{ color: TEAL }}>Payments</h2>
              </div>
              <div className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
                  <div style={{ width: 140, height: 140 }} className="shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentData} cx="50%" cy="50%" innerRadius={46} outerRadius={62} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                          <Cell fill={GOLD} /><Cell fill={TEAL + "15"} />
                        </Pie>
                        <Tooltip formatter={(v: number) => [`₦${v.toLocaleString("en-NG")}`, ""]}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GOLD}30` }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: -120, textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>₦{(client.paid / 1000).toFixed(0)}k</span>
                      <span style={{ fontSize: 9, color: DARK, opacity: 0.4, display: "block" }}>paid</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5 w-full">
                    {[
                      { label: "Total Fee",  value: `₦${client.totalFee.toLocaleString("en-NG")}`, color: TEAL },
                      { label: "Paid",       value: `₦${client.paid.toLocaleString("en-NG")}`,     color: "#16A34A" },
                      { label: "Balance",    value: `₦${client.balance.toLocaleString("en-NG")}`,  color: "#B45309" },
                      { label: "Next Due",   value: client.nextPaymentDate,                        color: DARK },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-[13px]">
                        <span style={{ color: DARK, opacity: 0.5 }}>{row.label}</span>
                        <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: DARK, opacity: 0.4 }}>Payment History</p>
                <div className="space-y-2">
                  {payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl p-3 border text-[13px]"
                      style={{ borderColor: GOLD + "18", backgroundColor: CREAM }}>
                      <span style={{ color: DARK, opacity: 0.6 }}>{p.date}</span>
                      <span className="font-semibold" style={{ color: TEAL }}>₦{p.amount.toLocaleString("en-NG")}</span>
                      <StatusChip status={p.status === "paid" ? "completed" : "upcoming"} />
                    </div>
                  ))}
                </div>
              </div>

              {/* My Business card */}
              <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="flex items-center gap-2 pb-1">
                  <span style={{ color: GOLD }}><Building2 size={16} /></span>
                  <h2 className="text-[15px] font-semibold" style={{ color: TEAL }}>My Business</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Business Name", value: client.name },
                    { label: "Owner", value: client.owner },
                    { label: "Industry", value: client.industry },
                    { label: "Package", value: client.servicePackage },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: DARK, opacity: 0.4 }}>{row.label}</span>
                      <span className="text-[13px] font-semibold" style={{ color: TEAL }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Service Start", value: client.startDate, icon: <Calendar size={12} /> },
                    { label: "Assigned CSO",  value: client.assignedCSO, icon: <User size={12} /> },
                    { label: "Renewal",       value: `${client.renewalDays} days`, icon: <RefreshCw size={12} /> },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 border" style={{ borderColor: GOLD + "18", backgroundColor: CREAM }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ color: GOLD }}>{item.icon}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: DARK, opacity: 0.4 }}>{item.label}</span>
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MESSAGES TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "messages" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Communication</p>
                <h2 className="text-xl font-bold" style={{ color: TEAL }}>Messages</h2>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <div className="px-5 py-4 flex items-center justify-between border-b" style={{ backgroundColor: TEAL, borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: GOLD }}>
                      <MessageCircle size={15} style={{ color: TEAL }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Hamzury Team</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{client.assignedCSO} · Your Client Success Officer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                    Responds within 24h
                  </span>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "420px", backgroundColor: CREAM }}>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
                        style={{ backgroundColor: msg.from === "cso" ? TEAL : WHITE, color: msg.from === "cso" ? "rgba(255,255,255,0.9)" : DARK,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                          borderBottomLeftRadius: msg.from === "cso" ? 4 : undefined,
                          borderBottomRightRadius: msg.from === "client" ? 4 : undefined }}>
                        <p>{msg.text}</p>
                        <p className="text-[10px] mt-1 opacity-40">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: GOLD + "20" }}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message…" className="flex-1 rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
                    style={{ borderColor: GOLD + "30", backgroundColor: CREAM, color: DARK }} />
                  <button type="submit" className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-[12px] font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: GOLD, color: TEAL }}>
                    <Send size={13} />Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SUPPORT TAB
          ══════════════════════════════════════════════════════════════ */}
          {tab === "support" && (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: GOLD }}>Help</p>
                <h2 className="text-xl font-bold" style={{ color: TEAL }}>Support</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "WhatsApp Support",  desc: "Chat directly with your CSO",      action: "Open WhatsApp",  onClick: () => window.open("https://wa.me/2348034620520", "_blank") },
                  { title: "Send a Message",    desc: "Leave a message for your team",    action: "Go to Messages", onClick: () => setTab("messages") },
                  { title: "Email Us",          desc: "hello@hamzury.com",               action: "Compose Email",  onClick: () => window.open("mailto:hello@hamzury.com", "_blank") },
                  { title: "Visit Our Office",  desc: "Abuja, FCT — by appointment",     action: "Get Directions", onClick: () => window.open("https://www.google.com/maps?q=Abuja+FCT", "_blank") },
                ].map(card => (
                  <div key={card.title} className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: GOLD + "22" }}>
                    <p className="text-[14px] font-bold mb-1" style={{ color: TEAL }}>{card.title}</p>
                    <p className="text-[12px] mb-3" style={{ color: DARK, opacity: 0.5 }}>{card.desc}</p>
                    <button onClick={card.onClick} className="text-[12px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: GOLD }}>
                      {card.action} <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border p-5" style={{ backgroundColor: WHITE, borderColor: GOLD + "25" }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: GOLD }}>Common Questions</p>
                <div className="space-y-3">
                  {[
                    { q: "How long does CAC registration take?",  a: "Typically 5–10 business days after all required documents are received and the CAC portal processes the application." },
                    { q: "How do I send my documents?",           a: "Send them via WhatsApp (+234 803 462 0520) or reply in the Messages section. Your CSO will confirm receipt within 24 hours." },
                    { q: "What happens after CAC registration?",  a: "We'll proceed with your Tax ID (TIN) registration and help you open a corporate bank account. You'll be notified at each step." },
                    { q: "Can I upgrade my package?",             a: "Yes! Contact your CSO or use the Activate button in the My Services section to add Systemize or Skills to your package." },
                  ].map(faq => (
                    <div key={faq.q} className="rounded-xl p-4" style={{ backgroundColor: CREAM }}>
                      <p className="text-[13px] font-semibold mb-1.5" style={{ color: TEAL }}>{faq.q}</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: DARK, opacity: 0.6 }}>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: CREAM, border: "1px solid rgba(201,169,126,0.2)" }}>
                <TrendingUp size={20} style={{ color: GOLD }} className="mx-auto mb-2" />
                <p className="text-sm font-bold mb-1" style={{ color: TEAL }}>Know another business owner?</p>
                <p className="text-xs mb-3" style={{ color: "#888" }}>Refer them to HAMZURY and earn up to 13% commission on their package.</p>
                <a href="/affiliate" className="inline-block px-5 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: TEAL, color: GOLD }}>
                  Join Our Affiliate Program →
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── Mobile bottom tab bar ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center border-t"
        style={{ backgroundColor: WHITE, borderColor: GOLD + "20" }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-all"
            style={{ color: tab === item.id ? TEAL : DARK, opacity: tab === item.id ? 1 : 0.4 }}>
            <span style={{ color: tab === item.id ? TEAL : "inherit" }}>{item.icon}</span>
            <span className="text-[9px] font-semibold">{item.label.split(" ")[0]}</span>
            {item.badge && tab !== item.id && (
              <span className="absolute top-1.5 right-[calc(50%-16px)] w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: "#EA580C", color: WHITE }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
