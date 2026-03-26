import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// 32-byte key for AES-256. Set CREDENTIALS_KEY in .env (32+ chars).
// Dev fallback is intentionally not production-safe.
const RAW_KEY = process.env.CREDENTIALS_KEY ?? "hamzury-dev-cred-key-32chars!!!";
const KEY = Buffer.from(RAW_KEY.padEnd(32).slice(0, 32), "utf8");

export function encryptCredential(plaintext: string): { encrypted: string; iv: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString("hex"),
  };
}

export function decryptCredential(encrypted: string, iv: string): string {
  const [encData, authTagHex] = encrypted.split(":");
  if (!encData || !authTagHex) throw new Error("Invalid encrypted format");
  const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function maskPassword(length: number): string {
  return "•".repeat(Math.max(8, length));
}
