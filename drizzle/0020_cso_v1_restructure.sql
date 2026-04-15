-- CSO v1 Restructure — Unified pipeline stages + content creators.
-- Generated manually to match existing migration style.
-- v1 restructure: expand leads.status enum; add content_creators registry.
-- Note: `cohorts` already exists (Skills department) and is reused as-is for the
--   Back Office → Cohorts view. No second cohorts table needed.

-- 1. Expand leads.leadStatus enum for unified pipeline stages.
-- MySQL cannot add values to an existing enum column cleanly — MODIFY COLUMN with the full set.
-- Keeps backwards-compat values (contacted, converted, archived) so existing rows stay valid.
ALTER TABLE `leads` MODIFY COLUMN `leadStatus` enum(
  'new',
  'qualified',
  'proposal_sent',
  'negotiation',
  'onboarding',
  'won',
  'lost',
  'paused',
  'contacted',
  'converted',
  'archived'
) NOT NULL DEFAULT 'new';

-- 2. Expand staffUsers.hamzuryRole enum to add cso_staff (CSO team members other than Lead).
ALTER TABLE `staffUsers` MODIFY COLUMN `staffHamzuryRole` enum(
  'founder','ceo','cso','cso_staff','finance','hr','bizdev','bizdev_staff',
  'media','skills_staff','systemise_head','tech_lead','compliance_staff',
  'security_staff','department_staff'
) NOT NULL;

-- 3. Content creators — affiliate + content partner registry (founder/CSO managed).
CREATE TABLE IF NOT EXISTS `content_creators` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `handle` varchar(255),
  `platform` enum('instagram','tiktok','x','youtube','blog','other') NOT NULL DEFAULT 'other',
  `code` varchar(32) NOT NULL UNIQUE,
  `commissionRate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `joinedAt` timestamp NOT NULL DEFAULT (now()),
  `creatorStatus` enum('active','paused','removed') NOT NULL DEFAULT 'active',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `content_creators_id` PRIMARY KEY(`id`)
);
