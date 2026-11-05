import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
