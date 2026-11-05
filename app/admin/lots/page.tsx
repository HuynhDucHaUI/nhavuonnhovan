import Link from "next/link";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import { inventoryLots } from "@/db/schema";
import { requireAdmin } from "../auth";
import { LotsAdminFrame, Notice } from "./ui";

export const dynamic = "force-dynamic";
const perPage = 15;

export default async function LotsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string; notice?: string; error?: string }> }) {
  const [user, params] = await Promise.all([requireAdmin("/admin/lots"), searchParams]);
  const query = (params.q || "").trim().toLowerCase();
  const status = params.status === "available" || params.status === "sold_out" ? params.status : "";
  const filters = [
    ...(status ? [eq(inventoryLots.status, status)] : []),
    ...(query ? [or(like(inventoryLots.code, `%${query}%`), like(inventoryLots.title, `%${query}%`), like(inventoryLots.location, `%${query}%`), like(inventoryLots.plantType, `%${query}%`))] : []),
  ];
  const where = filters.length ? and(...filters) : undefined;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const db = getDb();
  const [lots, totalRows] = await Promise.all([
    db.select().from(inventoryLots).where(where).orderBy(desc(inventoryLots.updatedAt)).limit(perPage).offset((requestedPage - 1) * perPage),
    db.select({ value: count() }).from(inventoryLots).where(where),
  ]);
  const total = totalRows[0]?.value || 0;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.max(1, Math.min(pageCount, Number(params.page) || 1));
  const shown = page === requestedPage ? lots : await db.select().from(inventoryLots).where(where).orderBy(desc(inventoryLots.updatedAt)).limit(perPage).offset((page - 1) * perPage);
  const queryString = (number: number) => new URLSearchParams({ ...(query ? { q: params.q || "" } : {}), ...(status ? { status } : {}), page: String(number) }).toString();

  return <LotsAdminFrame user={user} title="Lô/luống & tồn kho"><main className="lots-content"><div className="lots-heading"><div><p>QUẢN LÝ BÁN SỈ</p><h1>Lô/luống & tồn kho</h1></div><Link className="lots-primary" href="/admin/lots/new">＋ Thêm lô mới</Link></div><Notice notice={params.notice} error={params.error} /><section className="lots-card"><form className="lots-filter" action="/admin/lots"><label>Tìm mã lô, tên lô hoặc vị trí<input name="q" defaultValue={params.q} placeholder="Ví dụ: LUONG-A01, khu A..." /></label><label>Trạng thái<select name="status" defaultValue={status}><option value="">Tất cả trạng thái</option><option value="available">Còn hàng</option><option value="sold_out">Tạm hết hàng</option></select></label><button className="lots-primary" type="submit">Lọc</button></form><div className="lots-table-wrap"><table className="lots-table"><thead><tr><th>Mã / tên lô</th><th>Loại cây</th><th>Vị trí</th><th>Tồn kho</th><th>Trạng thái</th><th>Hiển thị</th><th>Thao tác</th></tr></thead><tbody>{shown.length ? shown.map((lot) => { const low = lot.quantityRemaining > 0 && lot.quantityRemaining <= lot.minimumOrderQuantity; return <tr key={lot.id}><td><div className="lot-title"><b>{lot.title}</b><span>{lot.code} · tối thiểu {lot.minimumOrderQuantity} {lot.unit}</span></div></td><td>{lot.plantType}{lot.sizeOrAge && <><br /><small>{lot.sizeOrAge}</small></>}</td><td>{lot.location || "—"}</td><td><b>{lot.quantityRemaining} {lot.unit}</b>{low && <div className="low-stock">Sắp hết hàng</div>}</td><td><span className={lot.status === "available" ? "lot-status" : "lot-status sold"}>● {lot.status === "available" ? "Còn hàng" : "Tạm hết hàng"}</span></td><td>{lot.published ? "Công khai" : "Bản nháp"}</td><td><div className="lots-actions"><Link className="lots-secondary" href={`/admin/lots/${lot.id}`}>Chi tiết</Link><Link className="lots-secondary" href={`/admin/lots/${lot.id}/edit`}>Sửa</Link></div></td></tr>; }) : <tr><td colSpan={7}>Chưa có lô nào phù hợp.</td></tr>}</tbody></table></div><div className="lots-pagination"><span>{total ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)}` : "0"} của {total} lô</span>{pageCount > 1 && <span>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <Link key={number} className={number === page ? "active" : ""} href={`/admin/lots?${queryString(number)}`}>{number}</Link>)}</span>}</div></section></main></LotsAdminFrame>;
}
