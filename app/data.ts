import { and, asc, count, desc, eq, gt } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { entries, inventoryLots, settings } from "@/db/schema";

export const PUBLIC_ENTRY_TAG = "public-entries";
export const PUBLIC_LOT_TAG = "public-lots";
export const PUBLIC_SETTINGS_TAG = "public-settings";
export type PublicEntryKind = "plant" | "article";

const defaultContact = {
  phone: "0389982886",
  phone2: "0929623366",
  map: "https://maps.app.goo.gl/cvyNhEr1g2qzNuBS8",
  zalo: "https://zalo.me/0389982886",
  facebook: "https://www.facebook.com/profile.php?id=61554829266477",
};

function contactFrom(rows: { key: string; value: string }[]) {
  return {
    ...defaultContact,
    ...Object.fromEntries(rows.filter((row) => row.value.trim()).map((row) => [row.key, row.value])),
  };
}

export async function publicContact() {
  return unstable_cache(async () => contactFrom(await getDb().select().from(settings)), ["public-contact"], {
    tags: [PUBLIC_SETTINGS_TAG], revalidate: 300,
  })();
}

export async function latestPublicEntries(kind: PublicEntryKind, limit = 3) {
  return unstable_cache(async () => getDb().select().from(entries)
    .where(and(eq(entries.published, 1), eq(entries.kind, kind)))
    .orderBy(desc(entries.id)).limit(limit), ["latest-public-entries", kind, String(limit)], {
    tags: [PUBLIC_ENTRY_TAG], revalidate: 60,
  })();
}

export async function publicEntriesPage(kind: PublicEntryKind, page: number, perPage: number) {
  const safePage = Math.max(1, page);
  return unstable_cache(async () => {
    const where = and(eq(entries.published, 1), eq(entries.kind, kind));
    const db = getDb();
    const [items, total] = await Promise.all([
      db.select().from(entries).where(where).orderBy(desc(entries.id)).limit(perPage).offset((safePage - 1) * perPage),
      db.select({ value: count() }).from(entries).where(where),
    ]);
    return { items, total: total[0]?.value || 0 };
  }, ["public-entry-page", kind, String(safePage), String(perPage)], {
    tags: [PUBLIC_ENTRY_TAG], revalidate: 60,
  })();
}

export async function publicEntry(id: number) {
  return unstable_cache(async () => getDb().select().from(entries)
    .where(and(eq(entries.id, id), eq(entries.published, 1))).limit(1)
    .then((rows) => rows[0] || null), ["public-entry", String(id)], {
    tags: [PUBLIC_ENTRY_TAG], revalidate: 60,
  })();
}

export async function latestPublicLots(limit = 3) {
  return publicLotsPage(1, limit).then(({ items }) => items);
}

export async function publicLotsPage(page: number, perPage: number, plantType?: string) {
  const safePage = Math.max(1, page);
  const normalizedType = plantType?.trim() || "";
  return unstable_cache(async () => {
    const where = and(
      eq(inventoryLots.published, 1),
      eq(inventoryLots.status, "available"),
      gt(inventoryLots.quantityRemaining, 0),
      ...(normalizedType ? [eq(inventoryLots.plantType, normalizedType)] : []),
    );
    const db = getDb();
    const [items, total] = await Promise.all([
      db.select({
        id: inventoryLots.id, code: inventoryLots.code, title: inventoryLots.title,
        plantType: inventoryLots.plantType, sizeOrAge: inventoryLots.sizeOrAge,
        location: inventoryLots.location, minimumOrderQuantity: inventoryLots.minimumOrderQuantity,
        unit: inventoryLots.unit, wholesalePrice: inventoryLots.wholesalePrice,
        image: inventoryLots.image, description: inventoryLots.description,
        createdAt: inventoryLots.createdAt, updatedAt: inventoryLots.updatedAt,
      }).from(inventoryLots).where(where).orderBy(desc(inventoryLots.createdAt)).limit(perPage).offset((safePage - 1) * perPage),
      db.select({ value: count() }).from(inventoryLots).where(where),
    ]);
    return { items, total: total[0]?.value || 0 };
  }, ["public-lot-page", String(safePage), String(perPage), normalizedType], {
    tags: [PUBLIC_LOT_TAG], revalidate: 60,
  })();
}

export async function publicLot(id: number) {
  return unstable_cache(async () => getDb().select({
    id: inventoryLots.id, code: inventoryLots.code, title: inventoryLots.title,
    plantType: inventoryLots.plantType, sizeOrAge: inventoryLots.sizeOrAge,
    location: inventoryLots.location, minimumOrderQuantity: inventoryLots.minimumOrderQuantity,
    unit: inventoryLots.unit, wholesalePrice: inventoryLots.wholesalePrice,
    image: inventoryLots.image, description: inventoryLots.description,
    createdAt: inventoryLots.createdAt, updatedAt: inventoryLots.updatedAt,
  }).from(inventoryLots).where(and(
    eq(inventoryLots.id, id), eq(inventoryLots.published, 1),
    eq(inventoryLots.status, "available"), gt(inventoryLots.quantityRemaining, 0),
  )).limit(1).then((rows) => rows[0] || null), ["public-lot", String(id)], {
    tags: [PUBLIC_LOT_TAG], revalidate: 60,
  })();
}

export async function publicLotTypes() {
  return unstable_cache(async () => (await getDb().select({ plantType: inventoryLots.plantType }).from(inventoryLots).where(and(
    eq(inventoryLots.published, 1), eq(inventoryLots.status, "available"), gt(inventoryLots.quantityRemaining, 0),
  )).groupBy(inventoryLots.plantType).orderBy(asc(inventoryLots.plantType))).map((row) => row.plantType), ["public-lot-types"], {
    tags: [PUBLIC_LOT_TAG], revalidate: 60,
  })();
}

/** Lightweight sitemap input. Only public URLs are returned. */
export async function publicSitemapData() {
  return unstable_cache(async () => {
    const db = getDb();
    const [publishedEntries, publishedLots] = await Promise.all([
      db.select({ id: entries.id, createdAt: entries.createdAt }).from(entries).where(eq(entries.published, 1)),
      db.select({ id: inventoryLots.id, updatedAt: inventoryLots.updatedAt }).from(inventoryLots).where(and(eq(inventoryLots.published, 1), eq(inventoryLots.status, "available"), gt(inventoryLots.quantityRemaining, 0))),
    ]);
    return { entries: publishedEntries, lots: publishedLots };
  }, ["public-sitemap"], { tags: [PUBLIC_ENTRY_TAG, PUBLIC_LOT_TAG], revalidate: 300 })();
}
