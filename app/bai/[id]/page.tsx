import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/components/site-chrome";
import { ContactItem } from "@/app/components/contact-item";
import { PlantImageGallery } from "@/app/components/plant-image-gallery";
import { publicContact, publicEntry } from "@/app/data";
import { descriptionFrom, publicMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && numericId > 0 ? publicEntry(numericId) : null;
}

function galleryFrom(item: { image: string; gallery: string }) {
  try {
    const extra = JSON.parse(item.gallery);
    if (!Array.isArray(extra)) return item.image ? [item.image] : [];
    return [...new Set([item.image, ...extra].filter((image): image is string => typeof image === "string" && Boolean(image)))];
  } catch { return item.image ? [item.image] : []; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const item = await load((await params).id);
  if (!item) return { robots: { index: false, follow: false } };
  const label = item.kind === "plant" ? "Quất cảnh" : "Bài viết";
  return publicMetadata({ title: `${item.title} | ${label}`, description: descriptionFrom(item.description, `${item.title} tại Nhà vườn Nho Văn.`), path: `/bai/${item.id}`, image: item.image || undefined });
}

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const item = await load((await params).id);
  if (!item) notFound();
  const config = await publicContact();
  const gallery = item.kind === "plant" ? galleryFrom(item) : [];
  const backLink = item.kind === "plant" ? "/cay-quat" : "/bai-viet";
  return <><SiteHeader /><main className="listing-page collection-page detail-page"><article className="detail wrap">
    <nav className="collection-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">›</span><Link href={backLink}>{item.kind === "plant" ? "Cây quất" : "Bài viết"}</Link><span aria-hidden="true">›</span><span aria-current="page">Chi tiết</span></nav>
    <h1>{item.title}</h1>
    {item.kind === "plant" ? gallery.length > 0 && <PlantImageGallery images={gallery} title={item.title} /> : item.image && <img className="detail-img" src={item.image} alt={item.title} decoding="async" />}
    {item.kind === "plant" && <p><b>{item.price || (item.priceVnd != null ? `Giá tham khảo: ${item.priceVnd.toLocaleString("vi-VN")} ₫` : "Liên hệ để biết giá")}</b> · {item.status === "sold" ? "Đã bán" : item.status === "available" ? "Còn tại vườn" : "Vui lòng liên hệ"}</p>}
    {item.kind === "plant" ? item.status !== "sold" && <ContactItem title={item.title} code={item.code} path={`/bai/${item.id}`} kind="cây" phone={config.phone} zalo={config.zalo} /> : <div className="actions">{config.phone && <a className="button dark" href={`tel:${config.phone}`}>Gọi nhà vườn</a>}{config.zalo && <a className="button dark" href={config.zalo} target="_blank" rel="noreferrer">Nhắn Zalo</a>}</div>}
    <p className="description">{item.description}</p>
  </article></main><SiteFooter /></>;
}
