CREATE TABLE `client_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int,
	`subscriptionId` int,
	`platform` varchar(100) NOT NULL,
	`loginUrl` varchar(500),
	`username` varchar(500) NOT NULL,
	`passwordEnc` text NOT NULL,
	`iv` varchar(64) NOT NULL,
	`notes` text,
	`addedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`amountDue` decimal(12,2) NOT NULL,
	`amountPaid` decimal(12,2),
	`paymentStatus2` enum('pending','paid','overdue','waived') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`recordedBy` varchar(255),
	`paymentRef` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`clientName` varchar(255) NOT NULL,
	`businessName` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`service` varchar(100) NOT NULL,
	`department` varchar(50) NOT NULL DEFAULT 'bizdoc',
	`monthlyFee` decimal(12,2) NOT NULL,
	`billingDay` int NOT NULL DEFAULT 1,
	`subscriptionStatus` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`startDate` varchar(10) NOT NULL,
	`assignedStaffEmail` varchar(255),
	`notesForStaff` text,
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `subscriptionId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `taskMonth` varchar(7);