/**
 * DivisionServices — the rich "Our Services" surface used by Bizdoc, Scalar,
 * and Medialy. Replaces the legacy `cfg.serviceCategories` accordion when
 * `cfg.servicesCatalog` is supplied.
 *
 * Behaviour mirrors the source-of-truth mockup at
 * /Users/MAC/Downloads/bizdoc-services-v3-4.html:
 *
 *   • Mobile (≤640px): single-column scroll. Tap a category row to drill in.
 *     Tap a service to expand its educational layer (use/fee/timeline/need)
 *     and add to selection. A floating "Your selection (N)" bar opens a
 *     bottom-sheet cart.
 *   • Desktop (≥640px): hybrid — pill row of industries on top, 2-column
 *     grid of category cards with disclosure rows. Cart slides in from the
 *     right as a sticky panel.
 *   • Industries are a separate surface above categories. Picking an
 *     industry shows a curated bundle of services already in `categories`.
 *
 * Cart → Chat: clicking "Send selection" stores the message in
 * localStorage["hamzury:chat-prefill"], dispatches a
 * `hamzury:open-chat` CustomEvent, and clicks `[data-chat-trigger]` so the
 * existing ChatWidget opens. Cart is cleared after send.
 *
 * Cart persists in localStorage["hamzury:cart:{division}"] with a 24-hour TTL.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight, ChevronLeft, X, Plus, Check, Clock, FileText,
  Send, ShoppingBag, ArrowLeft,
} from "lucide-react";
import type { DivisionServicesCatalog, ServiceItem, IndustryPath } from "./division-services-types";

type Division = "bizdoc" | "systemise" | "general";

type Props = {
  catalog: DivisionServicesCatalog;
  accent: string;
  highlight: string;
  division: Division;
};

const CART_TTL_MS = 24 * 60 * 60 * 1000;

/* ─── Fee parsing for total estimate ────────────────────────────────── */
function parseFeeNaira(fee: string): number | null {
  // Pull the first numeric (with thousand separators) preceded by ₦.
  const m = fee.match(/₦\s?([\d,]+)/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function formatTotal(items: ServiceItem[]): string {
  let sum = 0;
  let anyParsed = false;
  let anyQuote = false;
  for (const it of items) {
    const v = parseFeeNaira(it.fee);
    if (v != null) {
      sum += v;
      anyParsed = true;
    } else {
      anyQuote = true;
    }
  }
  if (!anyParsed) return "Quote on request";
  const num = `₦${sum.toLocaleString("en-NG")}`;
  return anyQuote ? `${num} + quote items` : num;
}

/* ─── Cart hook ────────────────────────────────────────────────────── */
function useCart(division: Division, allItems: Map<string, ServiceItem>) {
  const key = `hamzury:cart:${division}`;
  const [ids, setIds] = useState<string[]>([]);

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { savedAt: number; ids: string[] };
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > CART_TTL_MS) {
        localStorage.removeItem(key);
        return;
      }
      if (Array.isArray(parsed.ids)) {
        // Filter to ids that still exist in the catalog
        setIds(parsed.ids.filter((id) => allItems.has(id)));
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist
  useEffect(() => {
    try {
      if (ids.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), ids }));
      }
    } catch {
      /* ignore */
    }
  }, [ids, key]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const clear = useCallback(() => setIds([]), []);

  return { ids, has, toggle, clear };
}

