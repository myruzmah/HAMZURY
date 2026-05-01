-- Hub enrolment scholarship codes
-- Adds: scholarship_codes table + extends skills_applications.appPaymentStatus
-- enum with 'paid_via_scholarship' and 'pending_seat_hold'.

CREATE TABLE `scholarship_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`description` varchar(255),
	`maxUses` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`usedByRefs` text,
	`expiresAt` timestamp,
	`active` boolean NOT NULL DEFAULT true,
	`createdBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scholarship_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `scholarship_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `skills_applications` MODIFY COLUMN `appPaymentStatus` enum('pending','paid','waived','refunded','paid_via_scholarship','pending_seat_hold') NOT NULL DEFAULT 'pending';
