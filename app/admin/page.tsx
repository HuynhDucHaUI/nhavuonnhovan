import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { entries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { EntryManager } from "./entry-manager";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await requireChatGPTUser("/admin");
  const admin = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  if (!admin || admin.toLowerCase() !== user.email.toLowerCase()) {
    return <main className="access-denied"><div><p>NHÀ VƯỜN NHO VĂN</p><h1>Bạn chưa có quyền quản trị</h1><span>Tài khoản {user.email} chưa được cấp quyền vào khu vực này.</span><a href="/">Về trang chủ</a></div></main>;
  }
  const items = await getDb().select().from(entries).orderBy(desc(entries.id));
  return <EntryManager items={items} logoutPath={chatGPTSignOutPath("/")} />;
}
