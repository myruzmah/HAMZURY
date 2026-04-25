-- Faceless Ops Portal — migrate localStorage opsStore ("faceless") to real DB
-- Adds 7 tables under the "faceless_*" prefix.
-- Mirrors client/src/pages/FacelessOpsPortal.tsx data shapes.
-- Children FK on int parent ids (no formal FK constraints; cascade in app code):
--   faceless_scripts.contentId    → faceless_content.id (nullable)
--   faceless_voiceovers.scriptId  → faceless_scripts.id (nullable)
--   faceless_production.contentId → faceless_content.id (nullable)
-- Multi-value JSON columns (stored as text):
--   faceless_production.assetSources → string[]
--   faceless_distribution.tags        → string[]
-- The 8th source collection ("templates") is kept as a hardcoded TS const
-- in the client portal (product copy, not user data) — no DB table.
-- No server-generated ref pattern — entries are int-id only.

CREATE TABLE `faceless_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(255) NOT NULL,
	`niche` varchar(120),
	`client` varchar(255) NOT NULL,
	`channel` varchar(255) NOT NULL,
	`format` varchar(120),
	`publishDate` varchar(10),
	`facelessContentStatus` enum('Idea','Scripting','Voiceover','Editing','Scheduled','Published') NOT NULL DEFAULT 'Idea',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`contentId` int,
	`hook` text NOT NULL,
	`body` text,
	`cta` text,
	`aiPrompt` text,
	`wordCount` int,
	`facelessScriptApproval` enum('Draft','In Review','Approved','Revise') NOT NULL DEFAULT 'Draft',
	`reviewer` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_scripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_voiceovers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scriptTitle` varchar(255) NOT NULL,
	`scriptId` int,
	`facelessVoTool` enum('ElevenLabs','Murf','Play.ht','Speechify','Other') NOT NULL DEFAULT 'ElevenLabs',
	`voice` varchar(255) NOT NULL,
	`speed` varchar(60),
	`audioPath` varchar(1024),
	`facelessVoStatus` enum('Queued','Generating','Needs QC','Approved','Rejected') NOT NULL DEFAULT 'Queued',
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_voiceovers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_production` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoTitle` varchar(255) NOT NULL,
	`contentId` int,
	`facelessProdPath` enum('Manual','AI-Assisted') NOT NULL DEFAULT 'Manual',
	`assetSources` text,
	`assetsReady` boolean NOT NULL DEFAULT false,
	`voFileReady` boolean NOT NULL DEFAULT false,
	`facelessProdEditStatus` enum('Not Started','Rough Cut','Polishing','QC','Exported') NOT NULL DEFAULT 'Not Started',
	`exportPath` varchar(1024),
	`duration` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_production_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facelessChannelKind` enum('YouTube Channel','Social Package','Bulk Package') NOT NULL DEFAULT 'Social Package',
	`name` varchar(255) NOT NULL,
	`client` varchar(255) NOT NULL,
	`niche` varchar(120),
	`tier` varchar(120),
	`priceNGN` int,
	`monthlyQuota` int,
	`delivered` int,
	`facelessChannelStatus` enum('Onboarding','Active','Paused','Completed') NOT NULL DEFAULT 'Onboarding',
	`startedAt` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_distribution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoTitle` varchar(255) NOT NULL,
	`facelessDistPlatform` enum('YouTube','YouTube Shorts','TikTok','Instagram Reels','Instagram','Facebook') NOT NULL DEFAULT 'YouTube',
	`thumbnailUrl` varchar(1024),
	`tags` text,
	`scheduleAt` varchar(32),
	`publishedAt` varchar(32),
	`facelessDistStatus` enum('Scheduled','Published','Draft','Failed') NOT NULL DEFAULT 'Draft',
	`channelName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_distribution_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faceless_tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`facelessToolCategory` enum('Voice','Script','Video','Image','Stock','Music','Editing','Captions','Scheduler') NOT NULL DEFAULT 'Voice',
	`monthlyNGN` int NOT NULL DEFAULT 0,
	`seats` int,
	`renewsOn` varchar(10),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faceless_tools_id` PRIMARY KEY(`id`)
);
