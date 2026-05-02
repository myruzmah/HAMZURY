// Storage helpers — primary path is the Biz-provided proxy (forge), but
// when those credentials aren't configured (e.g. self-hosted Railway) we
// fall back to writing the file to local disk under `./uploads/` and
// serving it back via the static `/uploads` route mounted in server/_core/index.ts.

import { ENV } from './_core/env';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

type StorageConfig = { baseUrl: string; apiKey: string } | null;

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) return null;        // signal: use disk fallback
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/** Local-disk fallback. Writes the file to `./uploads/<key>` and returns
 *  a URL like `/uploads/<key>` that the static route in server/_core
 *  serves. Robust even on Railway (volume persists across deploys for
 *  the lifetime of the service). For real CDN-backed prod use, set the
 *  forge env vars and the proxy path runs instead. */
async function storagePutDisk(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  // CWD is the project root in dev; in the bundled prod runtime it's
  // wherever Railway sets it. Either way, ./uploads is sibling to dist/.
  const uploadsRoot = process.env.LOCAL_UPLOADS_DIR || join(process.cwd(), "uploads");
  const fullPath = join(uploadsRoot, key);
  await mkdir(dirname(fullPath), { recursive: true });
  const buf = typeof data === "string" ? Buffer.from(data) : Buffer.from(data as any);
  await writeFile(fullPath, buf);
  void contentType;
  // Public URL — assumes the static route is mounted at /uploads.
  return { key, url: `/uploads/${key}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const cfg = getStorageConfig();

  // No forge credentials → use disk fallback.
  if (!cfg) return storagePutDisk(key, data, contentType);

  const { baseUrl, apiKey } = cfg;
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: buildAuthHeaders(apiKey),
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      console.warn(`[storage] forge upload failed (${response.status}) — falling back to disk: ${message}`);
      return storagePutDisk(key, data, contentType);
    }
    const url = (await response.json()).url;
    return { key, url };
  } catch (err) {
    console.warn(`[storage] forge upload threw — falling back to disk:`, err);
    return storagePutDisk(key, data, contentType);
  }
}
