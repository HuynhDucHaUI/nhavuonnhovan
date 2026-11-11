const apiBase = "https://api.cloudflare.com/client/v4";
const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME;

if (!token || !zoneName) {
  throw new Error("Missing Cloudflare deployment configuration.");
}

// These records belonged to the previous managed hosting provider. Restrict the
// migration to these exact addresses so customer-created DNS records stay intact.
const legacyOriginAddresses = new Set(["162.159.143.30", "172.66.3.26"]);

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

const records = await cloudflare(`/zones/${zone.id}/dns_records?name=${encodeURIComponent(zoneName)}&per_page=100`);
const legacyRecords = records.filter((record) => record.type === "A" && legacyOriginAddresses.has(record.content));

for (const record of legacyRecords) {
  await cloudflare(`/zones/${zone.id}/dns_records/${record.id}`, { method: "DELETE" });
}

console.log(`Removed ${legacyRecords.length} legacy managed-hosting apex record(s).`);
