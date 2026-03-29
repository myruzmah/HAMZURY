CREATE TABLE `client_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int,
	`clientRef` varchar(50) NOT NULL,
	`clientName` varchar(255),
	`department` varchar(50),
	`systemPrompt` text NOT NULL,
	`chatHistory` json,
	`chatStatus` enum('active','paused','closed') NOT NULL DEFAULT 'active',
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills_awards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quarter` varchar(10) NOT NULL,
	`teamId` int,
	`teamName` varchar(100),
	`awardType` enum('champion','runner_up','best_project','best_content','most_improved','special') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`recipientName` varchar(255),
	`certificationIssued` boolean DEFAULT false,
	`awardDate` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_awards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills_interactive_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quarter` varchar(10) NOT NULL,
	`weekNumber` int NOT NULL,
	`dayOfWeek` enum('monday','tuesday','wednesday') NOT NULL,
	`timeSlot` varchar(50) DEFAULT '11:00 AM – 1:00 PM',
	`title` varchar(255) NOT NULL,
	`description` text,
	`sessionType` enum('game','tech_talk','entrepreneurship','prompt_challenge','tool_exploration','social_media','content_creation','branding') NOT NULL,
	`teamScores` json,
	`winnerTeamId` int,
	`sessionStatus` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`sessionDate` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_interactive_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`studentEmail` varchar(320),
	`memberType` enum('cohort','planaid','online') NOT NULL DEFAULT 'cohort',
	`role` varchar(50) DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`cohortId` int,
	`quarter` varchar(10) NOT NULL,
	`color` varchar(20),
	`points` int NOT NULL DEFAULT 0,
	`wins` int DEFAULT 0,
	`losses` int DEFAULT 0,
	`memberCount` int DEFAULT 0,
	`captainName` varchar(255),
	`teamStatus` enum('active','eliminated','champion') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `expectedDelivery` varchar(20);--> statement-breakpoint
ALTER TABLE `tasks` ADD `actualDelivery` varchar(20);--> statement-breakpoint
ALTER TABLE `tasks` ADD `estimatedHours` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `actualHours` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `priority` enum('urgent','high','normal','low') DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `tasks` ADD `category` varchar(50);