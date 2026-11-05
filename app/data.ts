import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
export async function publicData() {const db=getDb(); const [items,config]=await Promise.all([db.select().from(entries).where(eq(entries.published,1)).orderBy(desc(entries.id)),db.select().from(settings)]); return {items, config:Object.fromEntries(config.map(x=>[x.key,x.value]))};}