/* ─── Component ────────────────────────────────────────────────────── */
export default function DivisionServices({ catalog, accent, highlight, division }: Props) {
  const G = accent;
  const Au = highlight;
  const W = "#FFFFFF";
  const Cr = "#FFFAF6";

  // Build a flat id → item map across every category for easy lookup.
  const itemsById = useMemo(() => {
    const m = new Map<string, ServiceItem>();
    for (const cat of catalog.categories) {
      for (const it of cat.items) m.set(it.id, it);
    }
    return m;
  }, [catalog]);

  const cart = useCart(division, itemsById);

  // Mobile: which screen are we on?
  type Screen = { kind: "home" } | { kind: "category"; id: string } | { kind: "industry"; id: string };
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  // Per-category "show all" toggle, ephemeral (resets on remount).
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const isCatExpanded = useCallback((id: string) => !!expandedCats[id], [expandedCats]);
  const toggleCatExpanded = useCallback((id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Reset expanded item when navigating
  useEffect(() => setExpandedItemId(null), [screen.kind, activeIndustry]);

  /* ─── Send cart to chat ─────────────────────────────────────────── */
  const sendToChat = useCallback(() => {
    const items = cart.ids
      .map((id) => itemsById.get(id))
      .filter((x): x is ServiceItem => Boolean(x));
    if (items.length === 0) return;

    const lines = [
      "Hello — I'd like to discuss the following services:",
      "",
      ...items.map((it) => `• ${it.name} — ${it.fee} (${it.timeline})`),
      "",
      `Indicative cost: ${formatTotal(items)}`,
      "",
      "Please ask me what I need to prepare to start.",
    ];
    const message = lines.join("\n");

    try {
      localStorage.setItem("hamzury:chat-prefill", JSON.stringify({
        savedAt: Date.now(),
        department: division,
        prefill: message,
      }));
    } catch { /* ignore */ }

    try {
      window.dispatchEvent(new CustomEvent("hamzury:open-chat", {
        detail: { department: division, prefill: message },
      }));
    } catch { /* ignore */ }

    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement | null;
    if (btn) btn.click();

    cart.clear();
    setCartOpen(false);
  }, [cart, division, itemsById]);

  /* ─── Industry view items ──────────────────────────────────────── */
  const industryItems = useMemo<{ industry: IndustryPath; items: ServiceItem[] } | null>(() => {
    if (!activeIndustry || !catalog.industries) return null;
    const ind = catalog.industries.find((i) => i.id === activeIndustry);
    if (!ind) return null;
    const its = ind.itemIds.map((id) => itemsById.get(id)).filter((x): x is ServiceItem => Boolean(x));
    return { industry: ind, items: its };
  }, [activeIndustry, catalog.industries, itemsById]);

  /* ─── Service row (shared) ─────────────────────────────────────── */
  const ServiceRow = ({ item, popular }: { item: ServiceItem; popular?: boolean }) => {
    const isOpen = expandedItemId === item.id;
    const inCart = cart.has(item.id);
    return (
      <div
        className="rounded-xl border transition-all"
        style={{
          borderColor: isOpen ? `${G}30` : `${G}12`,
          backgroundColor: isOpen ? W : Cr,
          boxShadow: isOpen ? `0 8px 24px ${G}12` : "none",
        }}
      >
        <button
          onClick={() => setExpandedItemId(isOpen ? null : item.id)}
          className="w-full text-left px-4 py-3.5"
          aria-expanded={isOpen}
        >
          {/* Top row: name + popular/added badge */}
          <div className="flex items-start gap-2">
            <span
              className="font-medium leading-snug flex-1 min-w-0 break-words"
              style={{ color: G, fontFamily: "'Fraunces', serif", fontSize: 15 }}
            >
              {item.name}
            </span>
            {inCart && (
              <span
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: Au, color: W }}
                aria-label="Added to selection"
              >
                <Check size={10} strokeWidth={3} /> Added
              </span>
            )}
            {!inCart && popular && (
              <span
                className="shrink-0 text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: `${Au}24`, color: Au }}
                aria-label="Popular service"
              >
                ★ Popular
              </span>
            )}
          </div>

          {/* Bottom row: fee teaser + tap hint */}
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="text-[12.5px] font-semibold whitespace-nowrap" style={{ color: Au }}>
              {item.fee}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: G, opacity: 0.55 }}>
              {isOpen ? (
                <>Hide details <ChevronLeft size={11} style={{ transform: "rotate(-90deg)" }} /></>
              ) : (
                <>Tap for details <ChevronRight size={11} style={{ transform: "rotate(90deg)" }} /></>
              )}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: `1px dashed ${G}14`, marginTop: 4, paddingTop: 12 }}>
            <p className="text-[13px] leading-relaxed break-words" style={{ color: G, opacity: 0.82, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
              {item.use}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px]">
              <Pill label="Fee" value={item.fee} G={G} Au={Au} />
              <Pill label="Timeline" value={item.timeline} G={G} Au={Au} icon={<Clock size={10} />} />
              <Pill label="What to send us" value={item.need} G={G} Au={Au} icon={<FileText size={10} />} />
            </div>
            {item.note && (
              <p className="text-[11.5px] italic break-words" style={{ color: G, opacity: 0.6 }}>
                {item.note}
              </p>
            )}
            <button
              onClick={() => cart.toggle(item.id)}
              className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: inCart ? `${Au}18` : G,
                color: Au,
              }}
            >
              {inCart ? (
                <>
                  <Check size={13} strokeWidth={2.5} /> Added — tap to remove
                </>
              ) : (
                <>
                  <Plus size={13} strokeWidth={2.5} /> Add to my selection
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ─── Category card (desktop) ─────────────────────────────────── */
  const CategoryCard = ({ catId }: { catId: string }) => {
    const cat = catalog.categories.find((c) => c.id === catId);
    if (!cat) return null;
    const total = cat.items.length;
    const collapseThreshold = 8;
    const initialShown = 6;
    const expanded = isCatExpanded(cat.id);
    const showCollapseControl = total > collapseThreshold;
    const visibleItems = showCollapseControl && !expanded ? cat.items.slice(0, initialShown) : cat.items;
    return (
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: `${G}10`, backgroundColor: Cr }}
      >
        <div className="px-5 pt-5 pb-3">
          <h3
            className="text-[16px] font-medium tracking-tight break-words"
            style={{ color: G, fontFamily: "'Fraunces', serif" }}
          >
            {cat.name}
          </h3>
          {cat.intro && (
            <p className="text-[12px] mt-1 leading-relaxed break-words" style={{ color: G, opacity: 0.55 }}>
              {cat.intro}
            </p>
          )}
        </div>
        <div className="h-px mx-5" style={{ backgroundColor: `${G}08` }} />
        <div className="p-3 space-y-1.5">
          {visibleItems.map((it, i) => (
            <ServiceRow key={it.id} item={it} popular={i < 3} />
          ))}
          {showCollapseControl && (
            <button
              onClick={() => toggleCatExpanded(cat.id)}
              className="w-full py-2 rounded-xl text-[11.5px] font-semibold mt-1"
              style={{ backgroundColor: `${G}08`, color: G }}
            >
              {expanded ? `Show fewer` : `Show all (${total})`}
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── Industries pill row ─────────────────────────────────────── */
  const IndustryPills = () => {
    if (!catalog.industries || catalog.industries.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: Au }}
          >
            By Industry
          </p>
          {activeIndustry && (
            <button
              onClick={() => setActiveIndustry(null)}
              className="text-[11px] flex items-center gap-1 hover:opacity-70"
              style={{ color: G, opacity: 0.6 }}
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 hide-scroll">
            {catalog.industries.map((ind) => {
              const active = activeIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustry(active ? null : ind.id)}
                  className="shrink-0 px-3.5 py-2 rounded-full text-[11.5px] font-medium border transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: active ? G : W,
                    color: active ? Au : G,
                    borderColor: active ? G : `${G}18`,
                  }}
                >
                  {ind.emoji ? `${ind.emoji} ` : ""}{ind.name}
                </button>
              );
            })}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-full w-10"
            style={{ background: `linear-gradient(to left, ${W}, ${W}00)` }}
          />
        </div>
      </div>
    );
  };

  /* ─── Industry detail panel (desktop & mobile) ────────────────── */
  const IndustryDetail = () => {
    if (!industryItems) return null;
    const { industry, items } = industryItems;
    return (
      <div
        className="rounded-2xl border p-5 mb-6"
        style={{ borderColor: `${Au}28`, backgroundColor: `${Au}06` }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: Au }}>
              Industry Path
            </p>
            <h3 className="text-[18px] font-medium break-words" style={{ color: G, fontFamily: "'Fraunces', serif" }}>
              {industry.emoji ? `${industry.emoji} ` : ""}{industry.name}
            </h3>
            <p className="text-[12.5px] mt-1 leading-relaxed break-words" style={{ color: G, opacity: 0.7 }}>
              {industry.intro}
            </p>
          </div>
        </div>
        <p
          className="text-[13px] italic leading-relaxed mb-3"
          style={{ color: G, opacity: 0.78, fontFamily: "'Fraunces', serif" }}
        >
          These are the documents this kind of business actually needs. Pick what applies to you — we'll guide the rest.
        </p>
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <ServiceRow key={`ind-${it.id}`} item={it} popular={i < 3} />
          ))}
        </div>
      </div>
    );
  };

  /* ─── Mobile category screen ──────────────────────────────────── */
  const MobileCategoryScreen = ({ catId }: { catId: string }) => {
    const cat = catalog.categories.find((c) => c.id === catId);
    if (!cat) return null;
    const total = cat.items.length;
    const collapseThreshold = 8;
    const initialShown = 6;
    const expanded = isCatExpanded(cat.id);
    const showCollapseControl = total > collapseThreshold;
    const visibleItems = showCollapseControl && !expanded ? cat.items.slice(0, initialShown) : cat.items;
    return (
      <div className="space-y-3">
        <button
          onClick={() => setScreen({ kind: "home" })}
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: G, opacity: 0.6 }}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <h3 className="text-[20px] font-medium break-words" style={{ color: G, fontFamily: "'Fraunces', serif" }}>
          {cat.name}
        </h3>
        {cat.intro && (
          <p className="text-[13px] leading-relaxed break-words" style={{ color: G, opacity: 0.6 }}>
            {cat.intro}
          </p>
        )}
        <div className="space-y-1.5 pt-2">
          {visibleItems.map((it, i) => (
            <ServiceRow key={it.id} item={it} popular={i < 3} />
          ))}
          {showCollapseControl && (
            <button
              onClick={() => toggleCatExpanded(cat.id)}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold mt-2"
              style={{ backgroundColor: `${G}08`, color: G }}
            >
              {expanded ? `Show fewer` : `Show all (${total})`}
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── Mobile industry screen ──────────────────────────────────── */
  const MobileIndustryScreen = () => {
    if (!industryItems) return null;
    const { industry, items } = industryItems;
    return (
      <div className="space-y-3">
        <button
          onClick={() => { setActiveIndustry(null); setScreen({ kind: "home" }); }}
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: G, opacity: 0.6 }}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: Au }}>
          Industry Path
        </p>
        <h3 className="text-[20px] font-medium break-words" style={{ color: G, fontFamily: "'Fraunces', serif" }}>
          {industry.emoji ? `${industry.emoji} ` : ""}{industry.name}
        </h3>
        <p className="text-[13px] leading-relaxed break-words" style={{ color: G, opacity: 0.6 }}>
          {industry.intro}
        </p>
        <p
          className="text-[13px] italic leading-relaxed pt-1"
          style={{ color: G, opacity: 0.78, fontFamily: "'Fraunces', serif" }}
        >
          These are the documents this kind of business actually needs. Pick what applies to you — we'll guide the rest.
        </p>
        <div className="space-y-1.5 pt-2">
          {items.map((it, i) => (
            <ServiceRow key={`mind-${it.id}`} item={it} popular={i < 3} />
          ))}
        </div>
      </div>
    );
  };

  /* ─── Mobile home (categories list) ───────────────────────────── */
  const MobileHome = () => (
    <div className="space-y-2">
      {/* Industries shortcut row */}
      {catalog.industries && catalog.industries.length > 0 && (
        <div className="mb-4">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: Au }}
          >
            By Industry
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 hide-scroll">
              {catalog.industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => { setActiveIndustry(ind.id); setScreen({ kind: "industry", id: ind.id }); }}
                  className="shrink-0 px-3.5 py-2 rounded-full text-[11.5px] font-medium border whitespace-nowrap"
                  style={{ backgroundColor: "#FFFFFF", color: G, borderColor: `${G}18` }}
                >
                  {ind.emoji ? `${ind.emoji} ` : ""}{ind.name}
                </button>
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-full w-8"
              style={{ background: `linear-gradient(to left, ${W}, ${W}00)` }}
            />
          </div>
        </div>
      )}

      <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: Au }}>
        Categories
      </p>
      {catalog.categories.map((cat, idx) => (
        <button
          key={cat.id}
          onClick={() => setScreen({ kind: "category", id: cat.id })}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border text-left transition-all"
          style={{ borderColor: `${G}10`, backgroundColor: Cr }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-semibold"
            style={{ backgroundColor: `${G}0C`, color: G, fontFamily: "'Fraunces', serif" }}
          >
            {idx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[14px] font-semibold leading-snug break-words"
              style={{ color: G, fontFamily: "'Fraunces', serif" }}
            >
              {cat.name}
            </div>
            <div className="text-[11px] opacity-50 truncate" style={{ color: G }}>
              {cat.items.length} services{cat.intro ? ` · ${cat.intro}` : ""}
            </div>
          </div>
          <ChevronRight size={14} className="shrink-0" style={{ color: G, opacity: 0.35 }} />
        </button>
      ))}
    </div>
  );

  /* ─── Cart drawer (mobile bottom sheet, desktop right rail) ───── */
  const CartContents = () => {
    const items = cart.ids
      .map((id) => itemsById.get(id))
      .filter((x): x is ServiceItem => Boolean(x));
    return (
      <>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: `${G}10` }}>
          <h4
            className="text-[15px] font-medium"
            style={{ color: G, fontFamily: "'Fraunces', serif" }}
          >
            Your selection ({items.length})
          </h4>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 shrink-0"
            style={{ backgroundColor: `${G}06`, color: G }}
            aria-label="Close cart"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-[13px] text-center py-8 leading-relaxed" style={{ color: G, opacity: 0.55 }}>
              Tap services you're interested in.<br />We'll bundle them for you.
            </p>
          ) : (
            <>
              <p
                className="text-[13px] italic leading-relaxed pb-1"
                style={{ color: G, opacity: 0.78, fontFamily: "'Fraunces', serif" }}
              >
                Here's what you've picked. We'll match the right person to walk you through it.
              </p>
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start gap-3 pb-3 border-b"
                  style={{ borderColor: `${G}08` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium break-words" style={{ color: G, fontFamily: "'Fraunces', serif" }}>
                      {it.name}
                    </p>
                    <p className="text-[11px] mt-0.5 break-words" style={{ color: G, opacity: 0.55 }}>
                      {it.fee} · {it.timeline}
                    </p>
                  </div>
                  <button
                    onClick={() => cart.toggle(it.id)}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70"
                    style={{ backgroundColor: `${G}06`, color: G }}
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        {items.length > 0 && (
          <div className="px-5 pt-3 pb-4 border-t space-y-2" style={{ borderColor: `${G}10` }}>
            <div className="flex items-start justify-between gap-3 text-[12px]" style={{ color: G }}>
              <span className="opacity-55 shrink-0">Indicative cost</span>
              <span className="font-semibold text-right break-words min-w-0" style={{ color: Au }}>
                {formatTotal(items)}
              </span>
            </div>
            <p className="text-[11px] leading-snug" style={{ color: G, opacity: 0.5 }}>
              Final quote depends on your situation. Most clients pay close to this.
            </p>
            <button
              onClick={sendToChat}
              className="w-full py-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 mt-1"
              style={{ backgroundColor: G, color: Au }}
            >
              <Send size={13} /> Get a quote on these
            </button>
            <button
              onClick={() => cart.clear()}
              className="w-full py-2 text-[11.5px] hover:opacity-70"
              style={{ color: G, opacity: 0.5 }}
            >
              Clear selection
            </button>
          </div>
        )}
      </>
    );
  };

  const cartCount = cart.ids.length;

  // ─── Bump animation when an item is added ──────────────────────────
  // Quiet, in-place: the fixed top-left chip briefly scales + flashes
  // so the user gets peripheral confirmation that "something happened".
  // No scroll, no popup, no overlay — match the HTML mockup behaviour
  // where the cart icon just ticks up.
  const [bumpKey, setBumpKey] = useState(0);
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBumpKey((k) => k + 1);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes hmz-cart-bump {
          0%, 100% { transform: scale(1); }
          40%      { transform: scale(1.08); }
        }
        .hmz-cart-bump { animation: hmz-cart-bump 380ms ease-out; }
      `}</style>

      {/* ─── MOBILE ─── */}
      <div className="md:hidden">
        {screen.kind === "home" && <MobileHome />}
        {screen.kind === "category" && <MobileCategoryScreen catId={screen.id} />}
        {screen.kind === "industry" && <MobileIndustryScreen />}

        {/* Subtle cart chip — top-left, soft hairline. Bumps on add. */}
        {cartCount > 0 && !cartOpen && (
          <button
            key={`m-${bumpKey}`}
            onClick={() => setCartOpen(true)}
            className="fixed top-4 left-4 z-40 px-3 py-1.5 rounded-full text-[11.5px] font-medium flex items-center gap-1.5 transition-all hover:scale-[1.03] hmz-cart-bump"
            style={{ backgroundColor: W, color: G, border: `1px solid ${G}18`, boxShadow: `0 2px 10px ${G}14` }}
            aria-label={`Your selection: ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <ShoppingBag size={11} style={{ opacity: 0.7 }} />
            <span style={{ opacity: 0.78 }}>Selection</span>
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
              style={{ backgroundColor: Au, color: W, minWidth: 16, height: 16, padding: "0 5px" }}
            >
              {cartCount}
            </span>
          </button>
        )}

        {/* Bottom sheet */}
        {cartOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setCartOpen(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col"
              style={{ backgroundColor: W, maxHeight: "85vh" }}
            >
              <CartContents />
            </div>
          </>
        )}
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:block">
        <div className={cartCount > 0 ? "lg:pr-[340px] transition-all" : ""}>
          <IndustryPills />
          {industryItems && <IndustryDetail />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {catalog.categories.map((c) => (
              <CategoryCard key={c.id} catId={c.id} />
            ))}
          </div>
        </div>

        {cartCount > 0 && (
          <div
            className="hidden lg:flex flex-col fixed top-[100px] right-6 z-30 rounded-2xl border shadow-xl"
            style={{
              backgroundColor: W,
              borderColor: `${G}14`,
              width: 320,
              maxHeight: "calc(100vh - 120px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            }}
          >
            <CartContents />
          </div>
        )}

        {/* Tablet (md but not lg): floating button + bottom sheet, like mobile */}
        {cartCount > 0 && (
          <div className="md:block lg:hidden">
            {!cartOpen && (
              <button
                key={`t-${bumpKey}`}
                onClick={() => setCartOpen(true)}
                className="fixed top-4 left-4 z-40 px-3 py-1.5 rounded-full text-[11.5px] font-medium flex items-center gap-1.5 transition-all hover:scale-[1.03] hmz-cart-bump"
                style={{ backgroundColor: W, color: G, border: `1px solid ${G}18`, boxShadow: `0 2px 10px ${G}14` }}
                aria-label={`Your selection: ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              >
                <ShoppingBag size={11} style={{ opacity: 0.7 }} />
                <span style={{ opacity: 0.78 }}>Selection</span>
                <span
                  className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
                  style={{ backgroundColor: Au, color: W, minWidth: 16, height: 16, padding: "0 5px" }}
                >
                  {cartCount}
                </span>
              </button>
            )}
            {cartOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setCartOpen(false)} />
                <div
                  className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col mx-auto"
                  style={{ backgroundColor: W, maxHeight: "85vh", maxWidth: 480 }}
                >
                  <CartContents />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Small pill for fee/timeline/need ─────────────────────────── */
function Pill({
  label, value, G, Au, icon,
}: { label: string; value: string; G: string; Au: string; icon?: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ backgroundColor: `${G}06`, border: `1px solid ${G}0A` }}
    >
      <div
        className="flex items-center gap-1 text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5"
        style={{ color: Au }}
      >
        {icon}
        {label}
      </div>
      <div className="text-[11.5px] font-medium leading-snug" style={{ color: G }}>
        {value}
      </div>
    </div>
  );
}

// Suppress unused-import warning for ChevronLeft (kept for future back-arrow polish)
void ChevronLeft;
