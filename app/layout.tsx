import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Nhà vườn Nho Văn | Quất cảnh Văn Giang", description: "Khám phá quất cảnh tại Nhà vườn Nho Văn, Văn Giang, Hưng Yên." };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="vi"><body>{children}</body></html>}
