import type { Metadata } from "next";
import "./globals.css";
import "./font-overrides.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Nhà vườn Nho Văn | Quất cảnh & bán sỉ toàn quốc", template: "%s | Nhà vườn Nho Văn" },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", url: SITE_URL, siteName: SITE_NAME, title: "Nhà vườn Nho Văn | Quất cảnh & bán sỉ toàn quốc", description: DEFAULT_DESCRIPTION },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "1024x1024" }],
    shortcut: ["/icon.png"],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "1024x1024" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" />
  </head><body>{children}</body></html>;
}
