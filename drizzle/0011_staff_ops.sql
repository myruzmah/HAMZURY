-- Migration: 0011_staff_ops
-- Leave requests, discipline records, portal visit logs,
-- content engagement logs, hub meeting records, student milestones

CREATE TABLE `leave_requests` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `staffEmail` varchar(255) NOT NULL,
  `staffName` varchar(255) NOT NULL,
  `startDate` varchar(20) NOT NULL,
  `endDate` varchar(20) NOT NULL,
  `reason` text,
  `replacementName` varchar(255),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewedBy` varchar(255),
  `reviewNotes` text,
  `reviewedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE TABLE `discipline_records` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `staffEmail` varchar(255) NOT NULL,
  `staffName` varchar(255) NOT NULL,
  `type` enum('query','suspension') NOT NULL,
  `reason` varchar(500) NOT NULL,
  `description` text,
  `suspensionDays` int,
  `status` enum('issued','resolved') NOT NULL DEFAULT 'issued',
  `issuedBy` varchar(255) NOT NULL,
  `resolvedAt` timestamp,
  `resolvedNotes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE TABLE `portal_visit_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `subscriptionId` int NOT NULL,
  `clientName` varchar(255) NOT NULL,
  `portalName` varchar(255) NOT NULL,
  `visitedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `visitedBy` varchar(255),
  `actionTaken` text,
  `status` enum('logged_in','submitted','pending','approved','rejected','error') NOT NULL DEFAULT 'logged_in',
  `nextActionDate` varchar(20),
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE TABLE `content_engagement_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `weekOf` varchar(10) NOT NULL,
  `staffEmail` varchar(255) NOT NULL,
  `staffName` varchar(255) NOT NULL,
  `engaged` boolean NOT NULL DEFAULT false,
  `platforms` varchar(500),
  `notes` text,
  `recordedBy` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE TABLE `hub_meeting_records` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE TABLE `student_milestones` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `cohortId` int,
  `cohortName` varchar(255),
  `studentType` enum('physical','online','nitda') NOT NULL DEFAULT 'physical',
  `title` varchar(500) NOT NULL,
  `description` text,
  `milestoneDate` varchar(20) NOT NULL,
  `type` enum('assignment','quiz','presentation','celebration','graduation','event') NOT NULL DEFAULT 'assignment',
  `celebrated` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
