const apiBase = "https://api.cloudflare.com/client/v4";
const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME;
const workerName = process.env.CLOUDFLARE_WORKER_NAME;

if (!token || !zoneName || !workerName) {
  throw new Error("Missing Cloudflare deployment configuration.");
}

async function cloudflare(path, init = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    const message = body.errors?.map((error) => error.message).join("; ") || `Cloudflare request failed (${response.status}).`;
    throw new Error(message);
  }
  return body.result;
}

const zones = await cloudflare(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=1`);
const zone = zones[0];
if (!zone) throw new Error(`Active zone not found for ${zoneName}.`);

const pattern = `${zoneName}/*`;
const routes = await cloudflare(`/zones/${zone.id}/workers/routes`);
const existingRoute = routes.find((route) => route.pattern === pattern);
if (existingRoute?.script === workerName) {
  await cloudflare(`/zones/${zone.id}/workers/routes/${existingRoute.id}`, { method: "DELETE" });
  console.log(`Superseded Worker route removed for ${pattern}.`);
} else if (existingRoute) {
  throw new Error(`Route ${pattern} belongs to another Worker and was not changed.`);
} else {
  console.log(`No superseded Worker route exists for ${pattern}.`);
}
