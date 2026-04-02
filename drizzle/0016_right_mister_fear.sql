ALTER TABLE `staffUsers` ADD `staffRef` varchar(20);--> statement-breakpoint
ALTER TABLE `staffUsers` ADD CONSTRAINT `staffUsers_staffRef_unique` UNIQUE(`staffRef`);