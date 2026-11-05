import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { adminUsers, inventoryLots, inventoryMovements } from "@/db/schema";
import { requireAdmin } from "../../auth";
import { deleteLotAction, recordMovementAction } from "../actions";
import { LotsAdminFrame, Notice } from "../ui";

export const dynamic = "force-dynamic";

export default async function LotDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const [user, messages] = await Promise.all([requireAdmin(`/admin/lots/${id}`), searchParams]);
  const db = getDb();
  const lot = await db.select().from(inventoryLots).where(eq(inventoryLots.id, id)).limit(1).then((rows) => rows[0]);
  if (!lot) notFound();
  const movements = await db.select({ movement: inventoryMovements, username: adminUsers.username, displayName: adminUsers.displayName })
    .from(inventoryMovements).leftJoin(adminUsers, eq(inventoryMovements.actorUserId, adminUsers.id))
    .where(eq(inventoryMovements.lotId, id)).orderBy(desc(inventoryMovements.createdAt));
  const hasNonInitialMovement = movements.some(({ movement }) => movement.note !== "Tạo lô mới");

  return <LotsAdminFrame user={user} title="Chi tiết lô"><main className="lots-content"><div className="lots-heading"><div><p>LÔ {lot.code}</p><h1>{lot.title}</h1></div><div className="lots-actions"><Link className="lots-secondary" href="/admin/lots">← Danh sách</Link><Link className="lots-primary" href={`/admin/lots/${id}/edit`}>Chỉnh sửa lô</Link></div></div><Notice notice={messages.notice} error={messages.error} /><section className="lots-card">{lot.image && <img className="detail-image" src={lot.image} alt={lot.title} />}<div className="detail-summary"><div><span>Tồn hiện tại</span><b>{lot.quantityRemaining} {lot.unit}</b></div><div><span>Trạng thái</span><b>{lot.status === "available" ? "Còn hàng" : "Tạm hết hàng"}</b></div><div><span>Mua tối thiểu</span><b>{lot.minimumOrderQuantity} {lot.unit}</b></div><div><span>Vị trí luống</span><b>{lot.location || "—"}</b></div></div><p className="detail-description">{lot.description || "Chưa có mô tả cho lô này."}</p></section><section className="movement-layout"><section className="lots-card"><h2>Ghi nhận giao dịch kho</h2><p className="listing-intro">Bán làm giảm tồn. Điều chỉnh dùng số dương để tăng và số âm để giảm.</p><form action={recordMovementAction} className="movement-form"><input type="hidden" name="lot_id" value={id} /><label>Loại giao dịch<select name="type"><option value="sale">Bán sỉ</option><option value="in">Nhập thêm</option><option value="adjust">Điều chỉnh</option></select></label><label>Số lượng<input name="quantity" type="number" required placeholder="Ví dụ: 30 (điều chỉnh có thể âm)" /></label><label>Ghi chú<input name="note" maxLength={500} placeholder="Ví dụ: Đơn anh Nam, lấy ngày..." /></label><button className="lots-primary" type="submit">Lưu giao dịch</button></form></section><section className="lots-card"><h2>Lịch sử tồn kho</h2><table className="movement-table"><thead><tr><th>Thời gian</th><th>Loại</th><th>Số lượng</th><th>Ghi chú</th></tr></thead><tbody>{movements.map(({ movement, username, displayName }) => <tr key={movement.id}><td>{new Date(movement.createdAt).toLocaleString("vi-VN")}</td><td>{movement.type === "sale" ? "Bán" : movement.type === "in" ? "Nhập" : "Điều chỉnh"}<br /><small>{displayName || username || "Tài khoản đã xóa"}</small></td><td className={movement.quantity > 0 ? "movement-positive" : "movement-negative"}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</td><td>{movement.note || "—"}</td></tr>)}</tbody></table></section></section>{user.role === "owner" && <section className="lots-card" style={{ marginTop: 20 }}><h2>Xóa lô</h2><p className="listing-intro">Chỉ xóa được lô chưa có giao dịch nhập, bán hoặc điều chỉnh ngoài lượt tạo ban đầu.</p><form action={deleteLotAction}><input type="hidden" name="lot_id" value={id} /><button className="lots-danger" type="submit" disabled={hasNonInitialMovement}>Xóa lô này</button>{hasNonInitialMovement && <p className="low-stock">Lô này đã phát sinh giao dịch nên không thể xóa.</p>}</form></section>}</main></LotsAdminFrame>;
}
