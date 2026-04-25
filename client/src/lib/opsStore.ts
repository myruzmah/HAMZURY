/**
 * opsStore — tiny typed localStorage wrapper for the v1 ops portals.
 *
 * Every ops portal that doesn't yet have a backend table uses this for
 * CRUD. Keys are prefixed `hamzury.v1.<portal>.<collection>` so we can
 * migrate to real tRPC backends later without breaking clients.
 *
 * All operations are synchronous, same-tab. Good enough for the
 * founder-approved v1 rollout — swap for `trpc` when schema lands.
 */

const PREFIX = "hamzury.v1";

export type OpsItem = {
  id: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: any;
};

function fullKey(portal: string, collection: string) {
  return `${PREFIX}.${portal}.${collection}`;
}

/** Read all items in a collection — returns [] if empty or invalid. */
export function readAll<T extends OpsItem = OpsItem>(
  portal: string,
  collection: string
): T[] {
  try {
    const raw = localStorage.getItem(fullKey(portal, collection));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Overwrite the whole collection. */
export function writeAll<T extends OpsItem = OpsItem>(
  portal: string,
  collection: string,
  items: T[]
): void {
  try {
    localStorage.setItem(fullKey(portal, collection), JSON.stringify(items));
  } catch (err) {
    console.error("opsStore.writeAll failed:", err);
  }
}

/** Insert one item. Returns the inserted record with id + timestamps. */
export function insert<T extends OpsItem = OpsItem>(
  portal: string,
  collection: string,
  item: Omit<T, "id" | "createdAt" | "updatedAt"> & Partial<OpsItem>
): T {
  const all = readAll<T>(portal, collection);
  const now = Date.now();
  const record = {
    id: item.id ?? cryptoId(),
    createdAt: now,
    updatedAt: now,
    ...item,
  } as T;
  all.push(record);
  writeAll(portal, collection, all);
  return record;
}

/** Update one by id. Returns updated record or null if not found. */
export function update<T extends OpsItem = OpsItem>(
  portal: string,
  collection: string,
  id: string,
  patch: Partial<T>
): T | null {
  const all = readAll<T>(portal, collection);
  const idx = all.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const next = { ...all[idx], ...patch, updatedAt: Date.now() } as T;
  all[idx] = next;
  writeAll(portal, collection, all);
  return next;
}

/** Remove by id. */
export function remove(portal: string, collection: string, id: string): void {
  const all = readAll(portal, collection);
  writeAll(portal, collection, all.filter(r => r.id !== id));
}

/** Fetch by id. */
export function getById<T extends OpsItem = OpsItem>(
  portal: string,
  collection: string,
  id: string
): T | null {
  return (readAll<T>(portal, collection).find(r => r.id === id) as T) ?? null;
}

/** Short random id (browser-safe). */
export function cryptoId(): string {
  const hasCrypto = typeof crypto !== "undefined" && !!crypto.getRandomValues;
  if (hasCrypto) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    return Array.from(buf, b => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2, 14);
}

/** Clear one collection (for dev / reset). */
export function clearCollection(portal: string, collection: string): void {
  localStorage.removeItem(fullKey(portal, collection));
}

/** Simple "reactive" read — bump this to force component re-read. */
export function touch(portal: string, collection: string) {
  try {
    window.dispatchEvent(
      new CustomEvent("opsStoreChange", {
        detail: { portal, collection, at: Date.now() },
      })
    );
  } catch {
    /* ignore */
  }
}
