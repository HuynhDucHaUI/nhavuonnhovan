import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicLotsPage } from "../data";
import { LotCard } from "../page";
import Link from "next/link";

export const dynamic = "force-dynamic";
const perPage = 9;

export default async function WholesaleLotsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const parsedPage = Number(rawPage);
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { items: lots, total } = await publicLotsPage(requestedPage, perPage);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(pageCount, requestedPage);
  const shown = page === requestedPage ? lots : (await publicLotsPage(page, perPage)).items;

  return <><SiteHeader /><main className="listing-page collection-page"><div className="wrap">
    <nav className="collection-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">›</span><span aria-current="page">Bán sỉ theo lô</span></nav>
    <h1>Bán sỉ quất theo lô</h1>
    <p className="listing-intro">Các lô đang còn hàng. Liên hệ nhà vườn để được tư vấn số lượng.</p>
    {shown.length ? <div className="lot-grid">{shown.map((lot) => <LotCard lot={lot} key={lot.id} />)}</div> : <p className="muted">Nhà vườn đang cập nhật danh sách lô cây. Vui lòng liên hệ để được tư vấn.</p>}
    <Pagination page={page} pageCount={pageCount} path="/lo-si" />
  </div></main><SiteFooter /></>;
}

function Pagination({ page, pageCount, path }: { page: number; pageCount: number; path: string }) {
  if (pageCount <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  return <nav className="public-pagination" aria-label="Phân trang"><a className={page === 1 ? "disabled" : ""} href={page === 1 ? undefined : `${path}${separator}page=${page - 1}`}>← Trước</a>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <a key={number} className={number === page ? "active" : ""} href={`${path}${separator}page=${number}`}>{number}</a>)}<a className={page === pageCount ? "disabled" : ""} href={page === pageCount ? undefined : `${path}${separator}page=${page + 1}`}>Sau →</a></nav>;
}
