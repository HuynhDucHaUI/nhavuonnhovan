ALTER TABLE entries ADD COLUMN plant_shape text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE entries ADD COLUMN height_cm integer;
--> statement-breakpoint
ALTER TABLE entries ADD COLUMN price_vnd integer;
--> statement-breakpoint
ALTER TABLE inventory_lots ADD COLUMN gallery text NOT NULL DEFAULT '[]';
--> statement-breakpoint
ALTER TABLE inventory_lots ADD COLUMN photo_date text NOT NULL DEFAULT '';
