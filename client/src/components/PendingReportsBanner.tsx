import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ClipboardList, X, Send } from "lucide-react";
import { toast } from "sonner";

/**
 * Top-of-portal banner shown to department staff when the founder has open
 * report requests pointed at their department. Tap to open a modal that lists
 * each pending request with a textarea for replying. Banner can be dismissed
 * for the session (re-appears on reload until requests are answered).
 */

const GOLD = "#B48C4C";
const AMBER = "#F59E0B";
const DARK = "#1A1A1A";
const MUTED = "#6B6B6B";
const WHITE = "#FFFFFF";
const BG = "#FFFAF6";
const SUCCESS = "#22C55E";

type PendingRow = {
  id: number;
  subject: string;
  targetDept: string;
  notes?: string | null;
  createdAt: Date | string;
};

export default function PendingReportsBanner() {
  const utils = trpc.useUtils();
  const q = trpc.reports.pendingForMyDept.useQuery(undefined, {
    // Don't spam errors when role can't respond — empty array is the standard.
    retry: false,
  });
  const rows = ((q.data || []) as PendingRow[]);

  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (q.isLoading) return null;
  if (!rows.length) return null;
  if (dismissed) return null;

  return (
    <>
      <div
        role="button"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, maxWidth: "min(560px, calc(100% - 24px))", width: "100%",
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          backgroundColor: `${AMBER}F5`,
          border: `1px solid ${AMBER}`,
          borderLeft: `3px solid #B45309`,
          borderRadius: 10,
          cursor: "pointer",
          fontSize: 13,
          color: WHITE,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        }}
      >
        <ClipboardList size={16} style={{ color: WHITE, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700 }}>Founder requested {rows.length} report{rows.length === 1 ? "" : "s"}</span>
          <span style={{ marginLeft: 6, opacity: 0.92 }}>— tap to respond</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          aria-label="Dismiss for now"
          style={{
            border: "none", background: "transparent", cursor: "pointer", color: WHITE,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 4, borderRadius: 6, opacity: 0.85,
          }}
          title="Dismiss for this session"
        >
          <X size={14} />
        </button>
      </div>

      {open && (
        <RespondModal
          rows={rows}
          onClose={() => setOpen(false)}
          onResponded={() => {
            utils.reports.pendingForMyDept.invalidate();
          }}
        />
      )}
    </>
  );
}

function RespondModal({
  rows, onClose, onResponded,
}: {
  rows: PendingRow[];
  onClose: () => void;
  onResponded: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto",
          backgroundColor: WHITE, borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${DARK}10`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, backgroundColor: WHITE, zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase" }}>
              Founder Reports
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginTop: 2 }}>
              {rows.length} pending request{rows.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none", background: "transparent", cursor: "pointer", color: MUTED,
              padding: 6, borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <RespondCard key={r.id} row={r} onResponded={onResponded} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RespondCard({
  row, onResponded,
}: {
  row: PendingRow;
  onResponded: () => void;
}) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const respond = trpc.reports.respond.useMutation({
    onSuccess: () => {
      toast.success("Response sent to founder");
      setDone(true);
      onResponded();
    },
    onError: (err) => toast.error(err.message || "Failed to send response"),
  });

  const send = () => {
    const t = text.trim();
    if (!t) return toast.error("Response cannot be empty");
    if (t.length > 8000) return toast.error("Response must be 8000 chars or fewer");
    respond.mutate({ id: row.id, response: t });
  };

  if (done) {
    return (
      <div style={{
        padding: "12px 14px", backgroundColor: `${SUCCESS}10`,
        border: `1px solid ${SUCCESS}30`, borderRadius: 10,
        fontSize: 12, color: DARK,
      }}>
        Sent — request #{row.id} ({row.subject})
      </div>
    );
  }

  return (
    <div style={{
      padding: "12px 14px", backgroundColor: BG, border: `1px solid ${DARK}10`,
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 4 }}>
        #{row.id} · {row.subject}
      </div>
      {row.notes && (
        <div style={{ fontSize: 12, color: DARK, whiteSpace: "pre-wrap", lineHeight: 1.5, marginBottom: 8, opacity: 0.85 }}>
          {row.notes}
        </div>
      )}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your response to the founder…"
        rows={4}
        maxLength={8000}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
          backgroundColor: WHITE, outline: "none",
          fontFamily: "inherit", resize: "vertical", minHeight: 80,
        }}
      />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={send}
          disabled={respond.isPending}
          style={{
            padding: "8px 14px", backgroundColor: GOLD, color: WHITE,
            border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: respond.isPending ? "wait" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            opacity: respond.isPending ? 0.65 : 1,
          }}>
          <Send size={12} /> {respond.isPending ? "Sending…" : "Send Response"}
        </button>
      </div>
    </div>
  );
}
