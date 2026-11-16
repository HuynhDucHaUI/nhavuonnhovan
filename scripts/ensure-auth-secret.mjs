import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const workerName = process.env.CLOUDFLARE_WORKER_NAME;
if (!workerName || !/^[a-z0-9][a-z0-9-]*$/i.test(workerName)) {
  throw new Error("A valid CLOUDFLARE_WORKER_NAME is required.");
}

const wrangler = "node_modules/wrangler/bin/wrangler.js";
const baseArgs = [wrangler, "secret", "list", "--config", "dist/server/wrangler.json", "--name", workerName, "--format", "json"];
const list = spawnSync(process.execPath, baseArgs, { encoding: "utf8" });
if (list.status !== 0) throw new Error(`Could not inspect Worker secrets: ${list.stderr || list.stdout}`);
const secrets = JSON.parse(list.stdout);
if (!Array.isArray(secrets)) throw new Error("Unexpected Worker secrets response.");

if (secrets.some((secret) => secret.name === "AUTH_SESSION_SECRET")) {
  console.log("Session secret already exists.");
} else {
  const result = spawnSync(process.execPath, [wrangler, "secret", "put", "AUTH_SESSION_SECRET", "--config", "dist/server/wrangler.json", "--name", workerName], {
    input: randomBytes(32).toString("base64"),
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(`Could not configure session secret (exit ${result.status ?? "unknown"}).`);
  console.log("Session secret configured.");
}
