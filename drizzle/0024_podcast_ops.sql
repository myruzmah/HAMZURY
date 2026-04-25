-- Podcast Ops Portal — migrate localStorage opsStore ("podcast") to real DB
-- Adds 6 tables under the "podcast_*" prefix.
-- Mirrors client/src/pages/PodcastOpsPortal.tsx data shapes.
-- Distinct from existing `podcastEpisodes` table (CEO dashboard) — episodes
-- here use `podcast_episodes_ops` to avoid collision.
-- Children FK on int parent ids (`showId`, `episodeId`). No formal FK
-- constraints (matches schema convention; cascade in app code).
-- The `assets` column on `podcast_episodes_ops` stores a JSON-stringified
-- AssetItem[] to preserve the existing UI's checklist UX without a child table.

CREATE TABLE `podcast_shows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`showName` varchar(255) NOT NULL,
	`podcastShowTier` enum('10ep','15ep','20ep','interview','edit-only','corporate') NOT NULL DEFAULT '10ep',
	`episodesTotal` int NOT NULL DEFAULT 0,
	`episodesDelivered` int NOT NULL DEFAULT 0,
	`priceNGN` int NOT NULL DEFAULT 0,
	`startDate` varchar(10),
	`podcastShowCadence` enum('Weekly','Biweekly','Monthly','Ad-hoc') NOT NULL DEFAULT 'Weekly',
	`contact` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_shows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_episodes_ops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`epNumber` varchar(40) NOT NULL,
	`title` varchar(255) NOT NULL,
	`topic` varchar(255),
	`showId` int,
	`guestName` varchar(255),
	`guestId` int,
	`podcastEpisodeHost` enum('Maryam','Habeeba','Co-host') NOT NULL DEFAULT 'Maryam',
	`podcastEpisodePhase` enum('topic','research','script','booked','recorded','assembly','cleaning','mixing','qc','published') NOT NULL DEFAULT 'topic',
	`recordingDate` varchar(10),
	`publishDate` varchar(10),
	`durationTarget` varchar(40),
	`notes` text,
	`assets` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_episodes_ops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`preferredName` varchar(255),
	`title` varchar(255),
	`company` varchar(255),
	`email` varchar(255),
	`phone` varchar(50),
	`bio` text,
	`headshotUrl` varchar(1024),
	`expertise` text,
	`talkingPoints` text,
	`avoidTopics` text,
	`availability` varchar(255),
	`timezone` varchar(60),
	`podcastGuestRecPref` enum('Remote','In-Person') NOT NULL DEFAULT 'Remote',
	`micSetup` varchar(255),
	`briefSent` boolean NOT NULL DEFAULT false,
	`techCheckDone` boolean NOT NULL DEFAULT false,
	`formReceived` boolean NOT NULL DEFAULT false,
	`episodeTitle` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_publishing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int,
	`epLabel` varchar(255) NOT NULL,
	`showId` int,
	`scheduledDate` varchar(10) NOT NULL,
	`apple` boolean NOT NULL DEFAULT false,
	`spotify` boolean NOT NULL DEFAULT false,
	`google` boolean NOT NULL DEFAULT false,
	`amazon` boolean NOT NULL DEFAULT false,
	`audiogramReady` boolean NOT NULL DEFAULT false,
	`quoteCardsReady` boolean NOT NULL DEFAULT false,
	`socialPostScheduled` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_publishing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int,
	`epLabel` varchar(255) NOT NULL,
	`publishedOn` varchar(10) NOT NULL,
	`downloads7d` int NOT NULL DEFAULT 0,
	`downloads30d` int,
	`topPlatform` varchar(60),
	`completionPct` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`podcastEquipmentCategory` enum('Microphone','Interface','Headphones','Software','Other') NOT NULL DEFAULT 'Microphone',
	`brand` varchar(255),
	`assignedTo` varchar(120),
	`podcastEquipmentCondition` enum('Good','Needs Repair','Retired') NOT NULL DEFAULT 'Good',
	`location` varchar(255),
	`serial` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_equipment_id` PRIMARY KEY(`id`)
);
