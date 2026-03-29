CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateNumber` varchar(20) NOT NULL,
	`studentName` varchar(200) NOT NULL,
	`studentEmail` varchar(200),
	`cohortId` int,
	`program` varchar(200) NOT NULL,
	`completionDate` timestamp NOT NULL,
	`grade` varchar(50),
	`issuedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `content_engagement_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekOf` varchar(10) NOT NULL,
	`staffEmail` varchar(255) NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`engaged` boolean NOT NULL DEFAULT false,
	`platforms` varchar(500),
	`notes` text,
	`recordedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_engagement_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentDepartment` enum('general','bizdoc','systemise','skills') NOT NULL DEFAULT 'general',
	`contentPlatform` enum('instagram','tiktok','twitter','linkedin') NOT NULL,
	`contentType` enum('educational','success_story','service_spotlight','behind_scenes','quote','carousel') NOT NULL,
	`caption` text NOT NULL,
	`hashtags` text,
	`mediaUrl` varchar(500),
	`scheduledFor` timestamp,
	`postedAt` timestamp,
	`contentStatus` enum('draft','scheduled','posted','failed') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(100),
	`engagement` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discipline_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffEmail` varchar(255) NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`disciplineType` enum('query','suspension') NOT NULL,
	`reason` varchar(500) NOT NULL,
	`description` text,
	`suspensionDays` int,
	`disciplineStatus` enum('issued','resolved') NOT NULL DEFAULT 'issued',
	`issuedBy` varchar(255) NOT NULL,
	`resolvedAt` timestamp,
	`resolvedNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discipline_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_meeting_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekOf` varchar(10) NOT NULL,
	`researchTopic` varchar(500),
	`researchAssignedTo` varchar(255),
	`researchFormat` varchar(100),
	`researchAdopted` boolean NOT NULL DEFAULT false,
	`projectLead` varchar(255),
	`staffOfWeek` varchar(255),
	`staffOfWeekAchievement` text,
	`trainingTopic` varchar(500),
	`trainingCategory` varchar(100),
	`trainer` varchar(255),
	`todoList` text,
	`nextWeekTodos` text,
	`notes` text,
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_meeting_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(20) NOT NULL,
	`leadId` int,
	`taskId` int,
	`subscriptionId` int,
	`clientName` varchar(200) NOT NULL,
	`clientEmail` varchar(200),
	`clientPhone` varchar(20),
	`items` json NOT NULL,
	`subtotal` int NOT NULL,
	`discount` int DEFAULT 0,
	`tax` int DEFAULT 0,
	`total` int NOT NULL,
	`amountPaid` int DEFAULT 0,
	`invoiceStatus` enum('draft','sent','paid','partial','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`dueDate` timestamp,
	`paidAt` timestamp,
	`notes` text,
	`createdBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffEmail` varchar(255) NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`startDate` varchar(20) NOT NULL,
	`endDate` varchar(20) NOT NULL,
	`reason` text,
	`replacementName` varchar(255),
	`leaveStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(255),
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(100) NOT NULL,
	`notificationType` enum('assignment','status_change','payment','reminder','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portal_visit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`portalName` varchar(255) NOT NULL,
	`visitedAt` timestamp NOT NULL DEFAULT (now()),
	`visitedBy` varchar(255),
	`actionTaken` text,
	`portalStatus` enum('logged_in','submitted','pending','approved','rejected','error') NOT NULL DEFAULT 'logged_in',
	`nextActionDate` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_visit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalNumber` varchar(20) NOT NULL,
	`leadId` int,
	`clientName` varchar(200) NOT NULL,
	`clientEmail` varchar(200),
	`clientPhone` varchar(20),
	`businessName` varchar(200),
	`services` json NOT NULL,
	`totalAmount` int NOT NULL,
	`validUntil` timestamp,
	`proposalStatus` enum('draft','sent','accepted','rejected','expired') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposals_proposalNumber_unique` UNIQUE(`proposalNumber`)
);
--> statement-breakpoint
CREATE TABLE `service_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pricingDepartment` enum('bizdoc','systemise','skills','metfix') NOT NULL,
	`category` varchar(100) NOT NULL,
	`serviceName` varchar(200) NOT NULL,
	`description` text,
	`basePrice` int NOT NULL,
	`maxPrice` int,
	`pricingUnit` enum('one_time','monthly','per_cohort','per_session','custom') NOT NULL DEFAULT 'one_time',
	`commissionPercent` int DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_pricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cohortId` int,
	`cohortName` varchar(255),
	`studentType` enum('physical','online','nitda') NOT NULL DEFAULT 'physical',
	`title` varchar(500) NOT NULL,
	`description` text,
	`milestoneDate` varchar(20) NOT NULL,
	`milestoneType` enum('assignment','quiz','presentation','celebration','graduation','event') NOT NULL DEFAULT 'assignment',
	`celebrated` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_savings_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`year` varchar(4) NOT NULL,
	`grossTaxLiability` decimal(15,2),
	`savedAmount` decimal(15,2),
	`hamzuryFee` decimal(15,2),
	`tccDelivered` boolean NOT NULL DEFAULT false,
	`tccDeliveredAt` timestamp,
	`notes` text,
	`recordedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_savings_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklist_templates` ADD `department` varchar(50) DEFAULT 'bizdoc';--> statement-breakpoint
ALTER TABLE `leads` ADD `referralCode` varchar(50);--> statement-breakpoint
ALTER TABLE `leads` ADD `referrerName` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `referralSourceType` varchar(50);--> statement-breakpoint
ALTER TABLE `leads` ADD `leadOwner` varchar(100);--> statement-breakpoint
ALTER TABLE `leads` ADD `notifyCso` boolean DEFAULT false;