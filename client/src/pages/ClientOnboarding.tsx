import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Loader2, ChevronRight, ChevronLeft, Check, Send, Building2, Shield, Palette, Globe, Upload } from "lucide-react";
import { toast } from "sonner";

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN = "#1B4D3E";
const GOLD  = "#B48C4C";
const MILK  = "#FFFAF6";
const WHITE = "#FFFFFF";
const BG    = "#F9F7F4";

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "welcome",    label: "Welcome",       icon: <Check size={16} /> },
  { id: "business",   label: "Your Business", icon: <Building2 size={16} /> },
  { id: "directors",  label: "Registration",  icon: <Shield size={16} /> },
  { id: "brand",      label: "Brand Vision",  icon: <Palette size={16} /> },
  { id: "digital",    label: "Digital",       icon: <Globe size={16} /> },
  { id: "confirm",    label: "Confirm",       icon: <Send size={16} /> },
];

export default function ClientOnboarding() {
  // Wildcard route captures full ref including slashes (e.g. HMZ-26/4-5623)
  const [, params] = useRoute("/start/*");
  const ref = (params as any)?.["*"] || window.location.pathname.replace("/start/", "") || "";

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Lookup client by ref
  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: ref.toUpperCase() },
    { enabled: ref.length > 5, retry: false },
  );

  const submitMutation = trpc.onboarding.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Requirements received — we'll be in touch shortly.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  // Form state
  const [form, setForm] = useState({
    // Business
    businessName: "",
    businessAddress: "",
    businessNature: "",
    businessEmail: "",
    // Directors (CAC)
    director1Name: "",
    director1Phone: "",
    director1IdType: "NIN",
    director2Name: "",
    director2Phone: "",
    director2IdType: "NIN",
    sharesplit: "100/0",
    // Trademark
    brandNames: "",
    hasLogo: "no",
    trademarkNotes: "",
    // Branding
    colorPreference: "",
    competitorBrands: "",
    targetAudience: "",
    brandPersonality: "",
    // Digital
    instagram: "",
    facebook: "",
    linkedin: "",
    whatsapp: "",
    currentWebsite: "",
    servicesOffered: "",
    // Extra
    additionalNotes: "",
  });

  const u = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Pre-fill from tracking data
  useEffect(() => {
    if (trackQuery.data?.found) {
      const d = trackQuery.data;
      setForm(prev => ({
        ...prev,
        businessName: d.businessName || prev.businessName,
      }));
    }
  }, [trackQuery.data]);

  const clientName = trackQuery.data?.found ? trackQuery.data.clientName : "";
  const firstName = clientName ? clientName.split(" ")[0] : "";
  const service = trackQuery.data?.found ? (trackQuery.data as any).service || "" : "";

  // ── Loading state ──
  if (ref && trackQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <Loader2 className="animate-spin" size={24} style={{ color: GOLD }} />
      </div>
    );
  }

  // ── Not found ──
  if (ref && !trackQuery.isLoading && !trackQuery.data?.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: BG }}>
        <PageMeta title="Not Found | HAMZURY" />
        <p className="text-[15px] font-medium" style={{ color: GREEN }}>Reference not found.</p>
        <p className="text-[13px] mt-2" style={{ color: "#999" }}>Please check your link and try again.</p>
      </div>
    );
  }

  // ── Submitted ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: BG }}>
        <PageMeta title="Thank You | HAMZURY" />
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${GREEN}10` }}>
          <Check size={28} style={{ color: GREEN }} />
        </div>
        <h1 className="text-[22px] font-semibold mb-2" style={{ color: GREEN }}>Requirements received.</h1>
        <p className="text-[14px] max-w-md leading-relaxed" style={{ color: "#888" }}>
          Thank you{firstName ? `, ${firstName}` : ""}. Our team will review everything and begin work on your project this week.
          You can track progress anytime at <strong style={{ color: GREEN }}>hamzury.com</strong> using your reference.
        </p>
        <div className="mt-6 px-5 py-3 rounded-xl" style={{ backgroundColor: `${GOLD}12`, border: `1px solid ${GOLD}25` }}>
          <span className="text-[12px] font-medium" style={{ color: "#999" }}>Your Reference</span>
          <p className="text-[18px] font-bold tracking-wide" style={{ color: GREEN }}>{ref.toUpperCase()}</p>
        </div>
        <a href="/" className="mt-8 text-[13px] font-medium" style={{ color: GOLD }}>Back to HAMZURY</a>
      </div>
    );
  }

  const canNext = () => {
    if (step === 0) return true; // welcome
    if (step === 1) return form.businessName.trim().length > 1 && form.businessAddress.trim().length > 3;
    if (step === 2) return form.director1Name.trim().length > 2;
    if (step === 3) return form.brandNames.trim().length > 1;
    if (step === 4) return true; // digital is optional
    if (step === 5) return true; // confirm
    return true;
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      ref: ref.toUpperCase(),
      data: form,
    });
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <PageMeta title="Get Started | HAMZURY" description="Submit your project requirements." />

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5" style={{
        height: 52,
        backgroundColor: `${WHITE}f0`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 0.5px 0 rgba(0,0,0,0.06)",
      }}>
        <a href="/" className="text-[14px] font-semibold tracking-tight" style={{ color: GREEN }}>
          HAMZURY
        </a>
        <span className="text-[12px] font-medium" style={{ color: GOLD }}>
          {ref.toUpperCase()}
        </span>
      </header>

      {/* ── Progress bar ── */}
      <div className="px-5 pt-4 pb-2 max-w-lg mx-auto">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${GREEN}10` }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: GOLD }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i <= step && setStep(i)}
              className="flex flex-col items-center gap-1 transition-opacity"
              style={{ opacity: i <= step ? 1 : 0.25 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                style={{
                  backgroundColor: i < step ? GREEN : i === step ? GOLD : `${GREEN}10`,
                  color: i <= step ? WHITE : GREEN,
                }}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className="text-[9px] font-medium hidden sm:block" style={{ color: i === step ? GREEN : "#BBB" }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Form content ── */}
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]" style={{ border: `1px solid ${GREEN}08` }}>

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center py-4">
              <h1 className="text-[24px] font-semibold leading-tight" style={{ color: GREEN }}>
                {firstName ? `Welcome, ${firstName}.` : "Welcome."}
              </h1>
              <p className="text-[14px] mt-3 leading-relaxed max-w-sm mx-auto" style={{ color: "#888" }}>
                Before we begin, we need a few details from you. This takes about 3 minutes
                and helps us start work on your project immediately.
              </p>
              {service && (
                <div className="mt-5 inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: `${GOLD}10` }}>
                  <span className="text-[12px] font-medium" style={{ color: GOLD }}>{service}</span>
                </div>
              )}
              <p className="text-[12px] mt-6" style={{ color: "#CCC" }}>
                Your information is confidential and protected.
              </p>
            </div>
          )}

          {/* ── Step 1: Business ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Your Business</h2>
                <p className="text-[13px] mt-1" style={{ color: "#999" }}>Basic details so we register everything correctly.</p>
              </div>
              <Field label="Business Name (as it should appear on CAC)" value={form.businessName} onChange={v => u("businessName", v)} placeholder="e.g. Ilumni Ltd" required />
              <Field label="Business Address" value={form.businessAddress} onChange={v => u("businessAddress", v)} placeholder="Full registered address" required />
              <Field label="Nature of Business" value={form.businessNature} onChange={v => u("businessNature", v)} placeholder="e.g. Technology consulting, Fashion retail..." />
              <Field label="Business Email" value={form.businessEmail} onChange={v => u("businessEmail", v)} placeholder="contact@yourbusiness.com" type="email" />
            </div>
          )}

          {/* ── Step 2: Directors / Registration ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Registration Details</h2>
                <p className="text-[13px] mt-1" style={{ color: "#999" }}>For CAC and compliance filing. Add at least one director.</p>
              </div>
              <Field label="Director 1 — Full Name" value={form.director1Name} onChange={v => u("director1Name", v)} placeholder="As it appears on ID" required />
              <Field label="Director 1 — Phone" value={form.director1Phone} onChange={v => u("director1Phone", v)} placeholder="08X XXXX XXXX" />
              <SelectField label="Director 1 — ID Type" value={form.director1IdType} onChange={v => u("director1IdType", v)} options={["NIN", "International Passport", "Voter's Card", "Driver's License"]} />

              <div className="pt-2" style={{ borderTop: `1px solid ${GREEN}08` }}>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: GOLD }}>Second Director (optional)</p>
              </div>
              <Field label="Director 2 — Full Name" value={form.director2Name} onChange={v => u("director2Name", v)} placeholder="Leave blank if sole proprietor" />
              <Field label="Director 2 — Phone" value={form.director2Phone} onChange={v => u("director2Phone", v)} placeholder="08X XXXX XXXX" />

              <SelectField label="Shareholding Split" value={form.sharesplit} onChange={v => u("sharesplit", v)} options={["100/0 (Sole)", "60/40", "50/50", "70/30", "80/20", "Other"]} />
            </div>
          )}

          {/* ── Step 3: Brand Vision ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Brand & Trademark</h2>
                <p className="text-[13px] mt-1" style={{ color: "#999" }}>Help us understand your vision so we protect and build it right.</p>
              </div>
              <Field label="Brand Name(s) to Register" value={form.brandNames} onChange={v => u("brandNames", v)} placeholder="e.g. Ilumni, Ilumni Consulting" required />
              <SelectField label="Do you have a logo already?" value={form.hasLogo} onChange={v => u("hasLogo", v)} options={["no", "yes — I'll send it", "yes — but I want a new one"]} />
              <TextArea label="Trademark Notes" value={form.trademarkNotes} onChange={v => u("trademarkNotes", v)} placeholder="Any specific classes or products to protect? (We'll advise if unsure)" />

              <div className="pt-2" style={{ borderTop: `1px solid ${GREEN}08` }}>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: GOLD }}>Brand personality</p>
              </div>
              <Field label="Colour Preferences" value={form.colorPreference} onChange={v => u("colorPreference", v)} placeholder="e.g. Navy blue & gold, earthy tones, no preference..." />
              <Field label="Brands You Admire" value={form.competitorBrands} onChange={v => u("competitorBrands", v)} placeholder="e.g. Apple, GTBank, Flutterwave..." />
              <Field label="Who is Your Target Audience?" value={form.targetAudience} onChange={v => u("targetAudience", v)} placeholder="e.g. Business owners in Lagos, 25-45, tech-savvy" />
              <SelectField label="How Should Your Brand Feel?" value={form.brandPersonality} onChange={v => u("brandPersonality", v)} options={["", "Premium & Authoritative", "Friendly & Approachable", "Bold & Disruptive", "Clean & Minimal", "Warm & Trustworthy", "Other"]} />
            </div>
          )}

          {/* ── Step 4: Digital Presence ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Digital Presence</h2>
                <p className="text-[13px] mt-1" style={{ color: "#999" }}>So we can set up your CRM and manage your social media.</p>
              </div>
              <Field label="Instagram Handle" value={form.instagram} onChange={v => u("instagram", v)} placeholder="@yourbrand" />
              <Field label="Facebook Page" value={form.facebook} onChange={v => u("facebook", v)} placeholder="facebook.com/yourbrand" />
              <Field label="LinkedIn" value={form.linkedin} onChange={v => u("linkedin", v)} placeholder="linkedin.com/company/yourbrand" />
              <Field label="WhatsApp Business Number" value={form.whatsapp} onChange={v => u("whatsapp", v)} placeholder="08X XXXX XXXX" />
              <Field label="Current Website (if any)" value={form.currentWebsite} onChange={v => u("currentWebsite", v)} placeholder="www.yourbusiness.com" />
              <TextArea label="What Services / Products Do You Offer?" value={form.servicesOffered} onChange={v => u("servicesOffered", v)} placeholder="Brief description of what your business does..." />
            </div>
          )}

          {/* ── Step 5: Confirm ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Almost Done.</h2>
                <p className="text-[13px] mt-1" style={{ color: "#999" }}>Review your details. You can go back to edit anything.</p>
              </div>

              <SummaryRow label="Business Name" value={form.businessName} />
              <SummaryRow label="Address" value={form.businessAddress} />
              <SummaryRow label="Director 1" value={form.director1Name} />
              {form.director2Name && <SummaryRow label="Director 2" value={form.director2Name} />}
              <SummaryRow label="Shares" value={form.sharesplit} />
              <SummaryRow label="Brand Names" value={form.brandNames} />
              <SummaryRow label="Has Logo" value={form.hasLogo} />
              {form.colorPreference && <SummaryRow label="Colours" value={form.colorPreference} />}
              {form.targetAudience && <SummaryRow label="Target Audience" value={form.targetAudience} />}
              {form.instagram && <SummaryRow label="Instagram" value={form.instagram} />}
              {form.whatsapp && <SummaryRow label="WhatsApp" value={form.whatsapp} />}
              {form.servicesOffered && <SummaryRow label="Services" value={form.servicesOffered} />}

              <TextArea label="Anything else we should know?" value={form.additionalNotes} onChange={v => u("additionalNotes", v)} placeholder="Additional notes, preferences, or documents you'll send later..." />
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: `1px solid ${GREEN}06` }}>
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: GREEN }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1.5 text-[13px] font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-30"
                style={{ backgroundColor: GREEN, color: GOLD }}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex items-center gap-1.5 text-[13px] font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: GREEN, color: GOLD }}
              >
                {submitMutation.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={14} /> Submit Requirements</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust footer */}
        <p className="text-center text-[11px] mt-6 pb-8" style={{ color: "#CCC" }}>
          HAMZURY Institution · Confidential · Your data is protected
        </p>
      </div>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1.5" style={{ color: GREEN }}>
        {label} {required && <span style={{ color: GOLD }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all focus:ring-2"
        style={{
          backgroundColor: MILK,
          border: `1px solid ${GREEN}12`,
          color: GREEN,
          focusRingColor: GOLD,
        }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1.5" style={{ color: GREEN }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 rounded-lg text-[14px] outline-none resize-none transition-all focus:ring-2"
        style={{
          backgroundColor: MILK,
          border: `1px solid ${GREEN}12`,
          color: GREEN,
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1.5" style={{ color: GREEN }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all"
        style={{
          backgroundColor: MILK,
          border: `1px solid ${GREEN}12`,
          color: GREEN,
        }}
      >
        {options.map(o => (
          <option key={o} value={o}>{o || "— Select —"}</option>
        ))}
      </select>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2" style={{ borderBottom: `1px solid ${GREEN}06` }}>
      <span className="text-[12px] font-medium shrink-0" style={{ color: "#999" }}>{label}</span>
      <span className="text-[13px] font-medium text-right" style={{ color: GREEN }}>{value}</span>
    </div>
  );
}
