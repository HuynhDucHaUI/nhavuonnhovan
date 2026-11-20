import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicPlantsPage } from "../data";
import { PlantCard } from "../page";
import Link from "next/link";

export const dynamic = "force-dynamic";
const perPage = 9;

export default async function PlantsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const parsedPage = Number(rawPage);
  const requested = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result = await publicPlantsPage(requested, perPage, {});
  const pageCount = Math.max(1, Math.ceil(result.total / perPage));
  const page = Math.min(requested, pageCount);
  const shown = page === requested ? result.items : (await publicPlantsPage(page, perPage, {})).items;
  const link = (n: number) => `/cay-quat?page=${n}`;

  return <><SiteHeader/><main className="listing-page collection-page"><div className="wrap">
    <nav className="collection-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">›</span><span aria-current="page">Cây quất</span></nav>
    <h1>Cây quất tại nhà vườn</h1>
    {shown.length ? <><p className="listing-intro">{result.total} cây quất.</p><div className="grid listing-grid">{shown.map(item => <PlantCard item={item} key={item.id}/>)}</div></> : <p className="listing-intro">Nhà vườn đang cập nhật danh sách cây. Vui lòng liên hệ để được tư vấn.</p>}
    {pageCount > 1 && <nav className="public-pagination" aria-label="Phân trang">{page > 1 && <a href={link(page - 1)}>← Trước</a>}<span>Trang {page} / {pageCount}</span>{page < pageCount && <a href={link(page + 1)}>Sau →</a>}</nav>}
  </div></main><SiteFooter/></>;
}
