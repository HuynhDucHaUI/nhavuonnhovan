import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [sourcePath] = process.argv.slice(2);
const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME;
if (!sourcePath) throw new Error("Usage: node scripts/import-d1-export.mjs <export.json>");
if (!databaseName || !/^[a-z0-9][a-z0-9-]{0,62}$/i.test(databaseName)) {
  throw new Error("Set CLOUDFLARE_D1_DATABASE_NAME to a valid D1 database name.");
}

const root = fileURLToPath(new URL("../", import.meta.url));
const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const allowedColumns = {
  admin_users: ["id", "username", "display_name", "password_hash", "password_salt", "role", "status", "failed_login_count", "locked_until", "last_login_at", "created_at", "updated_at"],
  entries: ["id", "kind", "title", "code", "description", "image", "gallery", "price", "status", "published", "created_at"],
  settings: ["key", "value"],
  inventory_lots: ["id", "code", "title", "plant_type", "size_or_age", "location", "initial_quantity", "quantity_remaining", "minimum_order_quantity", "unit", "wholesale_price", "image", "description", "status", "published", "created_at", "updated_at"],
  inventory_movements: ["id", "lot_id", "type", "quantity", "note", "actor_user_id", "created_at"],
};
const insertionOrder = ["admin_users", "entries", "settings", "inventory_lots", "inventory_movements"];
const conflictColumns = {
  admin_users: "id",
  entries: "id",
  settings: "key",
  inventory_lots: "id",
  inventory_movements: "id",
};
const exportData = JSON.parse(readFileSync(resolve(sourcePath), "utf8"));

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Invalid numeric value in import data.");
    return String(value);
  }
  if (typeof value !== "string") throw new Error("Unsupported import value type.");
  return `'${value.replaceAll("'", "''")}'`;
}

function execute(statement) {
  const result = spawnSync(process.execPath, [wrangler, "d1", "execute", databaseName, "--remote", "--command", statement], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "D1 import command failed.");
  }
}

for (const table of insertionOrder) {
  const rows = exportData[table] ?? [];
  if (!Array.isArray(rows)) throw new Error(`Expected an array for ${table}.`);
  const columns = allowedColumns[table];
  const conflictColumn = conflictColumns[table];
  const updates = columns
    .filter((column) => column !== conflictColumn)
    .map((column) => `${column} = excluded.${column}`)
    .join(", ");
  for (const row of rows) {
    const values = columns.map((column) => sqlLiteral(row[column]));
    execute(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT(${conflictColumn}) DO UPDATE SET ${updates}`);
  }
  console.log(`Imported ${rows.length} row(s) into ${table}.`);
}

console.log("D1 business data import is complete. Admin sessions are intentionally excluded.");
