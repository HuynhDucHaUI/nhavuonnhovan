"use server";
import { authorize, destroySession } from "./auth";
import { getDb } from "@/db";
import { entries, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PUBLIC_ENTRY_TAG, PUBLIC_SETTINGS_TAG } from "@/app/data";
function val(f:FormData,key:string,max=2000){return String(f.get(key)||"").trim().slice(0,max)}
function url(s:string){if(!s)return "";try {const u=new URL(s);return u.protocol==="https:"?u.toString():""}catch{return ""}}
function imageUrl(s:string){return /^\/api\/images\/[0-9a-f-]{36}$/.test(s)?s:url(s)}
export async function saveEntry(f:FormData){
 await authorize(); const title=val(f,"title",150);if(!title)throw new Error("Cần nhập tiêu đề.");
 const kind=val(f,"kind")==="article"?"article":"plant";const status=val(f,"status");
 const item={title,kind,code:val(f,"code",80),description:val(f,"description",12000),image:imageUrl(val(f,"image",2048)),price:val(f,"price",100),status:["available","sold","contact"].includes(status)?status:"contact",published:f.get("published")?1:0};
 const operation = val(f,"operation",20);
 const id=Number(f.get("id"));
 const db=getDb();
 if (operation === "update") {
   if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Không xác định được nội dung cần cập nhật. Hãy đóng cửa sổ và chọn Chỉnh sửa lại.");
   const updated=await db.update(entries).set(item).where(eq(entries.id,id)).returning({id:entries.id});
   if(!updated.length)throw new Error("Bài viết không còn tồn tại.");
 } else if (operation === "create") {
   await db.insert(entries).values({...item,createdAt:new Date().toISOString()});
 } else {
   throw new Error("Yêu cầu lưu nội dung không hợp lệ.");
 }
 updateTag(PUBLIC_ENTRY_TAG); revalidatePath("/");revalidatePath("/admin");
}
export async function deleteEntry(id:number){
 await authorize();
 if(!Number.isSafeInteger(id)||id<=0)throw new Error("Bài viết không hợp lệ.");
 const removed=await getDb().delete(entries).where(eq(entries.id,id)).returning({id:entries.id});
 if(!removed.length)throw new Error("Bài viết không còn tồn tại.");
 updateTag(PUBLIC_ENTRY_TAG); revalidatePath("/");revalidatePath("/admin");revalidatePath("/bai/"+id);
}
export async function saveSettings(f:FormData){
 await authorize();const db=getDb();for(const key of ["phone","phone2","map","zalo","facebook"]){let value=val(f,key,2048);if(key!=="phone"&&key!=="phone2")value=url(value);else value=value.replace(/[^+0-9\s()-]/g,"");await db.insert(settings).values({key,value}).onConflictDoUpdate({target:settings.key,set:{value}})} updateTag(PUBLIC_SETTINGS_TAG); revalidatePath("/");revalidatePath("/admin");
}

export async function logoutAction(){
 await destroySession();
 redirect("/admin/login");
}
