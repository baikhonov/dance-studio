CREATE TABLE `lesson_levels` (
	`lesson_id` integer NOT NULL,
	`level_id` integer NOT NULL,
	PRIMARY KEY(`lesson_id`, `level_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO `lesson_levels` (`lesson_id`, `level_id`)
SELECT `id`, `level_id`
FROM `lessons`
WHERE `level_id` IS NOT NULL;
