import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Nhà vườn Nho Văn | Quất cảnh & bán sỉ toàn quốc", template: "%s | Nhà vườn Nho Văn" },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", url: SITE_URL, siteName: SITE_NAME, title: "Nhà vườn Nho Văn | Quất cảnh & bán sỉ toàn quốc", description: DEFAULT_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
