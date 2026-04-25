-- CEO Portal — restore the 7 sections that were cut at commit 136da29.
-- Adds 7 tables under the "ceo_*" prefix.
-- Mirrors the section data shapes used by client/src/pages/CEOPortal.tsx
-- before the cut. Field schemas derived from the CEO Operations Guide
-- (PHASE2_EXECUTIVE/CEO/OPERATIONS_GUIDE) — equipment + software
-- management, weekly branding QA, documents vault, division updates,
-- Canva templates library, weekly meetings cadence.
-- Multi-value JSON columns (stored as text):
--   ceo_branding_qa.checklist           → string[]
--   ceo_documents.tags                  → string[]
--   ceo_division_updates.wins           → string[]
--   ceo_division_updates.blockers       → string[]
--   ceo_canva_templates.tags            → string[]
--   ceo_weekly_meetings.attendees       → string[]
--   ceo_weekly_meetings.agenda          → string[]
--   ceo_weekly_meetings.decisions       → string[]
--   ceo_weekly_meetings.actionItems     → string[]
-- No FKs between these tables (they're independent collections).
-- No server-generated ref pattern — int autoincrement only.

CREATE TABLE `ceo_equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ceoEquipmentCategory` enum('Laptop','Desktop','Phone','Tablet','Camera','Audio','Peripheral','Furniture','Other') NOT NULL DEFAULT 'Other',
	`serial` varchar(120),
	`assignedTo` varchar(255),
	`location` varchar(255),
	`purchaseDate` varchar(10),
	`purchaseCost` varchar(80),
	`ceoEquipmentCondition` enum('New','Good','Fair','Poor','Repair','Retired') NOT NULL DEFAULT 'Good',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_software` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`vendor` varchar(255),
	`category` varchar(120),
	`licenseKey` varchar(500),
	`seats` int,
	`seatsUsed` int,
	`monthlyCost` varchar(80),
	`renewalDate` varchar(10),
	`ceoSoftwareStatus` enum('Active','Trial','Expired','Cancelled') NOT NULL DEFAULT 'Active',
	`primaryUser` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_software_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_branding_qa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewDate` varchar(10) NOT NULL,
	`ceoBrandingQaDivision` enum('Bizdoc','Scalar','Medialy','HUB','Podcast','Video','BizDev','CSO','Skills','Other') NOT NULL DEFAULT 'Other',
	`contentType` varchar(120),
	`contentRef` varchar(500),
	`checklist` text,
	`passRate` int,
	`ceoBrandingQaOutcome` enum('Approved','Needs Revision','Rejected','Pending') NOT NULL DEFAULT 'Pending',
	`reviewer` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_branding_qa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`ceoDocumentCategory` enum('Legal','Financial','Operational','Strategic','HR','Client','Other') NOT NULL DEFAULT 'Other',
	`storageLocation` varchar(500),
	`ownerName` varchar(255),
	`expiryDate` varchar(10),
	`tags` text,
	`ceoDocumentStatus` enum('Active','Pending','Expired','Archived') NOT NULL DEFAULT 'Active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_division_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekOf` varchar(10) NOT NULL,
	`ceoDivisionUpdatesDivision` enum('Bizdoc','Scalar','Medialy','HUB','Podcast','Video','BizDev','CSO','Skills','Finance','HR','Other') NOT NULL DEFAULT 'Other',
	`submittedBy` varchar(255),
	`pulseScore` int,
	`wins` text,
	`blockers` text,
	`nextWeekFocus` text,
	`ceoDivisionUpdateStatus` enum('Submitted','Reviewed','Acted On','Archived') NOT NULL DEFAULT 'Submitted',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_division_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_canva_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ceoCanvaTemplateCategory` enum('Social Post','Carousel','Story','Flyer','Brochure','Pitch Deck','Proposal','Cover','Other') NOT NULL DEFAULT 'Other',
	`division` varchar(80),
	`canvaUrl` varchar(1000),
	`thumbnailUrl` varchar(1000),
	`tags` text,
	`usageCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_canva_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceo_weekly_meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingDate` varchar(10) NOT NULL,
	`ceoWeeklyMeetingType` enum('Monday Kickoff','Wednesday Midweek','Friday Wrap','Branding QA','Ad-hoc','Other') NOT NULL DEFAULT 'Monday Kickoff',
	`attendees` text,
	`agenda` text,
	`decisions` text,
	`actionItems` text,
	`durationMinutes` int,
	`facilitator` varchar(255),
	`ceoWeeklyMeetingStatus` enum('Planned','Held','Cancelled','Postponed') NOT NULL DEFAULT 'Planned',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_weekly_meetings_id` PRIMARY KEY(`id`)
);
