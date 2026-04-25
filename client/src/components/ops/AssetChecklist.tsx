import { Check, Circle, ExternalLink, Upload } from "lucide-react";

/**
 * AssetChecklist — shared checklist for asset/deliverable tracking.
 * Used by every ops portal that expects files/assets to arrive from
 * a client or be produced internally.
 *
 *  - Video: raw footage, B-roll, graphics, music, VO, SFX
 *  - Scalar: brand assets, copy, images, logins
 *  - Podcast: interview audio, guest photo, episode art, intro/outro
 *  - Medialy: logos, product shots, testimonials
 *  - Faceless: scripts, VO clips, stock footage, music
 */

export type AssetItem = {
  id: string;
  label: string;
  /** Category tag — eg "Footage", "Audio", "Copy" */
  group?: string;
  /** Arrived/ready or not */
  done: boolean;
  /** Where the asset lives — drive link, WhatsApp, etc. */
  path?: string;
  /** Who owns this asset (client or internal) */
  owner?: string;
  /** Optional hint */
  note?: string;
};

type Props = {
  items: AssetItem[];
  /** Toggle callback — if omitted, checklist is read-only */
  onToggle?: (id: string) => void;
  accent?: string;
  /** Group items by their `group` field */
  grouped?: boolean;
  title?: string;
  hint?: string;
};

const GREEN = "#22C55E";
const DARK = "#1A1A1A";
const MUTED = "#9CA3AF";

export default function AssetChecklist({
  items,
  onToggle,
  accent = GREEN,
  grouped = false,
  title,
  hint,
}: Props) {
  const done = items.filter(i => i.done).length;
  const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  const groups = grouped
    ? items.reduce<Record<string, AssetItem[]>>((acc, it) => {
        const key = it.group || "Other";
        (acc[key] ||= []).push(it);
        return acc;
      }, {})
    : { "": items };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        border: `1px solid rgba(0,0,0,0.06)`,
        overflow: "hidden",
      }}
    >
      {(title || hint) && (
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid rgba(0,0,0,0.06)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            {title && (
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                {title}
              </div>
            )}
            {hint && (
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                {hint}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: accent,
              backgroundColor: `${accent}15`,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {done} / {items.length} · {pct}%
          </div>
        </div>
      )}

      <div style={{ padding: 8 }}>
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <div key={groupName || "all"} style={{ marginBottom: 8 }}>
            {grouped && groupName && (
              <div
                style={{
                  padding: "6px 10px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {groupName}
              </div>
            )}
            {groupItems.map(it => (
              <div
                key={it.id}
                onClick={() => onToggle?.(it.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: onToggle ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => {
                  if (onToggle)
                    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    flexShrink: 0,
                    marginTop: 2,
                    backgroundColor: it.done ? accent : "transparent",
                    border: it.done ? `1.5px solid ${accent}` : `1.5px solid #D1D5DB`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {it.done ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Circle size={8} color="transparent" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: it.done ? MUTED : DARK,
                      fontWeight: it.done ? 400 : 500,
                      textDecoration: it.done ? "line-through" : "none",
                    }}
                  >
                    {it.label}
                  </div>
                  {(it.owner || it.note) && (
                    <div
                      style={{
                        fontSize: 11,
                        color: MUTED,
                        marginTop: 2,
                      }}
                    >
                      {it.owner && <span>👤 {it.owner}</span>}
                      {it.owner && it.note && <span> · </span>}
                      {it.note && <span>{it.note}</span>}
                    </div>
                  )}
                  {it.path && (
                    <a
                      href={it.path}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 11,
                        color: accent,
                        marginTop: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <ExternalLink size={10} />
                      Open
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
