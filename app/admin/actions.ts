"use server";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
async function authorize() {
 const user=await getChatGPTUser();
 const admin=(env as unknown as {ADMIN_EMAIL?:string}).ADMIN_EMAIL;
 if(!user || !admin || user.email.toLowerCase()!==admin.toLowerCase()) throw new Error("Không có quyền quản trị.");
}
function val(f:FormData,key:string,max=2000){return String(f.get(key)||"").trim().slice(0,max)}
function url(s:string){if(!s)return "";try {const u=new URL(s);return u.protocol==="https:"?u.toString():""}catch{return ""}}
export async function saveEntry(f:FormData){
 await authorize(); const title=val(f,"title",150);if(!title)throw new Error("Cần nhập tiêu đề.");
 const kind=val(f,"kind")==="article"?"article":"plant";const status=val(f,"status");
 const item={title,kind,code:val(f,"code",80),description:val(f,"description",12000),image:url(val(f,"image",2048)),price:val(f,"price",100),status:["available","sold","contact"].includes(status)?status:"contact",published:f.get("published")?1:0};
 const id=Number(f.get("id"));const db=getDb();if(Number.isSafeInteger(id)&&id>0) await db.update(entries).set(item).where(eq(entries.id,id));else await db.insert(entries).values({...item,createdAt:new Date().toISOString()});
 revalidatePath("/");revalidatePath("/admin");
}
export async function saveSettings(f:FormData){
 await authorize();const db=getDb();for(const key of ["phone","map","zalo"]){let value=val(f,key,2048);if(key!=="phone")value=url(value);else value=value.replace(/[^+0-9\s()-]/g,"");await db.insert(settings).values({key,value}).onConflictDoUpdate({target:settings.key,set:{value}})} revalidatePath("/");revalidatePath("/admin");
}
