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
  return <><SiteHeader/><main className="listing-page article-listing"><div className="wrap"><a className="back-link" href="/">← Về trang chủ</a><p className="eyebrow green">CHUYỆN TỪ NHÀ VƯỜN</p><h1>Góc nhỏ <em>chia sẻ.</em></h1><p className="listing-intro">Thông tin, kinh nghiệm và những câu chuyện về quất cảnh từ Nhà vườn Nho Văn.</p>{shown.length ? <div className="article-list">{shown.map((item) => <ArticleCard item={item} key={item.id}/>)}</div> : <p className="muted">Chưa có bài viết được xuất bản.</p>}<Pagination page={page} pageCount={pageCount} path="/bai-viet"/></div></main><SiteFooter/></>;
}

function Pagination({ page, pageCount, path }: { page: number; pageCount: number; path: string }) {
  if (pageCount <= 1) return null;
  return <nav className="public-pagination" aria-label="Phân trang"><a className={page === 1 ? "disabled" : ""} href={page === 1 ? undefined : path+"?page="+(page-1)}>← Trước</a>{Array.from({length:pageCount},(_,index) => index+1).map((number) => <a key={number} className={number === page ? "active" : ""} href={path+"?page="+number}>{number}</a>)}<a className={page === pageCount ? "disabled" : ""} href={page === pageCount ? undefined : path+"?page="+(page+1)}>Sau →</a></nav>;
}
