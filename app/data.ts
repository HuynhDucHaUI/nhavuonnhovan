import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { entries, inventoryLots, settings } from "@/db/schema";

const defaultContact = {
  phone: "0389982886",
  phone2: "0929623366",
  map: "https://maps.app.goo.gl/cvyNhEr1g2qzNuBS8",
  zalo: "",
};

function contactFrom(rows: { key: string; value: string }[]) {
  return { ...defaultContact, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) };
}

export async function publicData() {
  const db = getDb();
  const [items, config] = await Promise.all([
    db.select().from(entries).where(eq(entries.published, 1)).orderBy(desc(entries.id)),
    db.select().from(settings),
  ]);
  return { items, config: contactFrom(config) };
}

/** Public lots deliberately omit exact stock quantities. */
export async function publicLots() {
  const db = getDb();
  return db.select({
    id: inventoryLots.id,
    code: inventoryLots.code,
    title: inventoryLots.title,
    plantType: inventoryLots.plantType,
    sizeOrAge: inventoryLots.sizeOrAge,
    location: inventoryLots.location,
    minimumOrderQuantity: inventoryLots.minimumOrderQuantity,
    unit: inventoryLots.unit,
    wholesalePrice: inventoryLots.wholesalePrice,
    image: inventoryLots.image,
    description: inventoryLots.description,
    createdAt: inventoryLots.createdAt,
  }).from(inventoryLots)
    .where(and(
      eq(inventoryLots.published, 1),
      eq(inventoryLots.status, "available"),
      gt(inventoryLots.quantityRemaining, 0),
    ))
    .orderBy(desc(inventoryLots.createdAt));
}
