import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactItem } from "@/app/components/contact-item";
import { PlantImageGallery } from "@/app/components/plant-image-gallery";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import { publicContact, publicLot } from "../../data";
import { descriptionFrom, publicMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && numericId > 0 ? publicLot(numericId) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const lot = await load((await params).id);
  if (!lot) return { robots: { index: false, follow: false } };
  return publicMetadata({ title: `${lot.title} | Bán sỉ quất cảnh`, description: descriptionFrom(lot.description, `${lot.title} – lô quất cảnh bán sỉ từ Nhà vườn Nho Văn.`), path: `/lo/${lot.id}`, image: lot.image || undefined });
}

export default async function WholesaleLotDetail({ params }: { params: Promise<{ id: string }> }) {
  const lot = await load((await params).id);
  if (!lot) notFound();
  const config = await publicContact();
  let gallery: string[] = [];
  try { const parsed = JSON.parse(lot.gallery); if (Array.isArray(parsed)) gallery = parsed.filter((x): x is string => typeof x === "string" && !!x); } catch {}
  gallery = [...new Set([lot.image, ...gallery].filter(Boolean))];
  return <><SiteHeader /><main className="listing-page"><article className="wrap detail"><a className="back-link" href="/lo-si">← Về danh sách lô bán sỉ</a><p className="eyebrow green">LÔ {lot.code} · CÒN HÀNG</p><h1>{lot.title}</h1>{gallery.length > 0 && <PlantImageGallery images={gallery} title={lot.title} />}<div className="detail-grid"><div><span>Loại / dáng cây</span><b>{lot.plantType}</b></div>{lot.sizeOrAge && <div><span>Kích thước / độ tuổi</span><b>{lot.sizeOrAge}</b></div>}{lot.location && <div><span>Vị trí tham khảo</span><b>{lot.location}</b></div>}{lot.photoDate && <div><span>Ngày chụp ảnh</span><b>{lot.photoDate}</b></div>}<div><span>Mức mua tối thiểu</span><b>{lot.minimumOrderQuantity} {lot.unit}</b></div><div><span>Giá sỉ</span><b>{lot.wholesalePrice || "Liên hệ báo giá"}</b></div></div><p className="description">{lot.description || "Liên hệ nhà vườn để xem trực tiếp lô cây và nhận tư vấn số lượng phù hợp."}</p><p className="listing-intro">Nhà vườn nhận tư vấn và chốt đơn bán sỉ quất cảnh cho khách hàng trên toàn quốc.</p><ContactItem title={lot.title} code={lot.code} path={`/lo/${lot.id}`} kind="lô" phone={config.phone} phone2={config.phone2} zalo={config.zalo} /></article></main><SiteFooter /></>;
}
