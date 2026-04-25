-- HR Portal — restore the 6 sections that used localStorage opsStore
-- (interns, requisitions, onboarding, intern-coord, performance, exits).
-- Adds 6 tables under the "hr_*" prefix.
-- Mirrors the section data shapes used by client/src/pages/HRPortal.tsx
-- before commit d55bab2 cut them. Field schemas derived from the HR
-- Operations Guide (PHASE2_EXECUTIVE/HR/OPERATIONS_GUIDE) — recruitment
-- requests, day-1/week-1/month-1 onboarding checklists, dual-coord HUB
-- hours, quarterly performance reviews, offboarding workflow.
-- Multi-value JSON columns (stored as text):
--   hr_onboarding.day1Tasks      → string[]
--   hr_onboarding.week1Tasks     → string[]
--   hr_onboarding.month1Tasks    → string[]
--   hr_onboarding.month3Tasks    → string[]
--   hr_performance.nextGoals     → string[]
--   hr_exits.handoverItems       → string[]
-- No FKs between these tables (they're independent collections).
-- No server-generated ref pattern — int autoincrement only.

CREATE TABLE `hr_interns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`internId` varchar(40) NOT NULL,
	`name` varchar(255) NOT NULL,
	`division` varchar(120) NOT NULL,
	`hubCommitment` boolean NOT NULL DEFAULT false,
	`hubHoursPerWeek` int,
	`divisionHoursPerWeek` int,
	`startDate` varchar(10),
	`durationMonths` int,
	`hrInternStatus` enum('Selecting','Onboarding','Active','Converting','Exited') NOT NULL DEFAULT 'Active',
	`performanceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_interns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(255) NOT NULL,
	`division` varchar(120) NOT NULL,
	`requesterLead` varchar(255) NOT NULL,
	`responsibilities` text,
	`requirements` text,
	`salaryRange` varchar(120),
	`timeline` varchar(120),
	`hrReqStatus` enum('Requested','CEO Approved','Posted','Screening','Interviewing','Offer','Hired','Closed') NOT NULL DEFAULT 'Requested',
	`ceoApproved` boolean NOT NULL DEFAULT false,
	`postedAt` varchar(10),
	`closedAt` varchar(10),
	`shortlistCount` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_requisitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_onboarding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`staffId` varchar(40),
	`division` varchar(120),
	`hireDate` varchar(10) NOT NULL,
	`day1Tasks` text,
	`week1Tasks` text,
	`month1Tasks` text,
	`month3Tasks` text,
	`day1Done` boolean NOT NULL DEFAULT false,
	`week1Done` boolean NOT NULL DEFAULT false,
	`month1Done` boolean NOT NULL DEFAULT false,
	`month3Done` boolean NOT NULL DEFAULT false,
	`hrOnboardStatus` enum('Day 1','Week 1','Month 1','Probation','Confirmed','Parted Ways') NOT NULL DEFAULT 'Day 1',
	`probationOutcome` varchar(120),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_onboarding_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_intern_coord` (
	`id` int AUTO_INCREMENT NOT NULL,
	`internId` varchar(40) NOT NULL,
	`internName` varchar(255) NOT NULL,
	`division` varchar(120) NOT NULL,
	`divisionLead` varchar(255),
	`hubManager` varchar(255),
	`divisionHoursPerWeek` int,
	`hubHoursPerWeek` int,
	`lastReviewAt` varchar(10),
	`divisionFeedback` text,
	`hubFeedback` text,
	`hrCoordStatus` enum('Onboarding','Active','Review','Converting','Ended') NOT NULL DEFAULT 'Active',
	`conversionDecision` varchar(120),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_intern_coord_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`staffId` varchar(40),
	`division` varchar(120),
	`reviewerLead` varchar(255) NOT NULL,
	`quarter` varchar(20) NOT NULL,
	`achievements` text,
	`challenges` text,
	`growth` text,
	`goalsMet` varchar(120),
	`nextGoals` text,
	`supportNeeded` text,
	`rating` int,
	`hrPerfStatus` enum('Scheduled','In Progress','Completed','Improvement Plan','Escalated') NOT NULL DEFAULT 'Scheduled',
	`reviewedAt` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_exits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffName` varchar(255) NOT NULL,
	`staffId` varchar(40),
	`division` varchar(120),
	`hrExitType` enum('Resignation','Termination','End of Contract','Other') NOT NULL DEFAULT 'Resignation',
	`noticeDate` varchar(10),
	`lastDay` varchar(10),
	`reason` text,
	`handoverItems` text,
	`feedback` text,
	`equipmentReturned` boolean NOT NULL DEFAULT false,
	`accessRevoked` boolean NOT NULL DEFAULT false,
	`finalPayProcessed` boolean NOT NULL DEFAULT false,
	`exitInterviewDone` boolean NOT NULL DEFAULT false,
	`hrExitStatus` enum('Notified','Transition','Final Week','Departed','Post-Exit') NOT NULL DEFAULT 'Notified',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_exits_id` PRIMARY KEY(`id`)
);
