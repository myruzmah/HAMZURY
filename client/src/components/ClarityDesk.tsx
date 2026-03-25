import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { X, Send, Loader2, RotateCcw } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   CLARITY DESK — Pure AI-driven conversational intake
   Nova: sharp, creative Systemise brand advisor
   ═══════════════════════════════════════════════════════════════════════ */

const G     = "#0A1F1C";
const Au    = "#C9A97E";
const CREAM = "#F8F5EE";
const W     = "#FFFFFF";

const SYSTEMISE_WA = "2349130700056";

const APPT_SLOTS = [
  "Monday · 9:00 AM",
  "Monday · 11:00 AM",
  "Monday · 2:00 PM",
  "Tuesday · 9:00 AM",
  "Tuesday · 11:00 AM",
  "Tuesday · 2:00 PM",
  "Wednesday · 9:00 AM",
  "Wednesday · 11:00 AM",
  "Wednesday · 4:00 PM",
  "Thursday · 9:00 AM",
  "Thursday · 2:00 PM",
  "Thursday · 4:00 PM",
  "Friday · 9:00 AM",
  "Friday · 11:00 AM",
];

interface Msg { id: string; role: "bot" | "user"; text: string }
type Phase = "chat" | "contact" | "payment";

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedService?: string | null;
}

