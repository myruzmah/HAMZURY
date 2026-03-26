ALTER TABLE `tasks` ADD `kpi_approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `is_rework` boolean DEFAULT false NOT NULL;