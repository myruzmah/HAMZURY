import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  LogOut, ArrowLeft, Menu, X, Shield,
} from "lucide-react";
import PageMeta from "@/components/PageMeta";

/**
 * OpsShell — the standard sidebar + mobile-drawer shell every internal
 * HAMZURY portal wraps its tabs in. Pulled out of BizdocOpsPortal /
 * CSOPortal / CEOPortal so the six new ops portals share one look.
 */

type Props = {
  title: string;
  subtitle?: string;
  brand: { name: string; accent: string; bg: string };
  /** Sidebar nav items */
  nav: { key: string; label: string; icon: React.ElementType }[];
  active: string;
  onChange: (k: string) => void;
  /** Logo text shown at top of sidebar */
  logoSmall: string;
  logoLarge: string;
  /** Logged-in user name shown in header */
  userName?: string;
  /** Role label pill */
  roleLabel?: string;
  /** Optional logout handler */
  onLogout?: () => void;
  /** Meta page title */
  pageTitle?: string;
  /** Main children (section content) */
  children: React.ReactNode;
};

const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";

export default function OpsShell({
  title,
  subtitle,
  brand,
  nav,
  active,
  onChange,
  logoSmall,
  logoLarge,
  userName,
  roleLabel = "ROLE-GATED",
  onLogout,
  pageTitle,
  children,
}: Props) {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeLabel = nav.find(n => n.key === active)?.label || "";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: BG,
        position: "relative",
      }}
    >
      <PageMeta title={pageTitle || `${title} — HAMZURY`} description={subtitle} />

      {isMobile && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 232,
          backgroundColor: brand.bg,
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${brand.accent}20`,
          ...(isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease",
                boxShadow: mobileNavOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
              }
            : {}),
        }}
      >
        <div
          style={{
            padding: "20px 18px",
            borderBottom: `1px solid ${brand.accent}15`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: brand.accent,
                letterSpacing: "0.12em",
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {logoSmall}
            </div>
            <div
              style={{
                fontSize: 15,
                color: WHITE,
                fontWeight: 600,
                letterSpacing: -0.1,
              }}
            >
              {logoLarge}
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: `${brand.accent}15`,
                color: brand.accent,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {nav.map(({ key, icon: Icon, label }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onChange(key);
                  if (isMobile) setMobileNavOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  marginBottom: 2,
                  borderRadius: 10,
                  backgroundColor: isActive ? `${brand.accent}20` : "transparent",
                  color: isActive ? brand.accent : `${brand.accent}70`,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s",
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: `1px solid ${brand.accent}15` }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 10,
              color: `${brand.accent}60`,
              fontSize: 12,
              textDecoration: "none",
              marginBottom: 2,
            }}
          >
            <ArrowLeft size={13} /> Back to HAMZURY
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 10,
                color: `${brand.accent}60`,
                backgroundColor: "transparent",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: isMobile ? "100%" : "auto",
        }}
      >
        <header
          style={{
            padding: isMobile ? "12px 16px" : "14px 28px",
            backgroundColor: WHITE,
            borderBottom: `1px solid ${DARK}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
              flex: 1,
            }}
          >
            {isMobile && (
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${brand.bg}08`,
                  color: brand.bg,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Menu size={18} />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {activeLabel}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: DARK,
                  fontWeight: 500,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName ? `${userName} · ${title}` : title}
              </p>
            </div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 12,
              fontSize: 10,
              backgroundColor: `${brand.bg}10`,
              color: brand.bg,
              fontWeight: 600,
              letterSpacing: "0.04em",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <Shield
              size={10}
              style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
            />
            {roleLabel}
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div
            style={{
              padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Common card wrapper used inside every section */
export function OpsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${DARK}08`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** KPI tile */
export function OpsKpi({
  label,
  value,
  sub,
  accent = GOLD,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: WHITE,
        borderRadius: 14,
        padding: 16,
        border: `1px solid ${DARK}08`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: MUTED,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginTop: 4 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent, marginTop: 4, fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** Section heading */
export function OpsHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: DARK, margin: 0 }}>
          {title}
        </h1>
        {sub && (
          <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0" }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}
