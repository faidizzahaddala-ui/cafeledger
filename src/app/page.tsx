"use client";

import KpiCard from "@/components/KpiCard";
import StockAlerts from "@/components/StockAlerts";
import ChartPlaceholder from "@/components/ChartPlaceholder";
import AppSidebar from "@/components/AppSidebar";
import TransaksiManagement from "@/components/TransaksiManagement";

// ── KPI Data ──────────────────────────────────────────────────────────────────
const kpiData = [
  {
    title: "Total Omzet",
    subtitle: "Bulan Juni 2026",
    value: "Rp 48.750.000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    trend: { value: "8.4% vs bln lalu", positive: true },
    accentColor: "gold" as const,
    animationDelay: "0.1s",
  },
  {
    title: "Total Beban",
    subtitle: "Biaya operasional",
    value: "Rp 31.200.000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    trend: { value: "2.1% vs bln lalu", positive: false },
    accentColor: "red" as const,
    animationDelay: "0.2s",
  },
  {
    title: "Laba Bersih Sementara",
    subtitle: "Estimasi bulan ini",
    value: "Rp 17.550.000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    trend: { value: "15.7% vs bln lalu", positive: true },
    accentColor: "green" as const,
    animationDelay: "0.3s",
  },
];

// ── Page Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ── Left Navigation Sidebar ── */}
      <AppSidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(200, 136, 60, 0.12)" }}
        >
          <div>
            <h1 className="text-xl font-bold gradient-text font-display tracking-tight">
              Dashboard Analitik
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{today}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-light)",
              }}
              id="period-selector"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Juni 2026</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {/* Notification Bell */}
            <button
              id="notification-btn"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Notifikasi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {/* Alert badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-slow border border-[var(--bg-primary)]" />
            </button>

            {/* Refresh Button */}
            <button
              id="refresh-btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Refresh data"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0 h-full">
            {/* ── Center Content Column ── */}
            <div className="flex-1 p-6 flex flex-col gap-6 min-w-0">
              {/* Section Label */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Ringkasan Keuangan
                </h2>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-[var(--text-muted)] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                  Data per hari ini
                </span>
              </div>

              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="kpi-cards-section">
                {kpiData.map((kpi) => (
                  <KpiCard key={kpi.title} {...kpi} />
                ))}
              </div>

              {/* ── Transaksi Management ── */}
              <TransaksiManagement />

              {/* ── Chart Section ── */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Tren Transaksi 7 Hari Terakhir
                </h2>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div
                id="transaction-chart-section"
                className="glass-card p-6 flex-1 min-h-[280px] animate-fade-up"
                style={{ animationDelay: "0.35s" }}
              >
                {/* Chart Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">
                      Total Transaksi
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      1.482 <span className="text-sm font-normal text-[var(--text-muted)]">transaksi</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["7H", "14H", "30H"].map((label, i) => (
                      <button
                        key={label}
                        id={`chart-period-${label.toLowerCase()}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          i === 0
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
                <div className="h-48">
                  <ChartPlaceholder />
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "0.45s" }}>
                {[
                  { label: "Rata-rata Transaksi/Hari", value: "211", unit: "transaksi" },
                  { label: "Omzet Hari Ini", value: "Rp 2.1jt", unit: "estimasi" },
                  { label: "Produk Terlaris", value: "Es Kopi Susu", unit: "Yalla Signature" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card px-4 py-3 text-center"
                  >
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-base font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Sidebar – Stock Alerts ── */}
            <aside
              id="stock-alerts-sidebar"
              className="w-72 flex-shrink-0 flex flex-col p-5 gap-5 overflow-y-auto"
              style={{ borderLeft: "1px solid rgba(200, 136, 60, 0.10)" }}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Peringatan Stok</h3>
                </div>
                <span className="badge-danger">5 Item</span>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] -mt-3 leading-relaxed">
                Bahan baku berikut memerlukan perhatian segera atau perlu segera direstok.
              </p>

              {/* Stock Alerts List */}
              <div id="stock-alerts-list">
                <StockAlerts />
              </div>

              {/* Action Button */}
              <button
                id="restock-action-btn"
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 animate-fade-in"
                style={{
                  background: "linear-gradient(135deg, #8B4513, #C8883C)",
                  color: "#F5EDD8",
                  boxShadow: "0 4px 16px rgba(139, 69, 19, 0.35)",
                  animationDelay: "0.6s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 24px rgba(139, 69, 19, 0.55)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 16px rgba(139, 69, 19, 0.35)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                Buat Pesanan Restok →
              </button>

              {/* Divider */}
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mb-3">
                  Aktivitas Terkini
                </p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { time: "14:32", desc: "Penjualan #1847 – Rp 65.000", type: "sale" },
                    { time: "14:15", desc: "Pengeluaran bahan baku", type: "expense" },
                    { time: "13:58", desc: "Penjualan #1846 – Rp 42.000", type: "sale" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          activity.type === "sale" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <div>
                        <p className="text-[12px] text-[var(--text-primary)] leading-tight">{activity.desc}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{activity.time} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
