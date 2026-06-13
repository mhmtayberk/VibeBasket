CREATE TABLE `backup_storage_config` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`backend` text DEFAULT 'local' NOT NULL,
	`encrypted_config` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`manifest` text NOT NULL,
	`user_id` text,
	`expires_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`icon` text,
	`source_name` text,
	`source_url` text,
	`data` text NOT NULL,
	`verified` integer DEFAULT false,
	`first_seen_at` integer,
	`last_seen_at` integer,
	`last_synced_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `catalog_sync_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trigger` text NOT NULL,
	`success` integer NOT NULL,
	`total_items` integer NOT NULL,
	`mcps` integer NOT NULL,
	`skills` integer NOT NULL,
	`rules` integer NOT NULL,
	`workflows` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`source_errors` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_expires_idx` ON `sessions` (`user_id`,`expires`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`email_verified` integer,
	`image` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_tokens_token_unique` ON `verification_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `saved_stack_items` (
	`id` text PRIMARY KEY NOT NULL,
	`stack_id` text NOT NULL,
	`catalog_item_id` text NOT NULL,
	`catalog_item_type` text NOT NULL,
	`snapshot_display_name` text NOT NULL,
	`snapshot_description` text,
	`position` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`stack_id`) REFERENCES `saved_stacks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `saved_stack_items_stack_id_position_idx` ON `saved_stack_items` (`stack_id`,`position`);--> statement-breakpoint
CREATE TABLE `saved_stack_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`stack_id` text NOT NULL,
	`target_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`stack_id`) REFERENCES `saved_stacks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `saved_stack_targets_stack_id_position_idx` ON `saved_stack_targets` (`stack_id`,`position`);--> statement-breakpoint
CREATE TABLE `saved_stacks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_stacks_user_name_unique` ON `saved_stacks` (`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `saved_stacks_user_id_updated_at_idx` ON `saved_stacks` (`user_id`,`updated_at`);