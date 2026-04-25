-- Scalar Ops Portal — migrate localStorage opsStore ("scalar") to real DB
-- Adds 6 tables under the "scalar_*" prefix.
-- Mirrors client/src/pages/ScalarOpsPortal.tsx data shapes.
-- Project ref convention: HMZ-P-XXX (sequential, generated server-side).
-- Children FK on int `projectId`. No formal FK constraints (matches schema convention; cascade in app code).

CREATE TABLE `scalar_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ref` varchar(20) NOT NULL DEFAULT '',
	`clientName` varchar(255) NOT NULL,
	`clientContact` varchar(255),
	`clientEmail` varchar(255),
	`clientPhone` varchar(50),
	`scalarProjectService` enum('Website','App','Automation') NOT NULL DEFAULT 'Website',
	`scalarProjectStatus` enum('Queued','In Progress','On Hold','Completed','Cancelled') NOT NULL DEFAULT 'Queued',
	`week` int,
	`phaseId` varchar(40),
	`scalarProjectLead` enum('Dajot','Felix','') NOT NULL DEFAULT '',
	`startDate` varchar(10),
	`targetDelivery` varchar(10),
	`actualDelivery` varchar(10),
	`projectValue` int,
	`scope` text,
	`goals` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scalar_deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`dueDate` varchar(10),
	`done` boolean NOT NULL DEFAULT false,
	`deliveredAt` varchar(10),
	`clientApproved` boolean NOT NULL DEFAULT false,
	`groupName` varchar(80),
	`owner` varchar(120),
	`path` varchar(1024),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scalar_blockers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`issue` text NOT NULL,
	`impact` text,
	`scalarBlockerStatus` enum('Open','Resolved') NOT NULL DEFAULT 'Open',
	`resolution` text,
	`resolvedAt` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_blockers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scalar_comms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`commType` varchar(80) NOT NULL,
	`summary` text NOT NULL,
	`actionItems` text,
	`followUpDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_comms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scalar_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`body` text NOT NULL,
	`decidedBy` varchar(255),
	`impact` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scalar_qa_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`feature` varchar(255) NOT NULL,
	`testCase` text NOT NULL,
	`expected` text,
	`actual` text,
	`scalarQaStatus` enum('Not Tested','Pass','Fail','Fixed') NOT NULL DEFAULT 'Not Tested',
	`bug` text,
	`fixedAt` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scalar_qa_checks_id` PRIMARY KEY(`id`)
);
