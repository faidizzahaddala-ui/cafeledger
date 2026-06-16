import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CafeLedger – Yalla Coffee Analytics Dashboard",
  description:
    "Platform analitik keuangan dan operasional untuk Yalla Coffee. Monitor omzet, beban, laba, dan stok bahan baku secara real-time.",
  keywords: ["CafeLedger", "Yalla Coffee", "dashboard kafe", "analitik keuangan", "manajemen kafe"],
  authors: [{ name: "Yalla Coffee" }],
  openGraph: {
    title: "CafeLedger – Yalla Coffee",
    description: "Dashboard analitik keuangan Yalla Coffee",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
