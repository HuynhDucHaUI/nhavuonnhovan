const zoneName = process.env.CLOUDFLARE_ZONE_NAME;

if (!zoneName) {
  throw new Error("Missing CLOUDFLARE_ZONE_NAME.");
}

const productionUrl = `https://${zoneName}/`;
const expectedMarkers = ["mobile-navigation", "scroll-to-top"];
const maxAttempts = 12;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const response = await fetch(productionUrl, {
    headers: { "Cache-Control": "no-cache" },
  });
  const html = await response.text();
  const missingMarkers = expectedMarkers.filter((marker) => !html.includes(marker));

  if (response.ok && missingMarkers.length === 0) {
    console.log(`Verified live deployment at ${productionUrl}.`);
    process.exit(0);
  }

  if (attempt === maxAttempts) {
    throw new Error(`Public deployment check failed for ${productionUrl}: status ${response.status}, missing ${missingMarkers.join(", ") || "no markers"}.`);
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));
}
