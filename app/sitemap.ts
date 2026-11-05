import type { MetadataRoute } from "next";
import { publicSitemapData } from "./data";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { entries, lots } = await publicSitemapData();
  const staticPages: MetadataRoute.Sitemap = ["", "/cay-quat", "/lo-si", "/bai-viet"].map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date(), changeFrequency: "weekly", priority: path === "" ? 1 : 0.8 }));
  return [
    ...staticPages,
    ...entries.map((entry) => ({ url: `${SITE_URL}/bai/${entry.id}`, lastModified: new Date(entry.createdAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...lots.map((lot) => ({ url: `${SITE_URL}/lo/${lot.id}`, lastModified: new Date(lot.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
