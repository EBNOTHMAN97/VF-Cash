import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "متابعة محافظ فودافون كاش - Vodafone Cash Tracker",
  description: "نظام متابعة الحدود اليومية والشهرية لمحافظ فودافون كاش",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
