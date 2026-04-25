-- Founder → Department report requests.
-- Founder is locked out of department dashboards (strict role separation), so
-- they use this lightweight ask/answer channel instead. Each row is one
-- question that targets a single department; the dept replies in-place.
--
-- Lifecycle: status starts at 'pending'. Dept staff posts a `response` and
-- it flips to 'responded'. Founder may flip a still-pending row to 'cancelled'.
-- No formal FK constraints — `requestedBy` is the founder's openId string.
-- No server-generated ref pattern — entries are int-id only.

CREATE TABLE `report_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(255) NOT NULL,
	`reportTargetDept` enum('cso','ceo','finance','hr','bizdev','bizdoc','hub','scalar','medialy','podcast','video','faceless') NOT NULL,
	`notes` text,
	`reportRequestStatus` enum('pending','responded','cancelled') NOT NULL DEFAULT 'pending',
	`response` text,
	`responseBy` varchar(255),
	`respondedAt` timestamp,
	`requestedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_requests_id` PRIMARY KEY(`id`)
);
