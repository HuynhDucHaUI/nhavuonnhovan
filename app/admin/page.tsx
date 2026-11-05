import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin } from "./auth";
import { EntryManager } from "./entry-manager";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await requireChatGPTUser("/admin");
  if (!(await isAdmin())) {
    return <main className="access-denied"><div><p>NHÀ VƯỜN NHO VĂN</p><h1>Bạn chưa có quyền quản trị</h1><span>Tài khoản {user.email} chưa được cấp quyền vào khu vực này.</span><a href="/">Về trang chủ</a></div></main>;
  }
  const db = getDb();
  const [items, settingRows] = await Promise.all([
    db.select().from(entries).orderBy(desc(entries.id)),
    db.select().from(settings),
  ]);
  const saved = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
  const contact = {
    phone: saved.phone || "0389982886",
    phone2: saved.phone2 || "0929623366",
    zalo: saved.zalo || "",
    map: saved.map || "https://maps.app.goo.gl/cvyNhEr1g2qzNuBS8",
  };
  return <EntryManager items={items} contact={contact} logoutPath={chatGPTSignOutPath("/")} />;
}
