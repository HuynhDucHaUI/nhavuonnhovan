import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { publicPlantsPage, publicPlantShapes, type PlantFilters } from "../data";
import { PlantCard } from "../page";
import Link from "next/link";

export const dynamic = "force-dynamic";
const perPage = 9;
type Params = { page?: string; q?: string; status?: string; shape?: string; minHeight?: string; maxHeight?: string; minPrice?: string; maxPrice?: string };
function number(value?: string) { if (!value || !/^\d+$/.test(value)) return undefined; const n = Number(value); return Number.isSafeInteger(n) ? n : undefined; }
export default async function PlantsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const filters: PlantFilters = { q: (p.q || "").trim().slice(0, 100), status: ["available", "sold", "contact"].includes(p.status || "") ? p.status : "", shape: (p.shape || "").slice(0, 100), minHeight: number(p.minHeight), maxHeight: number(p.maxHeight), minPrice: number(p.minPrice), maxPrice: number(p.maxPrice) };
  const requested = number(p.page) || 1;
  const [result, shapes] = await Promise.all([publicPlantsPage(requested, perPage, filters), publicPlantShapes()]);
  const pageCount = Math.max(1, Math.ceil(result.total / perPage));
  const page = Math.min(requested, pageCount);
  const shown = page === requested ? result.items : (await publicPlantsPage(page, perPage, filters)).items;
  function link(n: number) { const params = new URLSearchParams(); for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== "") params.set(key, String(value)); params.set("page", String(n)); return `/cay-quat?${params}`; }
  return <><SiteHeader/><main className="listing-page"><div className="wrap"><Link className="back-link" href="/">← Về trang chủ</Link><p className="eyebrow green">CÂY QUẤT TẠI NHÀ VƯỜN</p><h1>Chọn một cây <em>thật ưng ý.</em></h1>
    <form className="lot-filters" action="/cay-quat">
      <label>Tên hoặc mã cây<input name="q" defaultValue={filters.q} maxLength={100} /></label>
      <label>Trạng thái<select name="status" defaultValue={filters.status}><option value="">Tất cả</option><option value="available">Còn tại vườn</option><option value="contact">Liên hệ</option><option value="sold">Đã bán</option></select></label>
      <label>Dáng cây<select name="shape" defaultValue={filters.shape}><option value="">Tất cả</option>{shapes.map(shape => <option key={shape}>{shape}</option>)}</select></label>
      <label>Cao từ (cm)<input type="number" name="minHeight" min="0" defaultValue={filters.minHeight} /></label><label>Đến (cm)<input type="number" name="maxHeight" min="0" defaultValue={filters.maxHeight} /></label>
      <label>Giá từ (VNĐ)<input type="number" name="minPrice" min="0" defaultValue={filters.minPrice} /></label><label>Đến (VNĐ)<input type="number" name="maxPrice" min="0" defaultValue={filters.maxPrice} /></label>
      <button className="button dark" type="submit">Tìm cây</button><a href="/cay-quat">Xóa bộ lọc</a>
    </form><p className="listing-intro">{result.total} cây phù hợp. Khi lọc giá, chỉ hiện cây có giá tham khảo.</p>
    {shown.length ? <div className="grid listing-grid">{shown.map(item => <PlantCard item={item} key={item.id}/>)}</div> : <p className="muted">Không tìm thấy cây phù hợp. Hãy thử thay đổi bộ lọc.</p>}
    {pageCount > 1 && <nav className="public-pagination" aria-label="Phân trang">{page > 1 && <a href={link(page - 1)}>← Trước</a>}<span>Trang {page} / {pageCount}</span>{page < pageCount && <a href={link(page + 1)}>Sau →</a>}</nav>}
  </div></main><SiteFooter/></>;
}
