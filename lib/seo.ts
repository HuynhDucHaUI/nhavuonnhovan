import type { Metadata } from "next";

export const SITE_URL = "https://nhavuonnhovan.io.vn";
export const SITE_NAME = "Nhà vườn Nho Văn";
export const DEFAULT_DESCRIPTION = "Nhà vườn Nho Văn chuyên quất cảnh Văn Giang, Hưng Yên; giới thiệu cây tiêu biểu và nhận bán sỉ quất cảnh trên toàn quốc.";

export function absoluteUrl(path = "/") { return new URL(path, SITE_URL).toString(); }
export function descriptionFrom(value: string, fallback = DEFAULT_DESCRIPTION) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 155) : fallback;
}

export function publicMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const canonical = absoluteUrl(path);
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title, description, alternates: { canonical },
    openGraph: { type: "website", locale: "vi_VN", url: canonical, siteName: SITE_NAME, title, description, images },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}
