CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(255) NOT NULL,
	`color` varchar(255) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL,
	`amount` bigint NOT NULL,
	`categoryId` varchar(36) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
