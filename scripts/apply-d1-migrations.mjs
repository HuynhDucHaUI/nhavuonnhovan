import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME;
if (!databaseName || !/^[a-z0-9][a-z0-9-]{0,62}$/i.test(databaseName)) {
  throw new Error("Set CLOUDFLARE_D1_DATABASE_NAME to a valid D1 database name.");
}

const root = fileURLToPath(new URL("../", import.meta.url));
const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const migrationDirectory = resolve(root, "drizzle");

function run(args, { json = false } = {}) {
  const result = spawnSync(process.execPath, [wrangler, ...args], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Wrangler exited with ${result.status}.`);
  }

  if (!json) return result.stdout;
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error("Wrangler returned an unexpected migration ledger response.");
  }
}

function findRows(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const rows = findRows(item);
      if (rows) return rows;
    }
    return null;
  }
  if (value && typeof value === "object") {
    if (Array.isArray(value.results)) return value.results;
    for (const nested of Object.values(value)) {
      const rows = findRows(nested);
      if (rows) return rows;
    }
  }
  return null;
}

run([
  "d1", "execute", databaseName, "--remote",
  "--command", "CREATE TABLE IF NOT EXISTS _app_migrations (name TEXT PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL)",
]);

const ledger = run([
  "d1", "execute", databaseName, "--remote",
  "--command", "SELECT name FROM _app_migrations ORDER BY name",
  "--json",
], { json: true });
const applied = new Set((findRows(ledger) ?? []).map((row) => row.name));
const migrations = readdirSync(migrationDirectory)
  .filter((name) => /^\d{4}_.+\.sql$/.test(name))
  .sort();

for (const name of migrations) {
  if (applied.has(name)) continue;

  console.log(`Applying D1 migration: ${name}`);
  run([
    "d1", "execute", databaseName, "--remote",
    "--file", resolve(migrationDirectory, name),
  ]);
  run([
    "d1", "execute", databaseName, "--remote",
    "--command", `INSERT INTO _app_migrations (name, applied_at) VALUES ('${name.replace(/'/g, "''")}', datetime('now'))`,
  ]);
}

console.log("D1 migrations are current.");
