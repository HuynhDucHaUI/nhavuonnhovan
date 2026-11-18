"use server";

import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { inventoryLots } from "@/db/schema";
import { requireAdmin, requireOwner } from "../auth";
import { PUBLIC_LOT_TAG } from "@/app/data";

const lotPath = "/admin/lots";
const codePattern = /^[A-Z0-9][A-Z0-9_-]{2,39}$/;

function text(formData: FormData, key: string, max = 500) { return String(formData.get(key) || "").trim().slice(0, max); }
function positiveInteger(value: FormDataEntryValue | null, field: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${field} phải là số nguyên lớn hơn 0.`);
  return parsed;
}
function signedInteger(value: FormDataEntryValue | null, field: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed === 0) throw new Error(`${field} phải là số nguyên khác 0.`);
  return parsed;
}
function id(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error("Lô cây không hợp lệ.");
  return parsed;
}
function imageUrl(value: string) {
  if (!value) return "";
  if (/^\/api\/images\/[0-9a-f-]{36}$/.test(value)) return value;
  try { const parsed = new URL(value); return parsed.protocol === "https:" ? parsed.toString() : ""; } catch { return ""; }
}
function galleryValues(formData: FormData) {
  let raw: unknown;
  try { raw = JSON.parse(text(formData, "gallery", 30000) || "[]"); } catch { throw new Error("Danh sách ảnh không hợp lệ."); }
  if (!Array.isArray(raw) || raw.length > 10 || raw.some((item) => typeof item !== "string" || !imageUrl(item))) throw new Error("Danh sách ảnh không hợp lệ.");
  return [...new Set(raw.map((item: string) => imageUrl(item)))];
}
async function lotValues(formData: FormData) {
  const code = text(formData, "code", 40).toUpperCase();
  const title = text(formData, "title", 150);
  const plantType = text(formData, "plant_type", 100);
  if (!codePattern.test(code)) throw new Error("Mã lô gồm 3–40 ký tự: chữ in hoa, số, gạch ngang hoặc gạch dưới.");
  if (!title || !plantType) throw new Error("Cần nhập tên lô và loại/dáng cây.");
  const gallery = galleryValues(formData);
  const photoDate = text(formData, "photo_date", 10);
  if (photoDate && !/^\d{4}-\d{2}-\d{2}$/.test(photoDate)) throw new Error("Ngày chụp không hợp lệ.");
  return {
    code, title, plantType,
    sizeOrAge: text(formData, "size_or_age", 120),
    location: text(formData, "location", 120),
    minimumOrderQuantity: positiveInteger(formData.get("minimum_order_quantity"), "Mức mua tối thiểu"),
    unit: text(formData, "unit", 20) || "cây",
    wholesalePrice: text(formData, "wholesale_price", 100),
    image: gallery[0] || "", gallery: JSON.stringify(gallery), photoDate,
    description: text(formData, "description", 4000),
    published: formData.get("published") ? 1 : 0,
  };
}
function go(path: string, key: "notice" | "error", message: string): never { redirect(`${path}?${key}=${encodeURIComponent(message)}`); }
function revalidateLot(id?: number) {
  updateTag(PUBLIC_LOT_TAG);
  revalidatePath("/"); revalidatePath("/lo-si"); revalidatePath(lotPath);
  if (id) { revalidatePath(`/lo/${id}`); revalidatePath(`${lotPath}/${id}`); }
}

export async function createLotAction(formData: FormData) {
  const actor = await requireAdmin(`${lotPath}/new`);
  try {
    if (!env.DB) throw new Error("Cơ sở dữ liệu chưa sẵn sàng.");
    const values = await lotValues(formData);
    const quantity = positiveInteger(formData.get("initial_quantity"), "Số lượng ban đầu");
    const now = new Date().toISOString();
    const result = await env.DB.batch([
      env.DB.prepare(`INSERT INTO inventory_lots (code,title,plant_type,size_or_age,location,initial_quantity,quantity_remaining,minimum_order_quantity,unit,wholesale_price,image,gallery,photo_date,description,status,published,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(values.code, values.title, values.plantType, values.sizeOrAge, values.location, quantity, quantity, values.minimumOrderQuantity, values.unit, values.wholesalePrice, values.image, values.gallery, values.photoDate, values.description, "available", values.published, now, now),
      env.DB.prepare(`INSERT INTO inventory_movements (lot_id,type,quantity,note,actor_user_id,created_at) SELECT id,'in',?,?,?,? FROM inventory_lots WHERE code=? AND created_at=?`).bind(quantity, "Tạo lô mới", actor.id, now, values.code, now),
    ]);
    if (result[0].meta.changes !== 1 || result[1].meta.changes !== 1) throw new Error("Không thể tạo lô.");
  } catch (cause) {
    go(`${lotPath}/new`, "error", cause instanceof Error ? cause.message : "Không thể tạo lô cây.");
  }
  revalidateLot();
  go(lotPath, "notice", "Đã tạo lô và ghi nhận tồn kho ban đầu.");
}

