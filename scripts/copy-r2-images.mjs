import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [sourcePath] = process.argv.slice(2);
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const sourceOrigin = process.env.SOURCE_ORIGIN ?? "https://nhavuonnhovan.io.vn";
if (!sourcePath) throw new Error("Usage: node scripts/copy-r2-images.mjs <export.json>");
if (!bucketName || !/^[a-z0-9][a-z0-9-]{2,62}$/i.test(bucketName)) {
  throw new Error("Set CLOUDFLARE_R2_BUCKET_NAME to a valid R2 bucket name.");
}

const root = fileURLToPath(new URL("../", import.meta.url));
const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const exportData = JSON.parse(await readFile(resolve(sourcePath), "utf8"));

function getImageKey(value) {
  if (typeof value !== "string" || !value) return null;
  let url;
  try {
    url = new URL(value, sourceOrigin);
  } catch {
    return null;
  }
  const match = url.pathname.match(/^\/api\/images\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
  return match?.[1] ?? null;
}

function collectImageKeys() {
  const keys = new Set();
  const add = (value) => {
    const key = getImageKey(value);
    if (key) keys.add(key);
  };

  for (const row of exportData.entries ?? []) {
    add(row.image);
    try {
      const gallery = JSON.parse(row.gallery || "[]");
      if (Array.isArray(gallery)) gallery.forEach(add);
    } catch {
      throw new Error(`Invalid gallery JSON on entry ${row.id}.`);
    }
  }
  for (const row of exportData.inventory_lots ?? []) add(row.image);
  return [...keys];
}

function upload(key, filePath, contentType) {
  const result = spawnSync(process.execPath, [
    wrangler, "r2", "object", "put", `${bucketName}/${key}`,
    "--file", filePath,
    "--content-type", contentType,
    "--cache-control", "public, max-age=31536000, immutable",
  ], { cwd: root, env: process.env, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Could not upload image ${key}.`);
  }
}

const tempDirectory = await mkdtemp(join(tmpdir(), "nhavuonnhovan-images-"));
try {
  const keys = collectImageKeys();
  for (const key of keys) {
    const response = await fetch(new URL(`/api/images/${key}`, sourceOrigin));
    if (!response.ok) throw new Error(`Could not download source image ${key}: ${response.status}.`);
    const filePath = join(tempDirectory, key);
    await writeFile(filePath, new Uint8Array(await response.arrayBuffer()));
    const contentType = response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
    upload(key, filePath, contentType);
    console.log(`Copied image ${key}.`);
  }
  console.log(`Copied ${keys.length} image(s) to R2.`);
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
