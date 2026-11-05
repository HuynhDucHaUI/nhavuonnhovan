import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicLotTypes, publicLotsPage } from "../data";
import { LotCard } from "../page";

export const dynamic = "force-dynamic";
const perPage = 9;

export default async function WholesaleLotsPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string }> }) {
  const { page: rawPage, type } = await searchParams;
  const types = await publicLotTypes();
  const selectedType = type && types.includes(type) ? type : "";
  const requestedPage = Math.max(1, Number(rawPage) || 1);
  const { items: lots, total } = await publicLotsPage(requestedPage, perPage, selectedType);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.max(1, Math.min(pageCount, Number(rawPage) || 1));
  const shown = page === requestedPage ? lots : (await publicLotsPage(page, perPage, selectedType)).items;
  const path = `/lo-si${selectedType ? `?type=${encodeURIComponent(selectedType)}` : ""}`;

  return <><SiteHeader /><main className="listing-page"><div className="wrap">
    <a className="back-link" href="/">← Về trang chủ</a>
    <p className="eyebrow green">BÁN SỈ THEO LÔ / LUỐNG</p>
    <h1>Chọn lô cây <em>theo nhu cầu.</em></h1>
    <p className="listing-intro">Các lô đang còn hàng được nhà vườn cập nhật để khách đặt số lượng lớn. Số lượng tồn cụ thể sẽ được tư vấn khi liên hệ.</p>
    <form className="lot-filters" action="/lo-si">
      <label>Loại cây<select name="type" defaultValue={selectedType}><option value="">Tất cả loại cây</option>{types.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      <button className="button dark" type="submit">Lọc lô</button>
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
