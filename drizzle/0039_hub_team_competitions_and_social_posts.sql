-- 2026-04-30 Hub team competitions + social posts (Phase 7).
-- Migrates the Team Competition + Social Verification features off
-- localStorage onto MySQL so the Hub certification gate can be enforced.

CREATE TABLE IF NOT EXISTS `hub_team_competitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` varchar(7) NOT NULL,
  `title` varchar(255) NOT NULL,
  `deadline` varchar(10) NOT NULL,
  `hubCompStatus` enum('active','judged','archived') NOT NULL DEFAULT 'active',
  `scores` json NOT NULL,
  `notes` text NULL,
  `createdBy` varchar(255) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hub_comp_month_idx` (`month`)
);

CREATE TABLE IF NOT EXISTS `hub_social_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentName` varchar(255) NOT NULL,
  `applicationId` int NULL,
  `weekOf` varchar(10) NOT NULL,
  `platform` varchar(30) NOT NULL,
  `postUrl` varchar(500) NOT NULL,
  `verified` boolean NOT NULL DEFAULT false,
  `verifiedBy` varchar(255) NULL,
  `verifiedAt` timestamp NULL,
  `notes` text NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hub_social_student_idx` (`studentName`),
  KEY `hub_social_week_idx` (`weekOf`)
);
