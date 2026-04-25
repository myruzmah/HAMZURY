-- Medialy Ops Portal — migrate localStorage opsStore ("medialy") to real DB
-- Adds 7 tables under the "medialy_*" prefix.
-- Mirrors client/src/pages/MedialyOpsPortal.tsx data shapes.
-- Distinct from existing `clients` table (CRM lead pipeline) — Medialy clients
-- are tier-based retainers with monthly fee + posts quota, kept in
-- `medialy_clients`. Distinct from existing `socialPlatformStats` table —
-- Medialy performance is client-scoped weekly/monthly entries.
-- Children FK on int parent ids (`clientId`). No formal FK constraints
-- (matches schema convention; cascade in app code).
-- The `platforms` column on `medialy_clients` stores a JSON-stringified
-- Platform[] to preserve the array shape without a child table.
-- `medialy_approvals.ref` is server-generated (CNT-NNN), unique.
-- `medialy_tasks.ref`     is server-generated (TSK-NNN), unique.

CREATE TABLE `medialy_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`brand` varchar(255),
	`medialyClientTier` enum('Setup','Manage','Accelerate','Authority') NOT NULL DEFAULT 'Manage',
	`monthlyFee` int NOT NULL DEFAULT 0,
	`platforms` text,
	`postsPerMonth` int NOT NULL DEFAULT 0,
	`postsRemaining` int NOT NULL DEFAULT 0,
	`medialyClientPayStatus` enum('Paid','Due','Overdue') NOT NULL DEFAULT 'Paid',
	`nextPaymentDue` varchar(10),
	`satisfaction` int NOT NULL DEFAULT 5,
	`startedAt` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medialy_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`medialyContentPlatform` enum('Instagram','TikTok','Facebook','LinkedIn','Twitter','YouTube') NOT NULL DEFAULT 'Instagram',
	`medialyContentType` enum('Feed','Reel','Story','Carousel','Flyer','Video') NOT NULL DEFAULT 'Feed',
	`caption` text,
	`hashtags` text,
	`assetLink` varchar(1024),
	`medialyContentStatus` enum('Draft','Review','Approved','Scheduled','Posted') NOT NULL DEFAULT 'Draft',
	`postTime` varchar(10),
	`medialyContentAssignee` enum('Hikma','Ahmad','Salis') NOT NULL DEFAULT 'Ahmad',
	`likes` int,
	`comments` int,
	`shares` int,
	`engagementPct` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medialy_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ref` varchar(20) NOT NULL,
	`clientId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`weekLabel` varchar(80) NOT NULL,
	`itemCount` int NOT NULL DEFAULT 0,
	`previewLink` varchar(1024),
	`submittedAt` varchar(10),
	`feedback` text,
	`revisionCount` int NOT NULL DEFAULT 0,
	`approvedAt` varchar(10),
	`medialyApprovalStatus` enum('Pending','Changes Requested','Approved','Rejected') NOT NULL DEFAULT 'Pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_approvals_id` PRIMARY KEY(`id`),
	CONSTRAINT `medialy_approvals_ref_unique` UNIQUE(`ref`)
);
--> statement-breakpoint
CREATE TABLE `medialy_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ref` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`medialyTaskType` enum('Content Creation','Photography','Reporting','Meeting','Editing','Admin') NOT NULL DEFAULT 'Content Creation',
	`clientId` int,
	`assignee` varchar(120) NOT NULL,
	`dueDate` varchar(10) NOT NULL,
	`medialyTaskStatus` enum('Not Started','In Progress','Done','Blocked') NOT NULL DEFAULT 'Not Started',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `medialy_tasks_ref_unique` UNIQUE(`ref`)
);
--> statement-breakpoint
CREATE TABLE `medialy_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`medialyPerfPeriod` enum('Week','Month') NOT NULL DEFAULT 'Week',
	`label` varchar(80) NOT NULL,
	`reach` int NOT NULL DEFAULT 0,
	`engagement` int NOT NULL DEFAULT 0,
	`followerGrowthPct` int NOT NULL DEFAULT 0,
	`bestPost` varchar(1024),
	`worstPost` varchar(1024),
	`platformBreakdown` text,
	`medialyPerfBestType` enum('Feed','Reel','Story','Carousel','Flyer','Video'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medialy_comms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`whenDate` varchar(10) NOT NULL,
	`medialyCommType` enum('WhatsApp','Video Call','Email','Phone','In Person') NOT NULL DEFAULT 'WhatsApp',
	`summary` text NOT NULL,
	`followUpOn` varchar(10),
	`medialyCommOwner` enum('Hikma','Ahmad','Salis') NOT NULL DEFAULT 'Hikma',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_comms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medialy_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`weekOf` varchar(10) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medialy_reports_id` PRIMARY KEY(`id`)
);
