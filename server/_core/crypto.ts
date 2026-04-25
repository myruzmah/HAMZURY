/**
 * Server-side symmetric encryption for sensitive at-rest fields
 * (currently: founder vault account secrets + recovery answers).
 *
 * Key source: VAULT_ENCRYPTION_KEY env var — must be 32 bytes hex (64 chars).
 * Generate one with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Output format: "v1:<iv hex>:<authTag hex>:<ciphertext hex>"
 * - v1 = format version, lets us rotate algorithms later without data loss.
 * - AES-256-GCM provides confidentiality + integrity.
 *
 * Fail-closed: if no key is configured, encrypt/decrypt throw.
 * We never silently store plaintext — that would defeat the purpose.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32; // bytes
const IV_LEN = 12;  // GCM standard

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const hex = process.env.VAULT_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY env var is required for encrypted fields. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== KEY_LEN) {
    throw new Error(`VAULT_ENCRYPTION_KEY must be ${KEY_LEN} bytes hex (${KEY_LEN * 2} chars). Got ${buf.length} bytes.`);
  }
  cachedKey = buf;
  return buf;
}

/** Encrypt a UTF-8 string. Returns versioned blob safe for DB storage. */
export function encryptString(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

/** Decrypt a versioned blob produced by encryptString. */
export function decryptString(blob: string): string {
  if (!blob) return "";
  // Backwards-compat: if value isn't a v1 blob, return as-is. This lets
  // pre-migration / dev rows display rather than crash. Production will
  // never produce non-v1 values via the writer paths.
  if (!blob.startsWith("v1:")) return blob;
  const [, ivHex, tagHex, dataHex] = blob.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Malformed encrypted blob");
  }
  const key = getKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Best-effort check used at boot time — log a clear error if key is missing. */
export function vaultKeyConfigured(): boolean {
  const hex = process.env.VAULT_ENCRYPTION_KEY;
  if (!hex) return false;
  try {
    return Buffer.from(hex, "hex").length === KEY_LEN;
  } catch {
    return false;
  }
}
