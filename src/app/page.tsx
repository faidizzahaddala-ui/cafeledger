"use client";
const secureRandom = () => { const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 4294967296; };

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KpiCard from "@/components/KpiCard";
import StockAlerts from "@/components/StockAlerts";
import ChartPlaceholder from "@/components/ChartPlaceholder";
import AppSidebar from "@/components/AppSidebar";
import TransaksiManagement from "@/components/TransaksiManagement";
import { insertTransaksi, type KategoriTransaksi } from "@/utils/supabase";
import { useRole } from "@/context/RoleContext";

// ── Page Component ─────────────────────────────────────────────────────────────
// ── Seeder: Dummy Data Templates ──────────────────────────────────────────────
const SEED_INCOME_DESCS = [
  "Meja 4 - V60 & Americano", "Takeaway Kopi Susu Yalla", "GrabFood Order #GF-4821",
  "Meja 7 - 2x Cappuccino & Croissant", "GoFood Order #GO-1293", "Penjualan Es Kopi Aren x3",
  "Meja 1 - Latte & Cheesecake", "Penjualan Matcha Latte takeaway", "Catering kantor 10 cup",
  "Meja 12 - Espresso Double & Waffle", "ShopeeFood Order #SF-887", "Walk-in 3x Cold Brew",
  "Meja 9 - Caramel Macchiato & Banana Bread", "Penjualan paket Es Teh Tarik x5",
  "Meja 2 - V60 Single Origin pour over", "Grab Pickup - 4x Kopi Susu",
  "Event private brewing session", "Meja 6 - Americano & Club Sandwich",
  "Pre-order 15 cup kopi meeting", "Penjualan merchandise tumbler Yalla",
  "Meja 3 - 2x Latte Panas & 2x Croissant",
];

