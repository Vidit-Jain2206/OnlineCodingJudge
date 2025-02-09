CREATE TABLE `submissions` (
	`id` varchar(36) NOT NULL,
	`source_code` text NOT NULL,
	`language` varchar(50) NOT NULL,
	`expected_output` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`std_output` text,
	`result` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
