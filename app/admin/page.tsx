import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "./auth";
import { EntryManager } from "./entry-manager";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await requireAdmin();
  const db = getDb();
  const [items, settingRows] = await Promise.all([
    db.select().from(entries).orderBy(desc(entries.id)),
    db.select().from(settings),
  ]);
  const saved = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
  const contact = { phone: saved.phone || "0389982886", phone2: saved.phone2 || "0929623366", zalo: saved.zalo || "https://zalo.me/0389982886", facebook: saved.facebook || "https://www.facebook.com/profile.php?id=61554829266477", map: saved.map || "https://maps.app.goo.gl/cvyNhEr1g2qzNuBS8" };
  return <EntryManager items={items} contact={contact} user={{ displayName: user.displayName, role: user.role }} />;
}
