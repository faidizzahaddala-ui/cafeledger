"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";
import AiBusinessAdvisor from "@/components/AiBusinessAdvisor";
import { getTransaksi, type Transaksi } from "@/utils/supabase";
import { useRole } from "@/context/RoleContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRp = (n: number, compact = false) => {
  if (compact && Math.abs(n) >= 1_000_000)
    return `Rp ${(n / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
};

const formatMonth = (yyyyMm: string) => {
  const [y, m] = yyyyMm.split("-");
  const names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
  return `${names[parseInt(m) - 1]} ${y}`;
};

const pct = (a: number, b: number) =>
  b === 0 ? "—" : `${((a / b) * 100).toFixed(1)}%`;

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthRow {
  month: string;       // "YYYY-MM"
  pendapatan: number;
  beban: number;
  laba: number;
  margin: number;      // percentage
}

interface CategoryRow {
  name: string;
  total: number;
  type: "Pemasukan" | "Pengeluaran";
  color: string;
  bg: string;
}

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({
  label, value, sub, accent, icon, delay,
}: {
  label: string; value: string; sub?: string;
  accent: "gold" | "green" | "red";
  icon: React.ReactNode; delay?: string;
}) {
  const map = {
    gold:  { ring: "hover:border-amber-500/40",  glow: "hover:shadow-[0_8px_32px_rgba(212,135,78,0.20)]",  icon: "bg-amber-500/15  text-amber-400",  bar: "from-amber-500 to-yellow-400" },
    green: { ring: "hover:border-emerald-500/40", glow: "hover:shadow-[0_8px_32px_rgba(22,163,74,0.18)]",  icon: "bg-emerald-500/15 text-emerald-400", bar: "from-emerald-500 to-green-400" },
    red:   { ring: "hover:border-red-500/40",     glow: "hover:shadow-[0_8px_32px_rgba(220,38,38,0.18)]",   icon: "bg-red-500/15     text-red-400",     bar: "from-red-500 to-rose-400"    },
  }[accent];

  return (
    <div
      className={`glass-card p-5 flex flex-col gap-3 animate-fade-up ${map.ring} ${map.glow}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${map.icon}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</p>}
      </div>
      <div className="w-full h-[3px] rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${map.bar} rounded-full`} style={{ width: "70%" }}/>
      </div>
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.07)", width: i === 0 ? "60%" : "50%" }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LaporanPage() {
  const { role } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactions, setTransactions]     = useState<Transaksi[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState<"bulanan" | "kategori">("bulanan");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransaksi();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      setError("Gagal memuat data dari Supabase. Periksa koneksi dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Computed Metrics ───────────────────────────────────────────────────────
  const { totalPendapatan, totalBeban, labaBersih } = useMemo(() => {
    const totalPendapatan = transactions
      .filter((t) => t.type === "Pemasukan")
      .reduce((s, t) => s + t.amount, 0);
    const totalBeban = transactions
      .filter((t) => t.type === "Pengeluaran")
      .reduce((s, t) => s + t.amount, 0);
    return { totalPendapatan, totalBeban, labaBersih: totalPendapatan - totalBeban };
  }, [transactions]);

  // ── Stok Kritis Count (mirror dari /stok inventory data) ──────────────────
  const stokKritis = useMemo(() => {
    const stokItems = [
      { stok: 8,   batasMin: 10  }, // Biji Kopi House Blend
      { stok: 12,  batasMin: 5   }, // Biji Kopi Single Origin
      { stok: 15,  batasMin: 20  }, // Susu UHT
      { stok: 6,   batasMin: 5   }, // Oat Milk
      { stok: 3,   batasMin: 4   }, // Whipped Cream
      { stok: 2,   batasMin: 5   }, // Gula Aren Cair
      { stok: 4,   batasMin: 3   }, // Sirup Karamel
      { stok: 1,   batasMin: 3   }, // Sirup Vanilla
      { stok: 18,  batasMin: 10  }, // Gula Pasir
      { stok: 1.5, batasMin: 2   }, // Matcha Powder
      { stok: 10,  batasMin: 5   }, // Tepung Terigu
      { stok: 3,   batasMin: 2   }, // Mentega
      { stok: 120, batasMin: 200 }, // Cup Plastik
      { stok: 350, batasMin: 150 }, // Cup Paper Hot
      { stok: 80,  batasMin: 100 }, // Sedotan Kertas
    ];
    return stokItems.filter((s) => s.stok < s.batasMin).length;
  }, []);

  // ── Monthly Breakdown ──────────────────────────────────────────────────────
  const monthlyRows = useMemo<MonthRow[]>(() => {
    const map: Record<string, { pendapatan: number; beban: number }> = {};
    for (const t of transactions) {
      const key = t.created_at.substring(0, 7); // "YYYY-MM"
      if (!map[key]) map[key] = { pendapatan: 0, beban: 0 };
      if (t.type === "Pemasukan") map[key].pendapatan += t.amount;
      else                        map[key].beban      += t.amount;
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a)) // newest first
      .map(([month, { pendapatan, beban }]) => ({
        month, pendapatan, beban,
        laba:   pendapatan - beban,
        margin: pendapatan > 0 ? ((pendapatan - beban) / pendapatan) * 100 : 0,
      }));
  }, [transactions]);

  // ── Category Breakdown ─────────────────────────────────────────────────────
  const categoryRows = useMemo<CategoryRow[]>(() => {
    const cats: Record<string, { total: number; type: "Pemasukan" | "Pengeluaran" }> = {};
    for (const t of transactions) {
      if (!cats[t.category]) cats[t.category] = { total: 0, type: t.type };
      cats[t.category].total += t.amount;
    }
    const colorMap: Record<string, { color: string; bg: string }> = {
      Sales:            { color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25" },
      "Other Income":   { color: "text-teal-400",    bg: "bg-teal-500/15    border-teal-500/25"    },
      COGS:             { color: "text-amber-400",   bg: "bg-amber-500/15   border-amber-500/25"   },
      Utility:          { color: "text-blue-400",    bg: "bg-blue-500/15    border-blue-500/25"    },
      Salary:           { color: "text-purple-400",  bg: "bg-purple-500/15  border-purple-500/25"  },
      "Other Expense":  { color: "text-pink-400",    bg: "bg-pink-500/15    border-pink-500/25"    },
    };
    return Object.entries(cats)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([name, { total, type }]) => ({
        name, total, type,
        color: colorMap[name]?.color ?? "text-[var(--text-muted)]",
        bg:    colorMap[name]?.bg    ?? "bg-white/10 border-white/10",
      }));
  }, [transactions]);

  const maxCatTotal = Math.max(...categoryRows.map((r) => r.total), 1);

  // ── Header date ────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = ["ID,Tanggal,Waktu,Jenis,Kategori,Deskripsi,Jumlah"];
    const rows = transactions.map((t) => {
      const dt = new Date(t.created_at);
      const date = dt.toLocaleDateString("id-ID");
      const time = dt.toLocaleTimeString("id-ID");
      // Escape quotes in description
      const desc = t.description ? t.description.replace(/"/g, '""') : "";
      return `${t.id},${date},${time},${t.type},${t.category},"${desc}",${t.amount}`;
    });
    const csvContent = header.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_YallaCoffee_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Access Guard (after all hooks) ─────────────────────────────────────────
  if (role !== "Owner") {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)}/>
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header
            className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 gap-3"
            style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
                aria-label="Buka menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <h1 className="text-base md:text-xl font-bold gradient-text">Laporan Keuangan</h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center p-6">
            <div
              className="max-w-md w-full rounded-2xl p-8 text-center flex flex-col items-center gap-5 animate-fade-up"
              style={{
                background: "linear-gradient(145deg, rgba(220,38,38,0.08), rgba(255,255,255,0.03))",
                border: "1px solid rgba(220,38,38,0.20)",
                boxShadow: "0 8px 32px rgba(220,38,38,0.08)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-300">Akses Ditolak</h2>
                <p className="text-[13px] text-[var(--text-muted)] mt-2 leading-relaxed">
                  Halaman <span className="font-semibold text-[var(--text-primary)]">Laporan Keuangan</span> hanya dapat diakses oleh peran <span className="font-semibold text-amber-400">Owner</span>.
                  Peran Anda saat ini: <span className="font-semibold text-red-400">{role}</span>.
                </p>
              </div>
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #8B4513, #C8883C)",
                  color: "#F5EDD8",
                  boxShadow: "0 4px 16px rgba(139,69,19,0.35)",
                }}
              >
                ← Kembali ke Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)}/>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Header ── */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 gap-3"
          style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Buka menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold gradient-text font-display tracking-tight">
                Laporan Keuangan
              </h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              id="laporan-refresh-btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Refresh data laporan"
            >
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={loading ? "animate-spin" : ""}
              >
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>

            {/* Export badge (placeholder) */}
            <button
              id="laporan-export-btn"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Ekspor
            </button>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6">

            {/* Error Banner */}
            {error && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-300 animate-fade-in"
                style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.25)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
                <button onClick={fetchData} className="ml-auto text-xs underline opacity-80 hover:opacity-100">
                  Coba lagi
                </button>
              </div>
            )}

            {/* ── Section: Income Statement ── */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 flex-shrink-0"/>
              <h2 className="text-xs md:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Ringkasan Laba Rugi
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]"/>
              <span className="text-[10px] text-[var(--text-muted)] bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.06] whitespace-nowrap">
                {loading ? "Memuat…" : `${transactions.length} transaksi`}
              </span>
            </div>

            {/* ── Summary Cards: 1 col → 3 col ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <SummaryCard
                label="Total Pendapatan"
                value={loading ? "—" : formatRp(totalPendapatan, true)}
                sub="Akumulasi semua Pemasukan"
                accent="gold"
                delay="0.1s"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                  </svg>
                }
              />
              <SummaryCard
                label="Total Beban Operasional"
                value={loading ? "—" : formatRp(totalBeban, true)}
                sub="Akumulasi semua Pengeluaran"
                accent="red"
                delay="0.2s"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
                  </svg>
                }
              />
              <SummaryCard
                label="Laba Bersih / Net Income"
                value={loading ? "—" : formatRp(labaBersih, true)}
                sub={loading ? "—" : `Margin: ${pct(labaBersih, totalPendapatan)}`}
                accent={labaBersih >= 0 ? "green" : "red"}
                delay="0.3s"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                }
              />
            </div>

            {/* ── Profitability Banner ── */}
            {!loading && transactions.length > 0 && (
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 px-5 py-4 rounded-2xl animate-fade-in"
                style={{
                  background: labaBersih >= 0
                    ? "linear-gradient(135deg,rgba(22,163,74,0.10),rgba(22,163,74,0.04))"
                    : "linear-gradient(135deg,rgba(220,38,38,0.10),rgba(220,38,38,0.04))",
                  border: `1px solid ${labaBersih >= 0 ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
                }}
              >
                <div className={`text-3xl font-black ${labaBersih >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {labaBersih >= 0 ? "▲" : "▼"}
                </div>
                <div>
                  <p className={`text-sm font-bold ${labaBersih >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {labaBersih >= 0 ? "Posisi UNTUNG" : "Posisi RUGI"}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                    Margin bersih: <span className="font-semibold text-[var(--text-primary)]">
                      {pct(labaBersih, totalPendapatan)}
                    </span>
                    {" · "}
                    Rasio beban: <span className="font-semibold text-[var(--text-primary)]">
                      {pct(totalBeban, totalPendapatan)}
                    </span>
                  </p>
                </div>
                <div className="sm:ml-auto text-right">
                  <p className="text-[11px] text-[var(--text-muted)]">Net Income</p>
                  <p className={`text-lg font-bold ${labaBersih >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {labaBersih >= 0 ? "+" : "−"}{formatRp(Math.abs(labaBersih), true)}
                  </p>
                </div>
              </div>
            )}

            {/* ── AI Business Advisor (Owner only) ── */}
            {!loading && transactions.length > 0 && role === "Owner" && (
              <AiBusinessAdvisor
                totalPendapatan={totalPendapatan}
                totalBeban={totalBeban}
                labaBersih={labaBersih}
                stokKritis={stokKritis}
                loading={loading}
              />
            )}

            {/* ── Tab Toggle ── */}
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 flex-shrink-0"/>
              <h2 className="text-xs md:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Rincian Arus Kas
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]"/>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Unduh CSV
              </button>
              <div className="flex gap-1.5">
                {(["bulanan", "kategori"] as const).map((tab) => (
                  <button
                    key={tab}
                    id={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      activeTab === tab
                        ? "text-amber-300 border-amber-500/30"
                        : "text-[var(--text-muted)] border-white/[0.06] hover:text-[var(--text-primary)]"
                    }`}
                    style={
                      activeTab === tab
                        ? { background: "linear-gradient(135deg,rgba(139,69,19,0.30),rgba(200,136,60,0.15))" }
                        : { background: "rgba(255,255,255,0.03)" }
                    }
                  >
                    {tab === "bulanan" ? "Per Bulan" : "Per Kategori"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TAB: Per Bulan ── */}
            {activeTab === "bulanan" && (
              <div className="glass-card overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]" id="laporan-bulanan-table">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}>
                        {["Bulan", "Pendapatan", "Beban Ops.", "Laba Bersih", "Margin"].map((col) => (
                          <th
                            key={col}
                            className="text-left px-4 md:px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading && Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonRow key={i} cols={5}/>
                      ))}

                      {!loading && monthlyRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                            Belum ada data transaksi tersedia.
                          </td>
                        </tr>
                      )}

                      {!loading && monthlyRows.map((row) => (
                        <tr
                          key={row.month}
                          className="hover:bg-white/[0.025] transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                              {formatMonth(row.month)}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] font-medium text-emerald-400">
                              +{formatRp(row.pendapatan)}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] font-medium text-red-400">
                              −{formatRp(row.beban)}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`text-[13px] font-bold ${
                                row.laba >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {row.laba >= 0 ? "+" : "−"}{formatRp(Math.abs(row.laba))}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.margin >= 0
                                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                      : "bg-gradient-to-r from-red-600 to-red-400"
                                  }`}
                                  style={{ width: `${Math.min(Math.abs(row.margin), 100)}%` }}
                                />
                              </div>
                              <span
                                className={`text-[11px] font-semibold ${
                                  row.margin >= 0 ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {row.margin.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Table Footer: Totals */}
                    {!loading && monthlyRows.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: "1px solid rgba(200,136,60,0.15)", background: "rgba(212,135,78,0.04)" }}>
                          <td className="px-4 md:px-5 py-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Total
                          </td>
                          <td className="px-4 md:px-5 py-3">
                            <span className="text-[13px] font-bold text-emerald-400">
                              +{formatRp(totalPendapatan)}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3">
                            <span className="text-[13px] font-bold text-red-400">
                              −{formatRp(totalBeban)}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3">
                            <span className={`text-[13px] font-bold ${labaBersih >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {labaBersih >= 0 ? "+" : "−"}{formatRp(Math.abs(labaBersih))}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-3">
                            <span className={`text-[12px] font-bold ${labaBersih >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {pct(labaBersih, totalPendapatan)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB: Per Kategori ── */}
            {activeTab === "kategori" && (
              <div className="flex flex-col gap-3 animate-fade-in" id="laporan-kategori-section">
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass-card px-5 py-4 animate-pulse"
                    style={{ height: "72px", animationDelay: `${i * 0.06}s` }}
                  />
                ))}

                {!loading && categoryRows.length === 0 && (
                  <div className="glass-card px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                    Belum ada data transaksi.
                  </div>
                )}

                {!loading && categoryRows.map((row, i) => {
                  const barPct = (row.total / maxCatTotal) * 100;
                  return (
                    <div
                      key={row.name}
                      className="glass-card px-5 py-4 flex flex-col gap-2.5 animate-fade-up"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${row.bg}`}>
                            {row.name}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                            row.type === "Pemasukan"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {row.type}
                          </span>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${row.color}`}>
                          {formatRp(row.total)}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barPct}%`,
                            background: row.type === "Pemasukan"
                              ? "linear-gradient(90deg, #059669, #34d399)"
                              : "linear-gradient(90deg, #dc2626, #f87171)",
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>{barPct.toFixed(1)}% dari total tertinggi</span>
                        <span>{pct(row.total, row.type === "Pemasukan" ? totalPendapatan : totalBeban)} dari {row.type === "Pemasukan" ? "pendapatan" : "beban"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-4"/>
          </div>
        </div>
      </main>
    </div>
  );
}
