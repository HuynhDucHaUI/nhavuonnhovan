import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/components/site-chrome";
import { publicContact, publicEntry } from "@/app/data";
import { descriptionFrom, publicMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && numericId > 0 ? publicEntry(numericId) : null;
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
  return <><SiteHeader /><main className="detail wrap"><a className="underline" href={item.kind === "plant" ? "/cay-quat" : "/bai-viet"}>← Quay lại danh sách</a><p className="eyebrow green">{item.kind === "plant" ? "QUẤT CẢNH" : "BÀI VIẾT"}{item.code && ` · ${item.code}`}</p><h1>{item.title}</h1>{item.image && <img className="detail-img" src={item.image} alt={item.title} decoding="async" />}{item.kind === "plant" && <p><b>{item.price || "Liên hệ để biết giá"}</b> · {item.status === "sold" ? "Đã bán" : item.status === "available" ? "Còn tại vườn" : "Vui lòng liên hệ"}</p>}<p className="description">{item.description}</p><div className="actions">{config.phone && <a className="button dark" href={`tel:${config.phone}`}>Gọi nhà vườn</a>}{config.zalo && <a className="button dark" href={config.zalo} target="_blank" rel="noreferrer">Nhắn Zalo</a>}<a className="underline" href="/#lienhe">Thông tin nhà vườn →</a></div></main><SiteFooter /></>;
}
