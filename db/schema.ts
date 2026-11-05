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
