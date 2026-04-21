PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`time` text NOT NULL,
	`end_time` text NOT NULL,
	`crosses_midnight` integer DEFAULT false NOT NULL,
	`direction_id` integer NOT NULL,
	`poster` text,
	FOREIGN KEY (`direction_id`) REFERENCES `directions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_lessons`("id", "day", "time", "end_time", "crosses_midnight", "direction_id", "poster") SELECT "id", "day", "time", "end_time", "crosses_midnight", "direction_id", "poster" FROM `lessons`;--> statement-breakpoint
DROP TABLE `lessons`;--> statement-breakpoint
ALTER TABLE `__new_lessons` RENAME TO `lessons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;