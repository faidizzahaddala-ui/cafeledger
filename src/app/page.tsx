"use client";

import { useState } from "react";
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
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
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
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    trend: { value: "15.7% vs bln lalu", positive: true },
    accentColor: "green" as const,
    animationDelay: "0.3s",
  },
];

// ── Page Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium text-[var(--text-muted)] cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              id="period-selector"
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
            </div>

            {/* Notification Bell */}
            <button
              id="notification-btn"
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
                {kpiData.map((kpi) => (
                  <KpiCard key={kpi.title} {...kpi}/>
                ))}
              </div>

              {/* ── Transaksi Management (overflow-x-auto handled inside) ── */}
              <TransaksiManagement/>

              {/* ── Chart Section ── */}
              <div className="flex items-center gap-3">
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
                    {["7H", "14H", "30H"].map((label, i) => (
                      <button
                        key={label}
                        id={`chart-period-${label.toLowerCase()}`}
                        className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
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
                <div className="h-40 md:h-48">
                  <ChartPlaceholder/>
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
    </div>
  );
}
