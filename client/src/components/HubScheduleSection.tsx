/**
 * HUB Quarterly Schedule — public-facing.
 * 2026-05-07 — shows the founder's quarterly cohort plan + always-on intake
 * in one clean section. Drives off client/src/lib/hub-schedule.ts so any
 * date change in that file flows here automatically.
 */
import { Link } from "wouter";
import {
  HUB_LAUNCH_SCHEDULE, HUB_ALWAYS_ON,
  getCurrentPhase, fmtScheduleDate,
  type HubQuarterPlan, type HubCohortBlock,
} from "@/lib/hub-schedule";
import { CheckCircle, Calendar, Clock, ArrowRight, MapPin, Sparkles } from "lucide-react";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const W    = "#FFFFFF";

export default function HubScheduleSection() {
  const phase = getCurrentPhase();
  // Find the cohort to feature: current one (if running/sale/graduation) or next one (if between).
  const featured: HubQuarterPlan | null =
    phase.kind === "sale"        ? phase.quarter :
    phase.kind === "running"     ? phase.quarter :
    phase.kind === "graduation"  ? phase.quarter :
    phase.kind === "between"     ? phase.nextQuarter :
    null;

  return (
    <section id="schedule" className="py-20 md:py-28 px-6" style={{ backgroundColor: `${DARK}06` }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>
          QUARTERLY SCHEDULE
        </p>
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-3 text-center tracking-tight" style={{ color: TEXT }}>
          When sales open. When cohorts run. When graduation happens.
        </h2>
        <p className="text-[13px] text-center mb-12 max-w-2xl mx-auto" style={{ color: `${TEXT}55` }}>
          Physical cohorts run on a quarterly rhythm — sale window, orientation Mon, cohort runs, graduation Fri.
          Internships and Online Academy stay open all year.
        </p>

        {/* ── PHASE BANNER (current state of the site, computed live) ── */}
        <PhaseBanner />

        {/* ── FEATURED QUARTER ── */}
        {featured && <QuarterCard quarter={featured} variant="featured" />}

        {/* ── ALL UPCOMING QUARTERS (compact) ── */}
        <div className="mt-12">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4 text-center" style={{ color: `${TEXT}66` }}>
            Upcoming cycles
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {HUB_LAUNCH_SCHEDULE.filter(q => q.id !== featured?.id).slice(0, 3).map(q => (
              <QuarterCard key={q.id} quarter={q} variant="compact" />
            ))}
          </div>
        </div>

        {/* ── ALWAYS-ON INTAKE ── */}
        <AlwaysOnPanel />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function PhaseBanner() {
  const phase = getCurrentPhase();
  let label: string, body: string, dotColor: string, action: { href: string; label: string } | null = null;

  if (phase.kind === "sale") {
    label = "🟢 Sale window OPEN";
    body  = `Apply by ${fmtScheduleDate(phase.quarter.saleEnd)} — orientation ${fmtScheduleDate(phase.quarter.orientation)} (${phase.daysToOrientation} days).`;
    dotColor = "#16A34A";
    action = { href: "/hub/enroll", label: "Enrol now" };
  } else if (phase.kind === "running") {
    label = "🟡 Cohort in progress";
    body  = `${phase.quarter.label} is running. Graduation ${fmtScheduleDate(phase.quarter.graduation)} (${phase.daysToGraduation} days). Next sale window opens after.`;
    dotColor = GOLD;
  } else if (phase.kind === "graduation") {
    label = "🎓 Graduation today";
    body  = `${phase.quarter.label} graduates today. Next sale window opens shortly.`;
    dotColor = "#16A34A";
  } else if (phase.kind === "between") {
    label = "🔔 Next sale window";
    body  = `Opens ${fmtScheduleDate(phase.nextQuarter.saleStart)} (${phase.daysToSale} days). Internships and Online Academy still open today.`;
    dotColor = GOLD;
    action = { href: "#always-on", label: "See always-on programmes" };
  } else {
    label = "Schedule complete";
    body  = "All cohorts in this plan have graduated. Tell the team to add the next year.";
    dotColor = "#9CA3AF";
  }

  return (
    <div
      className="rounded-2xl p-5 md:p-6 mb-10 flex flex-col md:flex-row md:items-center gap-4"
      style={{ backgroundColor: W, border: `1px solid ${DARK}10` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 rounded-full hub-pulse-dot" style={{ backgroundColor: dotColor }} />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: DARK }}>{label}</span>
        </div>
        <p className="text-[13.5px]" style={{ color: TEXT }}>{body}</p>
      </div>
      {action && (
        <Link href={action.href}>
          <span
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold cursor-pointer transition-transform hover:scale-[1.03] whitespace-nowrap"
            style={{ backgroundColor: GOLD, color: DARK, boxShadow: `0 6px 20px ${GOLD}50` }}
          >
            {action.label} <ArrowRight size={14} strokeWidth={2.5} />
          </span>
        </Link>
      )}
      <style>{`
        @keyframes hubPulseDotKf { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.7); opacity: 0.55; } }
        .hub-pulse-dot { animation: hubPulseDotKf 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hub-pulse-dot { animation: none; } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function QuarterCard({ quarter, variant }: { quarter: HubQuarterPlan; variant: "featured" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: W, border: `1px solid ${DARK}10` }}>
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: GOLD }}>{quarter.label}</p>
        {quarter.subtitle && <p className="text-[10.5px] mb-3" style={{ color: `${TEXT}55` }}>{quarter.subtitle}</p>}
        <div className="space-y-1.5 text-[11.5px]" style={{ color: TEXT }}>
          <ScheduleRow icon="🛒" label="Sale" value={`${fmtScheduleDate(quarter.saleStart)} – ${fmtScheduleDate(quarter.saleEnd)}`} />
          <ScheduleRow icon="🎬" label="Orientation" value={fmtScheduleDate(quarter.orientation)} />
          <ScheduleRow icon="🎓" label="Graduation" value={fmtScheduleDate(quarter.graduation)} />
          <ScheduleRow icon="📚" label="Cohorts" value={`${quarter.cohorts.length} programmes`} />
        </div>
      </div>
    );
  }

  // Featured layout — full grid of cohorts
  const monWed = quarter.cohorts.filter(c => c.pattern === "Mon–Wed 8am–2pm");
  const thuSat = quarter.cohorts.filter(c => c.pattern === "Thu–Sat 8am–2pm");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: W, border: `1px solid ${DARK}10` }}>
      <div className="px-6 py-4" style={{ backgroundColor: DARK, color: W }}>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">Featured cycle</p>
        <h3 className="text-[20px] font-medium mt-1">{quarter.label}</h3>
        {quarter.subtitle && <p className="text-[12px] opacity-75 mt-1">{quarter.subtitle}</p>}
      </div>

      {/* Sale → Orientation → Graduation strip */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ backgroundColor: `${GOLD}08`, borderBottom: `1px solid ${DARK}10` }}>
        <Milestone icon="🛒" title="Sale window" detail={`${fmtScheduleDate(quarter.saleStart)} – ${fmtScheduleDate(quarter.saleEnd)}`} accent={GOLD} />
        <Milestone icon="🎬" title="Orientation"  detail={fmtScheduleDate(quarter.orientation)} accent={DARK} />
        <Milestone icon="🎓" title="Graduation"   detail={fmtScheduleDate(quarter.graduation)} accent="#16A34A" />
      </div>

      {/* Cohort lists */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: `${DARK}10` }}>
        <CohortColumn title="Mon–Wed · 8am–2pm" subtitle="Advanced adult cohorts" cohorts={monWed} />
        <CohortColumn title="Thu–Sat · 8am–2pm" subtitle="Basics (kids) + Hardware" cohorts={thuSat} />
      </div>
    </div>
  );
}

function Milestone({ icon, title, detail, accent }: { icon: string; title: string; detail: string; accent: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span style={{ fontSize: 18, lineHeight: 1.1 }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase" style={{ color: accent }}>{title}</p>
        <p className="text-[12px] mt-0.5" style={{ color: TEXT }}>{detail}</p>
      </div>
    </div>
  );
}

function CohortColumn({ title, subtitle, cohorts }: { title: string; subtitle: string; cohorts: HubCohortBlock[] }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: DARK }}>{title}</p>
      <p className="text-[11px] mb-4" style={{ color: `${TEXT}55` }}>{subtitle}</p>
      {cohorts.length === 0 ? (
        <p className="text-[12px] italic" style={{ color: `${TEXT}45` }}>No cohorts scheduled this cycle.</p>
      ) : (
        <div className="space-y-2">
          {cohorts.map((c, i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: `${DARK}04`, border: `1px solid ${DARK}08` }}>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <p className="text-[12.5px] font-semibold" style={{ color: TEXT }}>{c.name}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}20`, color: "#8B6914" }}>
                  {c.weeks}wk · {c.hall}
                </span>
              </div>
              <div className="text-[10.5px]" style={{ color: `${TEXT}66` }}>
                {fmtScheduleDate(c.startDate)} → {fmtScheduleDate(c.endDate)} · ₦{c.priceNaira.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span className="font-semibold opacity-70 mr-1">{label}:</span>
      <span className="opacity-90">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function AlwaysOnPanel() {
  return (
    <div id="always-on" className="mt-14">
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: DARK, color: W }}>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={18} style={{ color: GOLD }} />
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>Continuous intake</p>
        </div>
        <h3 className="text-[20px] md:text-[22px] font-light tracking-tight mb-2">Apply any day. Start any day.</h3>
        <p className="text-[13px] opacity-75 mb-6 max-w-2xl">
          Internships and Online Academy don't follow the quarterly cycle — applications are always open and you start as soon as we confirm you're a fit.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ backgroundColor: `${W}08`, border: `1px solid ${W}15` }}>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: GOLD }}>Internships</p>
            {HUB_ALWAYS_ON.internships.map((p, i) => (
              <div key={i} className="py-2 border-t first:border-t-0" style={{ borderColor: `${W}10` }}>
                <p className="text-[13px] font-medium">{p.name}</p>
                <p className="text-[11px] opacity-70 mt-1">{p.duration} · ₦{p.priceNaira.toLocaleString()}/mo</p>
                <p className="text-[10.5px] opacity-55 mt-1 italic">{p.note}</p>
              </div>
            ))}
            <Link href="/hub/enroll">
              <span className="inline-flex items-center gap-1 mt-3 text-[12px] font-semibold cursor-pointer" style={{ color: GOLD }}>
                Apply for an internship <ArrowRight size={12} />
              </span>
            </Link>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: `${W}08`, border: `1px solid ${W}15` }}>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: GOLD }}>Online Academy</p>
            <div className="grid grid-cols-1 gap-x-4 text-[12px]">
              {HUB_ALWAYS_ON.online.map((c, i) => (
                <div key={i} className="py-1.5 border-t first:border-t-0 flex items-baseline justify-between gap-2" style={{ borderColor: `${W}10` }}>
                  <span>{c.name}</span>
                  <span className="text-[10.5px] opacity-65 whitespace-nowrap">₦{c.priceNaira.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Link href="/hub/enroll">
              <span className="inline-flex items-center gap-1 mt-3 text-[12px] font-semibold cursor-pointer" style={{ color: GOLD }}>
                Start an Online course <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
