-- HUB Admin Portal — restore the 5 sections that were cut at commit d7e9c60.
-- Adds 5 tables under the "hub_*" prefix.
-- Mirrors the section data shapes used by client/src/pages/HubAdminPortal.tsx
-- before the cut. Field schemas derived from the HUB Operations Guide
-- (PHASE7_HUB) — student certifications, alumni placements, LMS progress,
-- intern duty roster, MetFix hardware sales/service unit.
-- Multi-value JSON columns (stored as text):
--   hub_certifications.skills            → string[] (skills validated)
--   hub_alumni.skills                    → string[]
--   hub_lms_progress.modulesCompleted    → string[]
--   hub_intern_duties.checklist          → string[]
--   hub_metfix.parts                     → string[]
-- No FKs between these tables (they're independent collections).
-- No server-generated ref pattern — int autoincrement only.

CREATE TABLE `hub_certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`studentRef` varchar(60),
	`programme` varchar(255) NOT NULL,
	`hubCertificationLevel` enum('Foundation','Intermediate','Advanced','Mastery','Internal','Other') NOT NULL DEFAULT 'Foundation',
	`issuingBody` varchar(255),
	`certificateRef` varchar(200),
	`issueDate` varchar(10) NOT NULL,
	`expiryDate` varchar(10),
	`skills` text,
	`hubCertificationStatus` enum('Issued','Pending','Revoked','Expired') NOT NULL DEFAULT 'Issued',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_alumni` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`studentRef` varchar(60),
	`programme` varchar(255) NOT NULL,
	`graduationDate` varchar(10) NOT NULL,
	`currentEmployer` varchar(255),
	`jobTitle` varchar(255),
	`hubAlumniPlacement` enum('Employed','Self-Employed','Internship','Further Studies','Seeking','Unknown') NOT NULL DEFAULT 'Seeking',
	`email` varchar(320),
	`phone` varchar(50),
	`skills` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_alumni_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_lms_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`studentRef` varchar(60),
	`programme` varchar(255) NOT NULL,
	`currentModule` varchar(255),
	`completionPct` int NOT NULL DEFAULT 0,
	`modulesCompleted` text,
	`lastActivity` varchar(10),
	`hubLmsProgressStatus` enum('Active','On Track','Behind','Stalled','Completed','Dropped') NOT NULL DEFAULT 'Active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_lms_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_intern_duties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`internName` varchar(255) NOT NULL,
	`dutyTitle` varchar(255) NOT NULL,
	`hubInternDutyCategory` enum('Teaching Support','Admin','Facilities','Social Media','LMS','Events','Other') NOT NULL DEFAULT 'Other',
	`assignedDate` varchar(10) NOT NULL,
	`dueDate` varchar(10),
	`checklist` text,
	`hubInternDutyStatus` enum('Assigned','In Progress','Blocked','Done','Cancelled') NOT NULL DEFAULT 'Assigned',
	`assignedBy` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_intern_duties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_metfix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`hubMetfixJobType` enum('Sale','Repair','Diagnosis','Service','Parts Order','Other') NOT NULL DEFAULT 'Repair',
	`customerName` varchar(255),
	`customerPhone` varchar(50),
	`intakeDate` varchar(10) NOT NULL,
	`completedDate` varchar(10),
	`amount` varchar(80),
	`technician` varchar(255),
	`parts` text,
	`hubMetfixStatus` enum('Intake','In Progress','Awaiting Parts','Ready','Delivered','Cancelled') NOT NULL DEFAULT 'Intake',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_metfix_id` PRIMARY KEY(`id`)
);
