-- Finance Portal — restore the 1 section that was cut from
-- client/src/pages/FinancePortal.tsx for launch (was localStorage-backed).
-- Adds 1 table under the "finance_*" prefix for the monthly P&L archive.
-- Mirrors the section data shape used by FinancePortal.tsx before the cut.
-- No FKs (independent collection). No server-generated ref pattern —
-- int autoincrement only. Decimals stored at (14, 2) for naira amounts.

CREATE TABLE `finance_monthly_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`revenue` decimal(14,2),
	`expenses` decimal(14,2),
	`profit` decimal(14,2),
	`notes` text,
	`archivedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finance_monthly_reports_id` PRIMARY KEY(`id`)
);
