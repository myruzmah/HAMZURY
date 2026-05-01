-- Feature 4 — Upsell Queue: add planning columns to clients.
-- Generated manually to match existing migration style (single ALTER TABLE).
-- MySQL lacks "ADD COLUMN IF NOT EXISTS"; rely on migrator's error-tolerant wrapper.

ALTER TABLE `clients`
  ADD COLUMN `nextActionDate` timestamp NULL,
  ADD COLUMN `upsellNote` text;
