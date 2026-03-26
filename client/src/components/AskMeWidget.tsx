import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, MessageCircle, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

/* ═══════════════════════════════════════════════════════════════════════
   ASK ME WIDGET — universal right-side slide-in chat
   AI conversation + Book a Call / Send a Message actions
   ═══════════════════════════════════════════════════════════════════════ */

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const W     = "#FFFFFF";
const WA    = "2348067149356";

const QUICK_PATHS = [
  { label: "I know what I need", sub: "Get straight to the point" },
  { label: "I need guidance", sub: "Help me figure out where to start" },
  { label: "Schedule a call", sub: "Speak with someone today", action: "calendar" as const },
  { label: "Track my file", sub: "I already have a reference number", action: "track" as const },
];

const SLOTS = [
  { day: "Monday",    times: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { day: "Tuesday",   times: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { day: "Wednesday", times: ["9:00 AM", "11:00 AM", "4:00 PM"] },
  { day: "Thursday",  times: ["9:00 AM", "2:00 PM",  "4:00 PM"] },
  { day: "Friday",    times: ["9:00 AM", "11:00 AM"] },
];

type Msg = { role: "user" | "bot"; text: string };

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AskMeWidget({ open, onClose }: Props) {
  const [messages, setMessages]     = useState<Msg[]>([]);
  const [input, setInput]           = useState("");
  const [mounted, setMounted]       = useState(false);
  const [confirmedQ, setConfirmedQ] = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Slide-in animation ── */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [open]);

  /* ── Reset on close ── */
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      setConfirmedQ(null);
      setLoading(false);
      setShowCalendar(false);
    }
  }, [open]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Auto-focus on open ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 320);
  }, [open]);

  /* ── AI query ── */
  const aiQuery = trpc.ask.answer.useQuery(
    {
      question: confirmedQ || "",
      history: messages.slice(-6).map(m => ({
        role: m.role === "bot" ? "assistant" as const : "user" as const,
        text: m.text,
      })),
    },
    { enabled: !!confirmedQ, retry: false }
  );

  useEffect(() => {
    if (!confirmedQ) return;
    if (aiQuery.data) {
      setMessages(prev => [...prev, { role: "bot", text: aiQuery.data!.answer }]);
      setLoading(false);
      setConfirmedQ(null);
    } else if (aiQuery.isError) {
      setMessages(prev => [...prev, { role: "bot", text: "I'm having a moment. Please try again or reach us on WhatsApp." }]);
      setLoading(false);
      setConfirmedQ(null);
    }
  }, [aiQuery.data, aiQuery.isError, confirmedQ]);

  const send = useCallback((text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    setConfirmedQ(text.trim());
  }, [loading]);

  const firstUserMsg = messages.find(m => m.role === "user")?.text ?? "";
  const showActions  = messages.length > 0 && messages[messages.length - 1].role === "bot" && !loading;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ backgroundColor: "rgba(10,31,28,0.50)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className={`absolute bottom-0 right-0 w-full max-h-[85vh] md:top-0 md:bottom-auto md:max-h-full md:h-full md:w-[430px] flex flex-col shadow-2xl transition-transform duration-300 ease-out rounded-t-2xl md:rounded-none ${mounted ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
        style={{ backgroundColor: CREAM }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ backgroundColor: TEAL }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: GOLD, color: TEAL }}>H</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">HAMZURY Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-[11px]" style={{ color: GOLD, opacity: 0.8 }}>Online now</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 opacity-70 hover:opacity-100 transition-opacity">
            <X size={18} color={W} />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">

          {/* Greeting + quick paths when empty */}
          {messages.length === 0 && !loading && !showCalendar && (
            <>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-[88%]"
                style={{ backgroundColor: W, color: "#2C2C2C", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                Most businesses we meet are stuck somewhere between growth and chaos. Compliance gaps, no systems, teams that can't scale.
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-[88%]"
                style={{ backgroundColor: W, color: "#2C2C2C", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                That is exactly why we exist. To get you positioned, protected, and moving. Where would you like to start?
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {QUICK_PATHS.map(p => (
                  <button key={p.label}
                    onClick={() => {
                      if (p.action === "calendar") { setShowCalendar(true); return; }
                      if (p.action === "track") { onClose(); window.location.href = "/#track"; return; }
                      send(p.label === "I know what I need" ? "I know what I need. Show me the services." : "I need guidance. Help me figure out where to start.");
                    }}
                    className="text-left px-4 py-3 rounded-xl border transition-all hover:shadow-sm active:scale-[0.98]"
                    style={{ backgroundColor: W, borderColor: `${GOLD}30`, color: TEAL }}>
                    <span className="text-[13px] font-semibold block">{p.label}</span>
                    <span className="text-[11px] opacity-45 block mt-0.5">{p.sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {showCalendar && (
            <div className="rounded-2xl overflow-hidden border mt-2" style={{ backgroundColor: W, borderColor: `${GOLD}30` }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: `${TEAL}10`, backgroundColor: TEAL }}>
                <p className="text-sm font-semibold text-white">Choose a time slot</p>
                <button onClick={() => setShowCalendar(false)} className="opacity-60 hover:opacity-100"><X size={16} color={W} /></button>
              </div>
              <div className="divide-y" style={{ borderColor: `${TEAL}08` }}>
                {SLOTS.map(slot => (
                  <div key={slot.day} className="px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: TEAL, opacity: 0.5 }}>{slot.day}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.times.map(t => (
                        <a key={t}
                          href={`https://wa.me/2348067149356?text=${encodeURIComponent(`Hi, I'd like to book an appointment on ${slot.day} at ${t}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all hover:shadow-sm"
                          style={{ borderColor: `${GOLD}40`, color: TEAL, backgroundColor: `${GOLD}15` }}>
                          {t}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t text-center" style={{ borderColor: `${TEAL}08` }}>
                <p className="text-[11px] opacity-40" style={{ color: TEAL }}>All times are WAT (West Africa Time)</p>
              </div>
            </div>
          )}

          {/* Conversation thread */}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === "user"
                  ? { backgroundColor: TEAL, color: W, borderBottomRightRadius: 4 }
                  : { backgroundColor: W, color: "#2C2C2C", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1 items-center"
                style={{ backgroundColor: W, borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: TEAL, opacity: 0.3, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons after each bot reply */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi, I'd like to book a call with HAMZURY")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[12px] font-semibold transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: TEAL, color: GOLD }}>
                <Calendar size={14} />
                Book a Call
              </a>
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi, I have a question: " + firstUserMsg)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[12px] font-semibold transition-all hover:-translate-y-0.5 border"
                style={{ backgroundColor: W, color: TEAL, borderColor: `${TEAL}20` }}>
                <MessageCircle size={14} />
                Send Message
              </a>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ── Input ── */}
        <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: `${TEAL}12`, backgroundColor: W }}>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 border transition-shadow focus-within:shadow-sm"
            style={{ borderColor: `${TEAL}20`, backgroundColor: CREAM }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(input); }}
              placeholder="Ask anything…"
              className="flex-1 text-[14px] outline-none bg-transparent"
              style={{ color: "#2C2C2C" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="transition-opacity disabled:opacity-30"
              style={{ color: TEAL }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
