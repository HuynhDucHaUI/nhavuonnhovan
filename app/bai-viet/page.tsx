import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicEntriesPage } from "../data";
import { ArticleCard } from "../page";

export const dynamic = "force-dynamic";
const perPage = 9;

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const requestedPage = Math.max(1, Number(rawPage) || 1);
  const { items: articles, total } = await publicEntriesPage("article", requestedPage, perPage);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.max(1, Math.min(pageCount, Number(rawPage) || 1));
  const shown = page === requestedPage ? articles : (await publicEntriesPage("article", page, perPage)).items;
  return <><SiteHeader/><main className="listing-page collection-page"><div className="wrap">
    <nav className="collection-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">›</span><span aria-current="page">Bài viết</span></nav>
    <h1>Bài viết từ nhà vườn</h1>
    {shown.length ? <><p className="listing-intro">{total} bài viết.</p><div className="article-list">{shown.map((item) => <ArticleCard item={item} key={item.id}/>)}</div></> : <p className="listing-intro">Chưa có bài viết được xuất bản.</p>}
    <Pagination page={page} pageCount={pageCount} path="/bai-viet"/>
  </div></main><SiteFooter/></>;
}

function Pagination({ page, pageCount, path }: { page: number; pageCount: number; path: string }) {
  if (pageCount <= 1) return null;
  return <nav className="public-pagination" aria-label="Phân trang"><a className={page === 1 ? "disabled" : ""} href={page === 1 ? undefined : path+"?page="+(page-1)}>← Trước</a>{Array.from({length:pageCount},(_,index) => index+1).map((number) => <a key={number} className={number === page ? "active" : ""} href={path+"?page="+number}>{number}</a>)}<a className={page === pageCount ? "disabled" : ""} href={page === pageCount ? undefined : path+"?page="+(page+1)}>Sau →</a></nav>;
}
