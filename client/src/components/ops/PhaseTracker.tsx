import { useMemo } from "react";
import { ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";

/**
 * PhaseTracker — shared horizontal phase/kanban visualiser.
 *
 * Used by every ops portal that tracks a project through stages:
 *  - Scalar (websites/apps/automation project phases)
 *  - Medialy (content creation → approval → scheduled → posted)
 *  - Podcast (research → script → record → edit → publish)
 *  - Video (pre → production → post → delivery)
 *  - Faceless (script → VO → video → distribute)
 *  - Client dashboard
 *
 * Props:
 *  - phases: ordered list, each with id + label
 *  - currentPhaseId: which phase is "active" (filled up to + including)
 *  - onSelect?: click callback for drilldown
 *  - selectedId?: which phase is currently expanded (for detail view)
 *  - counts?: map of phaseId -> count (eg "3" under "In Editing")
 *  - accent?: override colour for the filled portion
 */

export type Phase = {
  id: string;
  label: string;
  /** Optional hint under label */
  hint?: string;
};

type Props = {
  phases: Phase[];
  currentPhaseId?: string;
  selectedId?: string | null;
  onSelect?: (phaseId: string) => void;
  counts?: Record<string, number>;
  accent?: string;
  /** Compact mode — smaller circles for section headers */
  compact?: boolean;
  /** Label shown in top-left (eg "Project Phase") */
  label?: string;
};

const GREEN = "#22C55E";
const MUTED = "#9CA3AF";
const DARK = "#1A1A1A";

export default function PhaseTracker({
  phases,
  currentPhaseId,
  selectedId,
  onSelect,
  counts,
  accent = GREEN,
  compact = false,
  label,
}: Props) {
  const currentIndex = useMemo(() => {
    if (!currentPhaseId) return -1;
    return phases.findIndex(p => p.id === currentPhaseId);
  }, [phases, currentPhaseId]);

  const circleSize = compact ? 20 : 28;
  const lineThickness = compact ? 2 : 3;

  const pct =
    phases.length <= 1
      ? 100
      : Math.max(0, Math.min(100, (currentIndex / (phases.length - 1)) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 12 }}>
      {label && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: MUTED,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span>{label}</span>
          {currentIndex >= 0 && (
            <span style={{ color: accent }}>
              {currentIndex + 1} of {phases.length} ({Math.round(pct)}%)
            </span>
          )}
        </div>
      )}

      <div style={{ position: "relative", padding: `${circleSize / 2 + 2}px 0` }}>
        {/* Background line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: circleSize / 2,
            right: circleSize / 2,
            height: lineThickness,
            backgroundColor: "#E5E7EB",
            transform: "translateY(-50%)",
            borderRadius: lineThickness,
          }}
        />
        {/* Progress line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: circleSize / 2,
            width: `calc(${pct}% - ${circleSize / 2}px)`,
            height: lineThickness,
            backgroundColor: accent,
            transform: "translateY(-50%)",
            borderRadius: lineThickness,
            transition: "width 0.4s ease",
          }}
        />

        {/* Circles */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {phases.map((p, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const pending = i > currentIndex;
            const isSelected = selectedId === p.id;
            const count = counts?.[p.id];

            const circleBg = done || active ? accent : "#FFFFFF";
            const circleBorder = done || active ? accent : "#D1D5DB";
            const iconColor = done || active ? "#FFFFFF" : MUTED;

            return (
              <button
                key={p.id}
                onClick={() => onSelect?.(p.id)}
                title={p.label}
                style={{
                  position: "relative",
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  border: "none",
                  background: "transparent",
                  cursor: onSelect ? "pointer" : "default",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: "50%",
                    backgroundColor: circleBg,
                    border: `${lineThickness}px solid ${circleBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected ? `0 0 0 3px ${accent}35` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={circleSize * 0.55} color={iconColor} />
                  ) : active ? (
                    <Clock size={circleSize * 0.5} color={iconColor} />
                  ) : (
                    <Circle size={circleSize * 0.35} color={iconColor} />
                  )}
                </div>
                {!compact && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 700 : 500,
                      color: pending ? MUTED : DARK,
                      maxWidth: 90,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.label}
                    {typeof count === "number" && count > 0 && (
                      <div
                        style={{
                          fontSize: 9,
                          color: accent,
                          fontWeight: 700,
                          marginTop: 1,
                        }}
                      >
                        {count}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * KanbanLane — vertical list of cards for one phase.
 * Use alongside PhaseTracker when user clicks a circle.
 */
export function KanbanLane<T>({
  items,
  title,
  count,
  accent = GREEN,
  renderItem,
  emptyHint = "Nothing here yet.",
}: {
  items: T[];
  title: string;
  count?: number;
  accent?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyHint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{title}</div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            backgroundColor: `${accent}15`,
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {count ?? items.length}
        </div>
      </div>
      {items.length === 0 ? (
        <div
          style={{
            padding: "14px 12px",
            border: `1px dashed #E5E7EB`,
            borderRadius: 10,
            fontSize: 12,
            color: MUTED,
            textAlign: "center",
          }}
        >
          {emptyHint}
        </div>
      ) : (
        items.map((item, i) => <div key={i}>{renderItem(item, i)}</div>)
      )}
    </div>
  );
}

export function PhaseCard({
  title,
  meta,
  accent = GREEN,
  onClick,
  children,
}: {
  title: string;
  meta?: string;
  accent?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        border: `1px solid rgba(0,0,0,0.06)`,
        borderLeft: `3px solid ${accent}`,
        padding: 12,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        if (onClick) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: children ? 6 : 0,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: DARK, flex: 1 }}>
          {title}
        </div>
        {onClick && <ChevronRight size={14} color={MUTED} />}
      </div>
      {meta && (
        <div style={{ fontSize: 11, color: MUTED, marginBottom: children ? 6 : 0 }}>
          {meta}
        </div>
      )}
      {children}
    </div>
  );
}
