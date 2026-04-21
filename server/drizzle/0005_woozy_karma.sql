PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#f59e0b' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_levels`("id", "name", "color") SELECT "id", "name", "color" FROM `levels`;--> statement-breakpoint
DROP TABLE `levels`;--> statement-breakpoint
ALTER TABLE `__new_levels` RENAME TO `levels`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `levels_name_unique` ON `levels` (`name`);