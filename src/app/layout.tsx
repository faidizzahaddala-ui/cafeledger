import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
      <body className="antialiased relative min-h-screen">
        {/* ── Ambient Glow Background ── */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-700/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
