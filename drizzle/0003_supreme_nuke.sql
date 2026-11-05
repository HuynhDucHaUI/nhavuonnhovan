CREATE INDEX `inventory_lots_public_idx` ON `inventory_lots` (`published`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_lots_lookup_idx` ON `inventory_lots` (`code`,`location`);--> statement-breakpoint
CREATE INDEX `inventory_movements_lot_idx` ON `inventory_movements` (`lot_id`,`created_at`);