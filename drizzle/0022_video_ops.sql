-- Video Ops Portal — migrate localStorage opsStore ("video") to real DB
-- Adds 4 tables under the "video_*" prefix.
-- Mirrors client/src/pages/VideoOpsPortal.tsx data shapes.
-- No formal FK constraints (matches existing schema convention; cascade in app code).

CREATE TABLE `video_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`client` varchar(255) NOT NULL DEFAULT '',
	`projectCode` varchar(80) NOT NULL DEFAULT '',
	`deliveryDate` varchar(10) NOT NULL DEFAULT '',
	`budget` int NOT NULL DEFAULT 0,
	`services` text NOT NULL,
	`videoProjectStatus` enum('Pre','Production','Post','Delivered') NOT NULL DEFAULT 'Pre',
	`phase` varchar(40) NOT NULL DEFAULT 'script',
	`videoProjectOwner` enum('Salis','Client') NOT NULL DEFAULT 'Salis',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`videoAssetGroup` enum('Footage','Audio','Graphics','Copy') NOT NULL DEFAULT 'Footage',
	`done` boolean NOT NULL DEFAULT false,
	`path` varchar(1024),
	`owner` varchar(120),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_revisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`version` varchar(20) NOT NULL,
	`feedback` text NOT NULL,
	`videoRevisionStatus` enum('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
	`date` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`videoDeliverableKind` enum('MP4','Thumbnail','SRT','Project File','Other') NOT NULL DEFAULT 'MP4',
	`path` varchar(1024),
	`format` varchar(80),
	`resolution` varchar(80),
	`done` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_deliverables_id` PRIMARY KEY(`id`)
);