const SEED_EXPENSE_TEMPLATES: { category: "COGS" | "Utility" | "Salary"; descs: string[] }[] = [
  { category: "COGS",    descs: ["Restock Susu UHT 10 liter", "Biji Kopi Espresso Blend 5kg", "Gula Aren Cair 3 liter", "Restock Oat Milk", "Beli Matcha Powder 1kg", "Cup Plastik 16oz 500pcs", "Sedotan Kertas 200pcs", "Mentega & Tepung untuk pastry"] },
  { category: "Utility", descs: ["Token Listrik bulan ini", "Tagihan Air PDAM", "Internet WiFi Indihome", "Biaya maintenance mesin espresso"] },
  { category: "Salary",  descs: ["Fee Barista Part-time Minggu 1", "Fee Barista Part-time Minggu 2", "Gaji kasir shift pagi", "Bonus lembur weekend"] },
];

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seeding, setSeeding]               = useState(false);
  const [seedProgress, setSeedProgress]     = useState(0);
  const [seedDone, setSeedDone]             = useState(false);
  const [seedError, setSeedError]           = useState<string | null>(null);
  const [activePeriod, setActivePeriod]     = useState("7H");
  const [toastMsg, setToastMsg]             = useState<string | null>(null);
  const [omzet, setOmzet]                   = useState(48750000);
  const [beban, setBeban]                   = useState(31200000);

  useEffect(() => {
    const fetchKpi = async () => {
      const { supabase } = await import("@/utils/supabase");
      const { data } = await supabase.from("Transaksi").select("type, amount");
      if (data) {
        let totalOmzet = 0;
        let totalBeban = 0;
        data.forEach((t) => {
          if (t.type === "Pemasukan") totalOmzet += t.amount;
          else if (t.type === "Pengeluaran") totalBeban += t.amount;
        });
        if (totalOmzet > 0 || totalBeban > 0) {
          setOmzet(totalOmzet);
          setBeban(totalBeban);
        }
      }
    };
    fetchKpi();
  }, [seedDone]); // re-fetch if seeding is done

  const laba = omzet - beban;

  const kpiData = [
    {
      title: "Total Omzet",
      subtitle: "Bulan ini",
      value: `Rp ${omzet.toLocaleString("id-ID")}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      trend: { value: "Berdasarkan data asli", positive: true },
      accentColor: "gold" as const,
      animationDelay: "0.1s",
    },
    {
      title: "Total Beban",
      subtitle: "Biaya operasional",
      value: `Rp ${beban.toLocaleString("id-ID")}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
      trend: { value: "Berdasarkan data asli", positive: false },
      accentColor: "red" as const,
      animationDelay: "0.2s",
    },
    {
      title: "Laba Bersih Sementara",
      subtitle: "Estimasi bulan ini",
      value: `Rp ${laba.toLocaleString("id-ID")}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      trend: { value: "Berdasarkan data asli", positive: laba >= 0 },
      accentColor: "green" as const,
      animationDelay: "0.3s",
    },
  ];

  // ── Seeder Function ─────────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress(0);
    setSeedDone(false);
    setSeedError(null);

    const TOTAL = 30;
    const now = Date.now();
    const DAY = 86_400_000;
    let success = 0;

    for (let i = 0; i < TOTAL; i++) {
      // Random date within last 30 days
      const daysAgo = Math.floor(secureRandom() * 30);
      const hrs     = Math.floor(secureRandom() * 12) + 7;  // 07:00 – 19:00
      const mins    = Math.floor(secureRandom() * 60);
      const ts      = new Date(now - daysAgo * DAY);
      ts.setHours(hrs, mins, 0, 0);
      const created_at = ts.toISOString();

      const isIncome = secureRandom() < 0.7; // 70% income

      let type: "Pemasukan" | "Pengeluaran";
      let category: string;
      let description: string;
      let amount: number;

      if (isIncome) {
        type = "Pemasukan";
        category = "Sales";
        description = SEED_INCOME_DESCS[Math.floor(secureRandom() * SEED_INCOME_DESCS.length)];
        amount = Math.round((secureRandom() * 125_000 + 25_000) / 1_000) * 1_000; // 25k – 150k, round to 1k
      } else {
        const tpl = SEED_EXPENSE_TEMPLATES[Math.floor(secureRandom() * SEED_EXPENSE_TEMPLATES.length)];
        type = "Pengeluaran";
        category = tpl.category;
        description = tpl.descs[Math.floor(secureRandom() * tpl.descs.length)];
        amount = Math.round((secureRandom() * 300_000 + 50_000) / 5_000) * 5_000; // 50k – 350k, round to 5k
      }

      const result = await insertTransaksi({ type, category: category as KategoriTransaksi, amount, description, created_at });
      if (result) success++;
      setSeedProgress(i + 1);
    }

    setSeeding(false);

    if (success < TOTAL * 0.5) {
      setSeedError(`Hanya ${success}/${TOTAL} berhasil. Periksa koneksi Supabase.`);
    } else {
      setSeedDone(true);
      // Auto-refresh page data
      router.refresh();
      setTimeout(() => setSeedDone(false), 5000);
    }
  };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>

      {/* ── Sidebar (desktop: in-flow | mobile: overlay drawer) ── */}
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Header ── */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 gap-3"
          style={{ borderBottom: "1px solid rgba(200, 136, 60, 0.12)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Buka menu navigasi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold gradient-text font-display tracking-tight truncate">
                Dashboard Analitik
              </h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-0.5 truncate hidden sm:block">
                {today}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Period Selector — hidden on xs */}
            <button
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium text-[var(--text-muted)] cursor-pointer hover:bg-white/[0.08] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              id="period-selector"
              onClick={() => {
                setToastMsg("Fitur filter bulan akan hadir di Fase 2!");
                setTimeout(() => setToastMsg(null), 3000);
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Juni 2026</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Notification Bell */}
            <button
              id="notification-btn"
              onClick={() => {
                setToastMsg("Tidak ada notifikasi baru saat ini.");
                setTimeout(() => setToastMsg(null), 3000);
              }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Notifikasi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-slow border border-[var(--bg-primary)]"/>
            </button>

            {/* Refresh Button */}
            <button
              id="refresh-btn"
              onClick={() => {
                setToastMsg("Memuat ulang data...");
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Refresh data"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          {/*
            Mobile  : flex-col (center stack, then stock sidebar below)
            Desktop : flex-row (center | right sidebar side by side)
          */}
          <div className="flex flex-col lg:flex-row lg:h-full">

            {/* ── Center Content Column ── */}
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 min-w-0">

              {/* ── Seeder Banner (Owner only) ── */}
              {role === "Owner" && (
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-2xl animate-fade-in"
                style={{
                  background: "linear-gradient(135deg, rgba(139,69,19,0.20), rgba(200,136,60,0.08))",
                  border: "1px solid rgba(200,136,60,0.30)",
                  boxShadow: "0 4px 20px rgba(139,69,19,0.15)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)", boxShadow: "0 0 16px rgba(212,135,78,0.35)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                      {seeding ? `Seeding data… ${seedProgress}/30` : "Demo Mode — Data Seeder"}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                      {seedDone
                        ? "✅ 30 transaksi dummy berhasil ditambahkan!"
                        : seedError
                        ? seedError
                        : "Klik tombol untuk mengisi 30 transaksi acak (30 hari terakhir) ke Supabase."}
                    </p>
                    {seeding && (
                      <div className="w-full max-w-[200px] h-1.5 rounded-full bg-white/[0.08] mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
                          style={{ width: `${(seedProgress / 30) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  id="btn-seed-dummy"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 whitespace-nowrap flex-shrink-0"
                  style={{
                    background: seeding
                      ? "rgba(255,255,255,0.06)"
                      : "linear-gradient(135deg, #B8621B, #D4874E)",
                    color: seeding ? "var(--text-muted)" : "#1A0D08",
                    boxShadow: seeding ? "none" : "0 4px 20px rgba(184,98,27,0.45), 0 0 0 1px rgba(212,135,78,0.20)",
                  }}
                >
                  {seeding ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Seeding…
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 3v18M3 12h18"/>
                      </svg>
                      Generate 30 Data Dummy
                    </>
                  )}
                </button>
              </div>
              )}

              {/* Section Label */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 flex-shrink-0"/>
                <h2 className="text-xs md:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Ringkasan Keuangan
                </h2>
                <div className="flex-1 h-px bg-white/[0.06]"/>
                <span className="text-[10px] text-[var(--text-muted)] bg-white/[0.04] px-2 md:px-3 py-1 rounded-full border border-white/[0.06] whitespace-nowrap">
                  Data per hari ini
                </span>
              </div>

              {/* ── KPI Cards: 1 col mobile → 3 col sm+ ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4" id="kpi-cards-section">
                {kpiData
                  .filter((kpi) => role === "Owner" || kpi.title !== "Laba Bersih Sementara")
                  .map((kpi) => (
                    <KpiCard key={kpi.title} {...kpi}/>
                  ))}
              </div>
              {/* ── Transaksi Management (overflow-x-auto handled inside) ── */}
              <TransaksiManagement/>
              {/* ── Chart Section ── */}
              <div className="flex items-center gap-3 mt-4 mb-1">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 flex-shrink-0"/>
                <h2 className="text-xs md:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Tren Transaksi 7 Hari Terakhir
                </h2>
                <div className="flex-1 h-px bg-white/[0.06]"/>
              </div>

              <div
                id="transaction-chart-section"
                className="glass-card p-4 md:p-6 min-h-[260px] md:min-h-[280px] animate-fade-up"
                style={{ animationDelay: "0.35s" }}
              >
                {/* Chart Header */}
                <div className="flex items-start justify-between mb-4 md:mb-6 gap-2">
                  <div>
                    <p className="text-[var(--text-muted)] text-[10px] md:text-xs font-medium uppercase tracking-wider">
                      Total Transaksi
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mt-1">
                      1.482{" "}
                      <span className="text-xs md:text-sm font-normal text-[var(--text-muted)]">
                        transaksi
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 md:gap-2 flex-wrap justify-end">
                    {["7H", "14H", "30H"].map((label) => (
                      <button
                        key={label}
                        id={`chart-period-${label.toLowerCase()}`}
                        onClick={() => setActivePeriod(label)}
                        className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          activePeriod === label
                            ? "bg-gradient-to-r from-amber-600/30 to-orange-600/20 text-amber-300 border border-amber-500/30"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-white/[0.03] border border-white/[0.06]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Content */}
                <div className="h-40 md:h-48">
                  <ChartPlaceholder period={activePeriod} />
                </div>
              </div>

              {/* ── Quick Stats: 1 col mobile → 3 col sm+ ── */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 animate-fade-up pb-4 md:pb-6"
                style={{ animationDelay: "0.45s" }}
              >
                {[
                  { label: "Rata-rata Transaksi/Hari", value: "211",         unit: "transaksi" },
                  { label: "Omzet Hari Ini",           value: "Rp 2.1jt",   unit: "estimasi" },
                  { label: "Produk Terlaris",          value: "Es Kopi Susu", unit: "Yalla Signature" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card px-4 py-3 text-center">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 leading-tight">
                      {stat.label}
                    </p>
                    <p className="text-sm md:text-base font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Sidebar – Stock Alerts ──
                Mobile  : full-width below main content, border-top
                Desktop : fixed 288px wide, border-left, sticky scroll
            ── */}
            <aside
              id="stock-alerts-sidebar"
              className="
                w-full lg:w-72 flex-shrink-0
                flex flex-col p-4 md:p-5 gap-4 md:gap-5
                lg:overflow-y-auto
              "
              style={{
                borderTop:  "1px solid rgba(200, 136, 60, 0.10)",
              }}
            >
              {/* On desktop only: left border instead of top border */}
              <style>{`
                @media (min-width: 1024px) {
                  #stock-alerts-sidebar {
                    border-top: none !important;
                    border-left: 1px solid rgba(200, 136, 60, 0.10);
                  }
                }
              `}</style>

              {/* Sidebar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Peringatan Stok</h3>
                </div>
                <span className="badge-danger">5 Item</span>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] -mt-2 md:-mt-3 leading-relaxed">
                Bahan baku berikut memerlukan perhatian segera atau perlu direstok.
              </p>

              {/* Stock Alerts — 2 col grid on mobile to save vertical space */}
              <div
                id="stock-alerts-list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-0 lg:flex lg:flex-col lg:gap-3"
              >
                <StockAlerts/>
              </div>

              {/* Restock Button */}
              <button
                id="restock-action-btn"
                onClick={() => alert("Fitur Integrasi Supplier akan hadir di Fase 2!")}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 animate-fade-in"
                style={{
                  background: "linear-gradient(135deg, #8B4513, #C8883C)",
                  color: "#F5EDD8",
                  boxShadow: "0 4px 16px rgba(139, 69, 19, 0.35)",
                  animationDelay: "0.6s",
                }}
              >
                Buat Pesanan Restok →
              </button>

              {/* Recent Activity */}
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mb-3">
                  Aktivitas Terkini
                </p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { time: "14:32", desc: "Penjualan #1847 – Rp 65.000", type: "sale" },
                    { time: "14:15", desc: "Pengeluaran bahan baku",       type: "expense" },
                    { time: "13:58", desc: "Penjualan #1846 – Rp 42.000", type: "sale" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          activity.type === "sale" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-[12px] text-[var(--text-primary)] leading-tight truncate">
                          {activity.desc}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{activity.time} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom padding for mobile */}
              <div className="h-2 lg:hidden"/>
            </aside>
          </div>
        </div>
      </main>
      
      {/* ── Global Toast Message ── */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-fade-up bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span className="text-sm font-medium text-white">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
