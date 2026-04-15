-- CSO Portal Phase 2 — Targets, Calendar Events, Client Notes
-- Generated manually to match existing migration style.

CREATE TABLE IF NOT EXISTS `targets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `assignedBy` varchar(100) NOT NULL,
  `assignedByName` varchar(255),
  `assignedTo` varchar(100) NOT NULL,
  `targetPeriod` enum('month','quarter','year') NOT NULL,
  `periodStart` varchar(10) NOT NULL,
  `periodEnd` varchar(10) NOT NULL,
  `targetMetric` enum('leads_qualified','proposals_sent','clients_onboarded','revenue_closed','custom') NOT NULL,
  `targetValue` decimal(14,2) NOT NULL,
  `notes` text,
  `targetStatusV2` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `targets_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `startAt` timestamp NOT NULL,
  `endAt` timestamp NULL,
  `allDay` boolean NOT NULL DEFAULT false,
  `eventType` enum('meeting','follow_up','deadline','renewal','internal','other') NOT NULL DEFAULT 'other',
  `ownerId` varchar(100) NOT NULL,
  `ownerName` varchar(255),
  `eventVisibility` enum('private','team','public') NOT NULL DEFAULT 'team',
  `clientId` int,
  `leadId` int,
  `location` text,
  `reminderMinutes` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `client_notes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `clientId` int NOT NULL,
  `authorId` varchar(100) NOT NULL,
  `authorName` varchar(255),
  `clientNoteKind` enum('internal','ceo_brief','client_update','risk_flag') NOT NULL DEFAULT 'internal',
  `body` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `client_notes_id` PRIMARY KEY(`id`)
);

-- Extend tasks with assignedBy so audit & analytics can attribute assignments.
-- MySQL lacks "ADD COLUMN IF NOT EXISTS"; rely on migrator's error-tolerant wrapper.
ALTER TABLE `tasks` ADD COLUMN `assignedBy` varchar(100);
