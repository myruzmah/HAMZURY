const AFFILIATE_KEY = "hamzury-affiliate-session";
const TTL = 8 * 60 * 60 * 1000; // 8 hours

export interface AffiliateSession {
  id: number;
  code: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  totalEarnings?: string | null;
  pendingBalance?: string | null;
  paidBalance?: string | null;
  expiresAt?: number;
}

export function saveAffiliateSession(data: Record<string, unknown>) {
  localStorage.setItem(AFFILIATE_KEY, JSON.stringify({ data, expiresAt: Date.now() + TTL }));
}

export function getAffiliateSession(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(AFFILIATE_KEY);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function loadAffiliateSession(): AffiliateSession | null {
  const data = getAffiliateSession();
  if (!data || !data.id) return null;
  return data as unknown as AffiliateSession;
}

export function clearAffiliateSession() {
  localStorage.removeItem(AFFILIATE_KEY);
}

export async function tryAffiliateCookieSession(): Promise<AffiliateSession | null> {
  try {
    const res = await fetch("/api/affiliate/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.id) return null;
    // Mirror the localStorage structure so consumers work identically
    const session: AffiliateSession = {
      id: data.id,
      name: data.name,
      email: data.email,
      code: data.code,
      status: "active",
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };
    return session;
  } catch {
    return null;
  }
}