export async function updateLotAction(formData: FormData) {
  await requireAdmin();
  const lotId = id(formData.get("lot_id"));
  try {
    const values = await lotValues(formData);
    const updated = await getDb().update(inventoryLots).set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(inventoryLots.id, lotId)).returning({ id: inventoryLots.id });
    if (!updated.length) throw new Error("Lô cây không còn tồn tại.");
  } catch (cause) {
    go(`${lotPath}/${lotId}/edit`, "error", cause instanceof Error ? cause.message : "Không thể cập nhật lô cây.");
  }
  revalidateLot(lotId);
  go(`${lotPath}/${lotId}`, "notice", "Đã cập nhật thông tin lô. Số tồn chỉ thay đổi bằng giao dịch kho.");
}

export async function recordMovementAction(formData: FormData) {
  const actor = await requireAdmin();
  const lotId = id(formData.get("lot_id"));
  try {
    if (!env.DB) throw new Error("Cơ sở dữ liệu chưa sẵn sàng.");
    const type = text(formData, "type", 20);
    const rawQuantity = type === "adjust" ? signedInteger(formData.get("quantity"), "Số điều chỉnh") : positiveInteger(formData.get("quantity"), "Số lượng");
    if (!(["in", "sale", "adjust"] as string[]).includes(type)) throw new Error("Loại giao dịch không hợp lệ.");
    const delta = type === "sale" ? -rawQuantity : rawQuantity;
    const note = text(formData, "note", 500);
    const now = new Date().toISOString();
    const statement = env.DB.prepare(`UPDATE inventory_lots SET quantity_remaining = quantity_remaining + ?, status = CASE WHEN quantity_remaining + ? = 0 THEN 'sold_out' ELSE 'available' END, updated_at = ? WHERE id = ? AND quantity_remaining + ? >= 0`).bind(delta, delta, now, lotId, delta);
    const movement = env.DB.prepare(`INSERT INTO inventory_movements (lot_id,type,quantity,note,actor_user_id,created_at) SELECT id,?,?,?,?,? FROM inventory_lots WHERE id=? AND updated_at=?`).bind(type, delta, note, actor.id, now, lotId, now);
    const result = await env.DB.batch([statement, movement]);
    if (result[0].meta.changes !== 1 || result[1].meta.changes !== 1) throw new Error(type === "sale" ? "Không thể bán vượt số lượng tồn." : "Không thể ghi nhận giao dịch kho.");
  } catch (cause) {
    go(`${lotPath}/${lotId}`, "error", cause instanceof Error ? cause.message : "Không thể ghi nhận giao dịch.");
  }
  revalidateLot(lotId);
  go(`${lotPath}/${lotId}`, "notice", "Đã ghi nhận giao dịch tồn kho.");
}

export async function deleteLotAction(formData: FormData) {
  await requireOwner(lotPath);
  const lotId = id(formData.get("lot_id"));
  try {
    if (!env.DB) throw new Error("Cơ sở dữ liệu chưa sẵn sàng.");
    // D1 executes the guarded deletes atomically, preventing an intervening movement.
    const result = await env.DB.batch([
      env.DB.prepare(`DELETE FROM inventory_movements WHERE lot_id = ? AND type = 'in' AND note = ? AND EXISTS (SELECT 1 FROM inventory_lots WHERE id = ? AND quantity_remaining = initial_quantity AND inventory_movements.quantity = initial_quantity AND inventory_movements.created_at = inventory_lots.created_at) AND (SELECT count(*) FROM inventory_movements WHERE lot_id = ?) = 1`).bind(lotId, "Tạo lô mới", lotId, lotId),
      env.DB.prepare(`DELETE FROM inventory_lots WHERE id = ? AND quantity_remaining = initial_quantity AND NOT EXISTS (SELECT 1 FROM inventory_movements WHERE lot_id = ?)`).bind(lotId, lotId),
    ]);
    if (result[1].meta.changes !== 1) throw new Error("Không thể xóa lô không tồn tại hoặc đã có lịch sử giao dịch kho.");
  } catch (cause) {
    console.error("Không thể xóa lô:", cause);
    go(`${lotPath}/${lotId}`, "error", "Không thể xóa lô không tồn tại hoặc đã có lịch sử giao dịch kho.");
  }
  revalidateLot(lotId);
  go(lotPath, "notice", "Đã xóa lô chưa phát sinh giao dịch.");
}
