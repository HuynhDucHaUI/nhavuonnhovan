import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { saveSettings } from "./actions";
import { EntryManager } from "./entry-manager";
export const dynamic="force-dynamic";
export default async function Admin(){
 const user=await requireChatGPTUser("/admin"); const admin=(env as unknown as {ADMIN_EMAIL?:string}).ADMIN_EMAIL;
 if(!admin || admin.toLowerCase()!==user.email.toLowerCase())return <main className="wrap detail"><h1>Chưa có quyền quản trị</h1><p>Liên hệ chủ website để thiết lập tài khoản quản trị.</p><a href="/">Về trang chủ</a></main>;
 const db=getDb(); const [items,rows]=await Promise.all([db.select().from(entries).orderBy(desc(entries.id)),db.select().from(settings)]); const config={phone:"0389982886",phone2:"0929623366",map:"https://maps.app.goo.gl/cvyNhEr1g2qzNuBS8",zalo:"",...Object.fromEntries(rows.map(x=>[x.key,x.value]))};
 return <main className="wrap admin"><a href="/">← Xem website</a><h1>Quản trị nhà vườn</h1><p>Đăng nhập: {user.email}</p><section><h2>Thông tin liên hệ</h2><form action={saveSettings} className="form"><label>Điện thoại<input name="phone" defaultValue={config.phone}/></label><label>Điện thoại thứ hai<input name="phone2" defaultValue={config.phone2}/></label><label>Liên kết Zalo (https)<input name="zalo" type="url" defaultValue={config.zalo}/></label><label>Liên kết Google Maps (https)<input name="map" type="url" defaultValue={config.map}/></label><button>Lưu liên hệ</button></form></section><EntryManager items={items}/></main>
}
