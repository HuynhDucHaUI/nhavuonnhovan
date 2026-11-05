import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(), title: text("title").notNull(),
  code: text("code").notNull().default(""), description: text("description").notNull().default(""),
  image: text("image").notNull().default(""), price: text("price").notNull().default(""),
  status: text("status").notNull().default("contact"), published: integer("published").notNull().default(0),
  createdAt: text("created_at").notNull()
});
export const settings = sqliteTable("settings", { key: text("key").primaryKey(), value: text("value").notNull() });

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role", { enum: ["owner", "staff"] }).notNull().default("staff"),
  status: text("status", { enum: ["active", "locked"] }).notNull().default("active"),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: text("locked_until"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  createdAt: text("created_at").notNull(),
});

/** A wholesale row/lot. Quantities are only changed through inventory movements. */
export const inventoryLots = sqliteTable("inventory_lots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  plantType: text("plant_type").notNull(),
  sizeOrAge: text("size_or_age").notNull().default(""),
  location: text("location").notNull().default(""),
  initialQuantity: integer("initial_quantity").notNull(),
  quantityRemaining: integer("quantity_remaining").notNull(),
  minimumOrderQuantity: integer("minimum_order_quantity").notNull().default(1),
  unit: text("unit").notNull().default("cây"),
  wholesalePrice: text("wholesale_price").notNull().default(""),
  image: text("image").notNull().default(""),
  description: text("description").notNull().default(""),
  status: text("status", { enum: ["available", "sold_out"] }).notNull().default("available"),
  published: integer("published").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("inventory_lots_public_idx").on(table.published, table.status, table.createdAt),
  index("inventory_lots_lookup_idx").on(table.code, table.location),
]);

/** Immutable audit trail for every stock change in a wholesale lot. */
export const inventoryMovements = sqliteTable("inventory_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lotId: integer("lot_id").notNull().references(() => inventoryLots.id, { onDelete: "restrict" }),
  type: text("type", { enum: ["in", "sale", "adjust"] }).notNull(),
  quantity: integer("quantity").notNull(),
  note: text("note").notNull().default(""),
  actorUserId: integer("actor_user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
}, (table) => [index("inventory_movements_lot_idx").on(table.lotId, table.createdAt)]);
