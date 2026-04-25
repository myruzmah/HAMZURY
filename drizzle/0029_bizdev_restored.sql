-- BizDev Portal — restore the 4 sections that used localStorage opsStore
-- (campaigns, grants, sponsorships, templates).
-- Adds 4 tables under the "bizdev_*" prefix.
-- Mirrors the section data shapes used by client/src/pages/BizDevPortal.tsx
-- before commit d55bab2 cut them. Field schemas derived from the BizDev
-- Operations Guide (PHASE4_CSO_BIZDEV/BIZDEV/OPERATIONS_GUIDE) — partnership
-- campaign rollout, grant application pipeline, sponsorship workflow,
-- and back-office template library (proposals / outreach scripts).
-- Multi-value JSON columns (stored as text):
--   bizdev_campaigns.channels         → string[]
--   bizdev_grants.requirements        → string[]
--   bizdev_sponsorships.deliverables  → string[]
--   bizdev_templates.tags             → string[]
-- No FKs between these tables (they're independent collections).
-- No server-generated ref pattern — int autoincrement only.

CREATE TABLE `bizdev_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`partner` varchar(255),
	`objective` text,
	`channels` text,
	`startDate` varchar(10),
	`endDate` varchar(10),
	`budget` varchar(80),
	`leadsGenerated` int,
	`conversions` int,
	`bizdevCampaignStatus` enum('Planning','Active','Paused','Completed','Cancelled') NOT NULL DEFAULT 'Planning',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bizdev_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bizdev_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`funder` varchar(255),
	`amount` varchar(80),
	`category` varchar(120),
	`requirements` text,
	`applicationDate` varchar(10),
	`deadline` varchar(10),
	`decisionDate` varchar(10),
	`bizdevGrantStatus` enum('Researching','Drafting','Submitted','Under Review','Awarded','Rejected') NOT NULL DEFAULT 'Researching',
	`outcome` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bizdev_grants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bizdev_sponsorships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sponsor` varchar(255) NOT NULL,
	`event` varchar(255),
	`contact` varchar(255),
	`amount` varchar(80),
	`deliverables` text,
	`pitchDate` varchar(10),
	`closeDate` varchar(10),
	`bizdevSponsorshipStatus` enum('Prospect','Pitched','Negotiating','Closed','Lost','Delivered') NOT NULL DEFAULT 'Prospect',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bizdev_sponsorships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bizdev_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`bizdevTemplateCategory` enum('Proposal','Outreach','Pitch Deck','Follow-up','Contract','Other') NOT NULL DEFAULT 'Other',
	`body` text,
	`tags` text,
	`usageCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bizdev_templates_id` PRIMARY KEY(`id`)
);
