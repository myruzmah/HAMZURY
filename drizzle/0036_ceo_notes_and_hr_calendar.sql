-- CEO Notes (Phase 2 CEO Strategic Command Center, tab 9) and HR Calendar
-- Events (Phase 2 HR Master Dashboard, tab 8). Two independent tables:
--   * ceo_notes — strategy/observation/idea/decision/parking lot,
--     pinned + tags. JSON column: ceo_notes.tags → string[].
--   * hr_calendar_events — attendance check, daily new-staff check-in,
--     quarterly performance reviews, monthly attendance report, etc.
--     Shapes derived from PHASE2_EXECUTIVE/HR/CALENDAR/HR_Calendar.ics.
-- No FKs (independent collections). No server-generated ref — int
-- autoincrement only. Both tables start empty.

CREATE TABLE `ceo_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`ceoNotesCategory` enum('strategy','observation','idea','decision','parking','other') NOT NULL DEFAULT 'other',
	`pinned` boolean NOT NULL DEFAULT false,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceo_notes_id` PRIMARY KEY(`id`)
);

CREATE TABLE `hr_calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NULL,
	`hrCalendarEventType` enum('attendance','checkin','review','report','training','leave','other') NOT NULL DEFAULT 'other',
	`assignee` varchar(255),
	`reminderSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_calendar_events_id` PRIMARY KEY(`id`)
);
