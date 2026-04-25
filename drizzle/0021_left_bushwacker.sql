-- Founder Portal — migrate localStorage opsStore to real DB
-- Adds 6 tables under the "founder_*" prefix.
-- The auto-generated diff included pre-existing schema drift (clients, spa_*, agent_state etc.)
-- which is already live in production; we only ship the founder additions here.

CREATE TABLE `founder_debt_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`amount` int NOT NULL,
	`source` varchar(255) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `founder_schedule_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` varchar(10) NOT NULL,
	`slot` varchar(200) NOT NULL,
	`done` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_schedule_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `founder_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`platform` varchar(80) NOT NULL,
	`contentType` varchar(80) NOT NULL,
	`theme` varchar(255),
	`mentor` varchar(120),
	`posted` varchar(20) NOT NULL,
	`engagement` varchar(100),
	`saved` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `founder_learning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`source` varchar(255) NOT NULL,
	`mentor` varchar(120),
	`lesson` text NOT NULL,
	`screenshot` boolean NOT NULL DEFAULT false,
	`whyWorth` text,
	`howApply` text,
	`founderLearningApplied` enum('Not Yet','In Progress','Yes') NOT NULL DEFAULT 'Not Yet',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_learning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `founder_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`target` varchar(10),
	`founderMilestoneStatus` enum('Not Started','Planning','In Progress','Done') NOT NULL DEFAULT 'Not Started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `founder_vault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`founderVaultKind` enum('account','doc') NOT NULL DEFAULT 'account',
	`service` varchar(255) NOT NULL,
	`username` varchar(255),
	`secret` text,
	`securityQ` text,
	`recovery` text,
	`storageLocation` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `founder_vault_id` PRIMARY KEY(`id`)
);
