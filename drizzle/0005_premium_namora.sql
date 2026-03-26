CREATE TABLE `affiliate_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`affiliateCode` varchar(20) NOT NULL,
	`leadId` int,
	`taskRef` varchar(20),
	`clientName` varchar(255),
	`service` varchar(100),
	`department` varchar(50),
	`quotedAmount` decimal(12,2),
	`commissionRate` decimal(5,2) DEFAULT '10',
	`commissionAmount` decimal(12,2),
	`affRecordStatus` enum('pending','earned','paid') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`method` varchar(50) NOT NULL DEFAULT 'bank_transfer',
	`accountName` varchar(255),
	`accountNumber` varchar(50),
	`bankName` varchar(100),
	`withdrawalStatus` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`phone` varchar(50),
	`affiliateStatus` enum('active','suspended','pending') NOT NULL DEFAULT 'active',
	`totalEarnings` decimal(12,2) DEFAULT '0',
	`pendingBalance` decimal(12,2) DEFAULT '0',
	`paidBalance` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_code_unique` UNIQUE(`code`),
	CONSTRAINT `affiliates_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `staffUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`passwordSalt` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`staffHamzuryRole` enum('founder','ceo','cso','finance','hr','bizdev','department_staff') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`firstLogin` boolean NOT NULL DEFAULT true,
	`passwordChanged` boolean NOT NULL DEFAULT false,
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`lastLogin` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staffUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `staffUsers_email_unique` UNIQUE(`email`)
);
