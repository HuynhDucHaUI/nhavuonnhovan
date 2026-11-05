import Link from "next/link";
import { requireAdmin } from "../../auth";
import { createLotAction } from "../actions";
import { LotForm, LotsAdminFrame, Notice } from "../ui";

export const dynamic = "force-dynamic";

export default async function NewLotPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [user, params] = await Promise.all([requireAdmin("/admin/lots/new"), searchParams]);
  return <LotsAdminFrame user={user} title="Thêm lô mới"><main className="lots-content"><div className="lots-heading"><div><p>QUẢN LÝ BÁN SỈ</p><h1>Thêm lô/luống mới</h1></div><Link className="lots-secondary" href="/admin/lots">← Danh sách lô</Link></div><Notice error={params.error} /><section className="lots-card"><LotForm action={createLotAction} submitLabel="Tạo lô và ghi nhận tồn kho" /></section></main></LotsAdminFrame>;
}
