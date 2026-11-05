import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { inventoryLots } from "@/db/schema";
import { requireAdmin } from "../../../auth";
import { updateLotAction } from "../../actions";
import { LotForm, LotsAdminFrame, Notice } from "../../ui";

export const dynamic = "force-dynamic";

export default async function EditLotPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const [user, messages, lot] = await Promise.all([
    requireAdmin(`/admin/lots/${id}/edit`),
    searchParams,
    getDb().select().from(inventoryLots).where(eq(inventoryLots.id, id)).limit(1).then((rows) => rows[0]),
  ]);
  if (!lot) notFound();
  return <LotsAdminFrame user={user} title="Chỉnh sửa lô"><main className="lots-content"><div className="lots-heading"><div><p>LÔ {lot.code}</p><h1>Chỉnh sửa thông tin lô</h1></div><Link className="lots-secondary" href={`/admin/lots/${id}`}>← Chi tiết lô</Link></div><Notice error={messages.error} /><section className="lots-card"><LotForm lot={lot} action={updateLotAction} submitLabel="Lưu thông tin lô" /></section></main></LotsAdminFrame>;
}