export function ClarityDesk({ open, onClose, preselectedService }: Props) {
  const [messages, setMessages]         = useState<Msg[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [phase, setPhase]               = useState<Phase>("chat");
  const [showReadyBtn, setShowReadyBtn] = useState(false);
  const [contactName, setContactName]   = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentDone, setPaymentDone]   = useState(false);
  const [initialized, setInitialized]   = useState(false);
  const [showAppt, setShowAppt]         = useState(false);
  const [apptSlot, setApptSlot]         = useState("");

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const systemiseChat = trpc.systemise.chat.useMutation();
  const confirmPaymentMutation = trpc.systemise.confirmPayment.useMutation();

  const uid = () => `${Date.now()}-${Math.random()}`;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, phase, showReadyBtn]);

  useEffect(() => {
    if (open && !initialized) {
      const greeting = preselectedService
        ? `Hi 👋 I'm Nova, your Systemise advisor. I can see you're interested in ${preselectedService} — before anything, what's your name?`
        : "Hi 👋 I'm Nova, your Systemise advisor. Before we get into anything — what's your name?";
      setMessages([{ id: uid(), role: "bot", text: greeting }]);
      setInitialized(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, initialized, preselectedService]);

  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setMessages([]);
      setInput("");
      setPhase("chat");
      setShowReadyBtn(false);
      setPaymentDone(false);
      setShowAppt(false);
      setApptSlot("");
      setContactName("");
      setContactPhone("");
    }
  }, [open]);

  const addBot = useCallback((text: string) => {
    setMessages(p => [...p, { id: uid(), role: "bot", text }]);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setShowReadyBtn(false);
    setMessages(p => [...p, { id: uid(), role: "user", text }]);
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role === "bot" ? "assistant" as const : "user" as const,
      text: m.text,
    }));

    try {
      const res = await systemiseChat.mutateAsync({ message: text, history });
      let reply = res.reply;

      const hasReady   = reply.includes("[READY]");
      const hasPayment = reply.includes("[SHOW_PAYMENT]");
      reply = reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();

      setLoading(false);
      if (reply) addBot(reply);

      if (hasPayment) {
        setPhase("payment");
      } else if (hasReady) {
        setShowReadyBtn(true);
      }
    } catch {
      setLoading(false);
      addBot("I'm having a moment — please try again or reach us on WhatsApp.");
    }
  }, [messages, loading, systemiseChat, addBot]);

  const submitContact = useCallback(async () => {
    if (!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7) return;
    setPhase("chat");
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role === "bot" ? "assistant" as const : "user" as const,
      text: m.text,
    }));

    try {
      const res = await systemiseChat.mutateAsync({
        message: `[System: Contact collected — Name: ${contactName}, Phone: ${contactPhone}. Please confirm warmly and proceed to payment.]`,
        history,
      });
      let reply = res.reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();
      setLoading(false);
      if (reply) addBot(reply);
      setTimeout(() => setPhase("payment"), 400);
    } catch {
      setLoading(false);
      setPhase("payment");
    }
  }, [contactName, contactPhone, messages, systemiseChat, addBot]);

  const restart = useCallback(() => {
    setMessages([]);
    setPhase("chat");
    setShowReadyBtn(false);
    setPaymentDone(false);
    setContactName("");
    setContactPhone("");
    setInitialized(false);
    setShowAppt(false);
    setApptSlot("");
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(10,31,28,0.65)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full md:max-w-lg md:rounded-2xl overflow-hidden shadow-2xl flex flex-col rounded-t-2xl"
        style={{ height: "90vh", maxHeight: "700px", backgroundColor: CREAM }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ backgroundColor: G }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: Au, color: G }}
          >N</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: W }}>Nova · Systemise Advisor</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-[11px]" style={{ color: Au, opacity: 0.8 }}>Online now</span>
            </div>
          </div>
          <button onClick={restart} className="p-1.5 opacity-60 hover:opacity-100 transition-opacity" title="Restart">
            <RotateCcw size={15} color={W} />
          </button>
          <button onClick={onClose} className="p-1.5 opacity-70 hover:opacity-100 transition-opacity">
            <X size={18} color={W} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  m.role === "user"
                    ? { backgroundColor: G, color: Au, borderBottomRightRadius: 4 }
                    : { backgroundColor: W, color: "#2C2C2C", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ backgroundColor: W, borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: G, opacity: 0.4, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {showReadyBtn && !loading && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => { setShowReadyBtn(false); setPhase("contact"); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: G, color: Au }}
              >
                Get Started →
              </button>
            </div>
          )}

          {phase === "contact" && !showAppt && (
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: W, borderColor: `${G}20` }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: G }}>A few quick details</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>So we can put together your scope and get moving.</p>
              <input
                placeholder="Full name"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-2 outline-none border"
                style={{ borderColor: `${G}25`, backgroundColor: CREAM, color: "#2C2C2C" }}
              />
              <input
                placeholder="WhatsApp number"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitContact()}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none border"
                style={{ borderColor: `${G}25`, backgroundColor: CREAM, color: "#2C2C2C" }}
              />
              <button
                onClick={submitContact}
                disabled={!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 mb-2"
                style={{ backgroundColor: G, color: Au }}
              >
                Get Started →
              </button>
              <button
                onClick={() => setShowAppt(true)}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 border"
                style={{ borderColor: `${G}25`, backgroundColor: "transparent", color: G }}
              >
                Book a Call Instead
              </button>
            </div>
          )}

          {/* Appointment booking */}
          {phase === "contact" && showAppt && (
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: W, borderColor: `${Au}50` }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: G }}>Book a Discovery Call</p>
              <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
                Pick a slot (Mon–Fri, WAT). We'll confirm on WhatsApp within 1 hour.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {APPT_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setApptSlot(slot)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border"
                    style={{
                      backgroundColor: apptSlot === slot ? G : CREAM,
                      color: apptSlot === slot ? Au : "#2C2C2C",
                      borderColor: apptSlot === slot ? G : `${G}20`,
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <a
                href={
                  apptSlot
                    ? `https://wa.me/${SYSTEMISE_WA}?text=${encodeURIComponent(
                        `Hi HAMZURY Systemise, I'd like to book a discovery call on ${apptSlot} WAT. My name is ${contactName || "—"}.`
                      )}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { if (!apptSlot) e.preventDefault(); }}
                className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 mb-2"
                style={{
                  backgroundColor: apptSlot ? G : `${G}40`,
                  color: Au,
                  pointerEvents: apptSlot ? "auto" : "none",
                }}
              >
                {apptSlot ? `Confirm · ${apptSlot} →` : "Select a time above"}
              </a>
              <button
                onClick={() => { setShowAppt(false); setApptSlot(""); }}
                className="w-full py-2 text-xs"
                style={{ color: "#9CA3AF" }}
              >
                ← Back
              </button>
            </div>
          )}

          {phase === "payment" && (
            <div className="rounded-2xl p-4 border-l-4" style={{ backgroundColor: W, borderLeftColor: Au }}>
              <p className="text-sm font-bold mb-0.5" style={{ color: G }}>Make Payment</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>Transfer to get your project started today.</p>
              <div className="rounded-xl p-3 mb-3 space-y-1.5 text-[13px]" style={{ backgroundColor: CREAM }}>
                <div><span style={{ color: "#9CA3AF" }}>Bank</span> · <strong style={{ color: "#1A1A1A" }}>Moniepoint</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Account</span> · <strong className="tracking-widest text-[15px]" style={{ color: "#1A1A1A" }}>8067149356</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Name</span> · <strong style={{ color: "#1A1A1A" }}>BIZDOC CONSULT</strong></div>
              </div>
              {!paymentDone ? (
                <button
                  onClick={async () => {
                    setPaymentDone(true);
                    try {
                      await confirmPaymentMutation.mutateAsync({
                        name: contactName || "Client",
                        phone: contactPhone || "—",
                        service: "Systemise — General",
                      });
                    } catch {
                      // Silent — payment confirmation logged best-effort
                    }
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: G, color: Au }}
                >
                  I've Made the Payment →
                </button>
              ) : (
                <div className="rounded-xl p-3 text-xs space-y-2" style={{ backgroundColor: "#E8F4EC", border: `1px solid ${G}20` }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <strong style={{ color: G }}>Payment received — confirming…</strong>
                  </div>
                  <p style={{ color: "#374151" }}>
                    We'll verify your transfer and assign your project team within 15 minutes during business hours.
                    Work begins the same day.
                  </p>
                </div>
              )}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input bar */}
        {phase === "chat" && (
          <div className="px-3 py-3 flex-shrink-0 border-t" style={{ borderColor: `${G}12`, backgroundColor: W }}>
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2.5"
              style={{ backgroundColor: CREAM, border: `1.5px solid ${G}18` }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Tell me about your business…"
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: "#2C2C2C" }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                style={{ backgroundColor: G }}
              >
                {loading
                  ? <Loader2 size={14} color={Au} className="animate-spin" />
                  : <Send size={13} color={Au} />
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
