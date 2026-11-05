CREATE TABLE `inventory_lots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`plant_type` text NOT NULL,
	`size_or_age` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`initial_quantity` integer NOT NULL,
	`quantity_remaining` integer NOT NULL,
	`minimum_order_quantity` integer DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'cây' NOT NULL,
	`wholesale_price` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_lots_code_unique` ON `inventory_lots` (`code`);--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lot_id` integer NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`actor_user_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lot_id`) REFERENCES `inventory_lots`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`actor_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
