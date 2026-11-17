import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicLotTypes, publicLotsPage } from "../data";
import { LotCard } from "../page";
import Link from "next/link";

export const dynamic = "force-dynamic";
const perPage = 9;

export default async function WholesaleLotsPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string; q?: string }> }) {
  const { page: rawPage, type, q: rawQuery } = await searchParams;
  const q = (rawQuery || "").trim().slice(0, 100);
  const types = await publicLotTypes();
  const selectedType = type && types.includes(type) ? type : "";
  const parsedPage = Number(rawPage);
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { items: lots, total } = await publicLotsPage(requestedPage, perPage, selectedType, q);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(pageCount, requestedPage);
  const shown = page === requestedPage ? lots : (await publicLotsPage(page, perPage, selectedType, q)).items;
  const params = new URLSearchParams(); if (selectedType) params.set("type", selectedType); if (q) params.set("q", q);
  const path = `/lo-si${params.size ? `?${params}` : ""}`;

  return <><SiteHeader /><main className="listing-page"><div className="wrap">
    <Link className="back-link" href="/">← Về trang chủ</Link>
    <p className="eyebrow green">BÁN SỈ THEO LÔ / LUỐNG</p>
    <h1>Chọn lô cây <em>theo nhu cầu.</em></h1>
    <p className="listing-intro">Các lô đang còn hàng được nhà vườn cập nhật để khách đặt số lượng lớn. Số lượng tồn cụ thể sẽ được tư vấn khi liên hệ.</p>
    <form className="lot-filters" action="/lo-si">
      <label>Tên hoặc mã lô<input name="q" defaultValue={q} maxLength={100} /></label>
      <label>Loại cây<select name="type" defaultValue={selectedType}><option value="">Tất cả loại cây</option>{types.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      <button className="button dark" type="submit">Lọc lô</button>
      <a href="/lo-si">Xóa bộ lọc</a>
    </form>
    {shown.length ? <div className="lot-grid">{shown.map((lot) => <LotCard lot={lot} key={lot.id} />)}</div> : <p className="muted">Chưa có lô cây phù hợp đang được chào bán.</p>}
    <Pagination page={page} pageCount={pageCount} path={path} />
  </div></main><SiteFooter /></>;
}

function Pagination({ page, pageCount, path }: { page: number; pageCount: number; path: string }) {
  if (pageCount <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  return <nav className="public-pagination" aria-label="Phân trang"><a className={page === 1 ? "disabled" : ""} href={page === 1 ? undefined : `${path}${separator}page=${page - 1}`}>← Trước</a>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <a key={number} className={number === page ? "active" : ""} href={`${path}${separator}page=${number}`}>{number}</a>)}<a className={page === pageCount ? "disabled" : ""} href={page === pageCount ? undefined : `${path}${separator}page=${page + 1}`}>Sau →</a></nav>;
}
