CREATE TABLE `studio_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`school_name` text NOT NULL,
	`logo_path` text
);
--> statement-breakpoint
INSERT INTO `studio_settings` (`id`, `school_name`, `logo_path`)
VALUES (1, 'Школа танцев', NULL);
