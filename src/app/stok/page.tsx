/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";

import { useState, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";

// ── Types ─────────────────────────────────────────────────────────────────────
type StokStatus = "Aman" | "Peringatan" | "Kritis";

interface BahanBaku {
  id: number;
  nama: string;
  satuan: string;
  stok: number;
  batasMin: number;
  kategori: "Kopi" | "Susu & Krim" | "Pemanis" | "Bahan Makanan" | "Packaging";
  emoji: string;
  lastUpdated: string;
}

// ── Initial Data ──────────────────────────────────────────────────────────────
const initialData: BahanBaku[] = [
  { id: 1,  nama: "Biji Kopi House Blend",   satuan: "kg",   stok: 8,    batasMin: 10, kategori: "Kopi",           emoji: "☕",  lastUpdated: "2026-06-17" },
  { id: 2,  nama: "Biji Kopi Single Origin",  satuan: "kg",   stok: 12,   batasMin: 5,  kategori: "Kopi",           emoji: "☕",  lastUpdated: "2026-06-16" },
  { id: 3,  nama: "Susu UHT Full Cream",      satuan: "liter",stok: 15,   batasMin: 20, kategori: "Susu & Krim",    emoji: "🥛",  lastUpdated: "2026-06-17" },
  { id: 4,  nama: "Oat Milk",                 satuan: "liter",stok: 6,    batasMin: 5,  kategori: "Susu & Krim",    emoji: "🥛",  lastUpdated: "2026-06-15" },
  { id: 5,  nama: "Whipped Cream",            satuan: "can",  stok: 3,    batasMin: 4,  kategori: "Susu & Krim",    emoji: "🍦",  lastUpdated: "2026-06-16" },
  { id: 6,  nama: "Gula Aren Cair",           satuan: "liter",stok: 2,    batasMin: 5,  kategori: "Pemanis",        emoji: "🍯",  lastUpdated: "2026-06-17" },
  { id: 7,  nama: "Sirup Karamel",            satuan: "botol",stok: 4,    batasMin: 3,  kategori: "Pemanis",        emoji: "🍶",  lastUpdated: "2026-06-14" },
  { id: 8,  nama: "Sirup Vanilla",            satuan: "botol",stok: 1,    batasMin: 3,  kategori: "Pemanis",        emoji: "🍶",  lastUpdated: "2026-06-15" },
  { id: 9,  nama: "Gula Pasir",               satuan: "kg",   stok: 18,   batasMin: 10, kategori: "Pemanis",        emoji: "🧂",  lastUpdated: "2026-06-16" },
  { id: 10, nama: "Matcha Powder",            satuan: "kg",   stok: 1.5,  batasMin: 2,  kategori: "Bahan Makanan",  emoji: "🍵",  lastUpdated: "2026-06-17" },
  { id: 11, nama: "Tepung Terigu",            satuan: "kg",   stok: 10,   batasMin: 5,  kategori: "Bahan Makanan",  emoji: "🌾",  lastUpdated: "2026-06-13" },
  { id: 12, nama: "Mentega",                  satuan: "kg",   stok: 3,    batasMin: 2,  kategori: "Bahan Makanan",  emoji: "🧈",  lastUpdated: "2026-06-14" },
  { id: 13, nama: "Cup Plastik 16oz",         satuan: "pcs",  stok: 120,  batasMin: 200,kategori: "Packaging",      emoji: "🥤",  lastUpdated: "2026-06-17" },
  { id: 14, nama: "Cup Paper Hot 12oz",       satuan: "pcs",  stok: 350,  batasMin: 150,kategori: "Packaging",      emoji: "☕",  lastUpdated: "2026-06-16" },
  { id: 15, nama: "Sedotan Kertas",           satuan: "pcs",  stok: 80,   batasMin: 100,kategori: "Packaging",      emoji: "🥢",  lastUpdated: "2026-06-15" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatus(stok: number, batasMin: number): StokStatus {
  if (stok < batasMin)            return "Kritis";
  if (stok < batasMin * 1.3)      return "Peringatan";
  return "Aman";
}

const statusStyle: Record<StokStatus, { badge: string; dot: string; bar: string }> = {
  Aman:       { badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400", bar: "from-emerald-600 to-emerald-400" },
  Peringatan: { badge: "bg-amber-500/12   text-amber-400   border-amber-500/25",   dot: "bg-amber-400",   bar: "from-amber-600 to-yellow-400"   },
  Kritis:     { badge: "bg-red-500/12     text-red-400     border-red-500/25",      dot: "bg-red-400",     bar: "from-red-600 to-rose-400"       },
};

const kategoriColor: Record<string, string> = {
  "Kopi":           "bg-amber-500/10  text-amber-400  border-amber-500/20",
  "Susu & Krim":    "bg-blue-500/10   text-blue-400   border-blue-500/20",
  "Pemanis":        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Bahan Makanan":  "bg-green-500/10  text-green-400  border-green-500/20",
  "Packaging":      "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const formatTgl = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

type FilterKategori = "Semua" | BahanBaku["kategori"];
const filterOptions: FilterKategori[] = ["Semua", "Kopi", "Susu & Krim", "Pemanis", "Bahan Makanan", "Packaging"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function StokPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData]                     = useState<BahanBaku[]>(initialData);
  const [filterKat, setFilterKat]           = useState<FilterKategori>("Semua");
  const [search, setSearch]                 = useState("");
  const [showModal, setShowModal]           = useState(false);
  const [editItem, setEditItem]             = useState<BahanBaku | null>(null);
  const [deltaStok, setDeltaStok]           = useState("");
  const [deltaMode, setDeltaMode]           = useState<"tambah" | "kurangi">("tambah");
  const [showAddModal, setShowAddModal]     = useState(false);
  const [addForm, setAddForm]               = useState({ nama: "", kategori: "Kopi" as BahanBaku["kategori"], satuan: "kg", stok: "", batasMin: "" });

  // ── Filtered & sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data
      .filter((b) => {
        const matchKat = filterKat === "Semua" || b.kategori === filterKat;
        const matchQ   = b.nama.toLowerCase().includes(search.toLowerCase());
        return matchKat && matchQ;
      })
      .sort((a, b) => {
        // Kritis first, then Peringatan, then Aman
        const order: Record<StokStatus, number> = { Kritis: 0, Peringatan: 1, Aman: 2 };
        return order[getStatus(a.stok, a.batasMin)] - order[getStatus(b.stok, b.batasMin)];
      });
  }, [data, filterKat, search]);

  // ── Summary counts ─────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    let aman = 0, peringatan = 0, kritis = 0;
    for (const b of data) {
      const s = getStatus(b.stok, b.batasMin);
      if (s === "Aman") aman++;
      else if (s === "Peringatan") peringatan++;
      else kritis++;
    }
    return { aman, peringatan, kritis, total: data.length };
  }, [data]);

  // ── Modal: open ────────────────────────────────────────────────────────────
  const openModal = (item: BahanBaku) => {
    setEditItem(item);
    setDeltaStok("");
    setDeltaMode("tambah");
    setShowModal(true);
  };

  // ── Modal: Add Save ────────────────────────────────────────────────────────
  const handleAddSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.satuan || !addForm.stok || !addForm.batasMin) return;
    
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    const newItem: BahanBaku = {
      id: newId,
      nama: addForm.nama,
      satuan: addForm.satuan,
      stok: Number(addForm.stok),
      batasMin: Number(addForm.batasMin),
      kategori: addForm.kategori,
      emoji: "📦",
      lastUpdated: new Date().toISOString().split("T")[0]
    };
    
    setData([newItem, ...data]);
    setShowAddModal(false);
    setAddForm({ nama: "", kategori: "Kopi", satuan: "kg", stok: "", batasMin: "" });
  };

  // ── Modal: save ────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!editItem || !deltaStok || isNaN(Number(deltaStok)) || Number(deltaStok) <= 0) return;
    const delta = Number(deltaStok);
    setData((prev) =>
      prev.map((b) => {
        if (b.id !== editItem.id) return b;
        const newStok = deltaMode === "tambah" ? b.stok + delta : Math.max(0, b.stok - delta);
        return { ...b, stok: newStok, lastUpdated: new Date().toISOString().split("T")[0] };
      })
    );
    setShowModal(false);
    setEditItem(null);
  };

  // ── Header date ────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

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

            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold gradient-text font-display tracking-tight truncate">
                Stok Bahan Baku
              </h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] lg:text-[11px] text-[var(--text-muted)] bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-full whitespace-nowrap">
              {data.length} item
            </span>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6">

            {/* ── Summary Cards ── */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 flex-shrink-0"/>
              <h2 className="text-xs md:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Ringkasan Inventaris
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]"/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Item",   value: summary.total,      icon: "📦", accent: "border-white/[0.08]",      text: "text-[var(--text-primary)]" },
                { label: "Stok Aman",    value: summary.aman,       icon: "✅", accent: "border-emerald-500/25",    text: "text-emerald-400" },
                { label: "Peringatan",   value: summary.peringatan, icon: "⚠️", accent: "border-amber-500/25",      text: "text-amber-400" },
                { label: "Kritis",       value: summary.kritis,     icon: "🚨", accent: "border-red-500/25",        text: "text-red-400" },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`glass-card px-4 py-3 flex items-center gap-3 border ${card.accent}`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <p className={`text-xl font-bold ${card.text}`}>{card.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  id="stok-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari bahan baku…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,136,60,0.15)" }}
                />
              </div>
              {/* Category filter */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mb-0.5 flex-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilterKat(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 border ${
                      filterKat === opt
                        ? "text-amber-300 border-amber-500/30"
                        : "text-[var(--text-muted)] border-white/[0.06] hover:text-[var(--text-primary)]"
                    }`}
                    style={
                      filterKat === opt
                        ? { background: "linear-gradient(135deg,rgba(139,69,19,0.30),rgba(200,136,60,0.15))" }
                        : { background: "rgba(255,255,255,0.03)" }
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {/* Add New Item Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 text-white"
                style={{ background: "linear-gradient(135deg, #8B4513, #C8883C)", boxShadow: "0 4px 12px rgba(139,69,19,0.3)" }}
              >
                + Tambah Bahan Baku
              </button>
            </div>

            {/* ── Inventory Table ── */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]" id="stok-table">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}>
                      {["Bahan Baku", "Kategori", "Stok Saat Ini", "Batas Min", "Status", "Terakhir Update", "Aksi"].map((col) => (
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
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                          Tidak ada bahan baku ditemukan.
                        </td>
                      </tr>
                    )}

                    {filtered.map((item) => {
                      const status = getStatus(item.stok, item.batasMin);
                      const st     = statusStyle[status];
                      const pctBar = Math.min((item.stok / (item.batasMin * 2)) * 100, 100);

                      return (
                        <tr
                          key={item.id}
                          className="group hover:bg-white/[0.025] transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          {/* Nama */}
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-xl flex-shrink-0">{item.emoji}</span>
                              <div>
                                <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{item.nama}</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">ID: #{String(item.id).padStart(3, "0")}</p>
                              </div>
                            </div>
                          </td>

                          {/* Kategori */}
                          <td className="px-4 md:px-5 py-3.5">
                            <span className={`inline-block whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full border ${kategoriColor[item.kategori] ?? ""}`}>
                              {item.kategori}
                            </span>
                          </td>

                          {/* Stok */}
                          <td className="px-4 md:px-5 py-3.5">
                            <div className="flex flex-col gap-1.5">
                              <span className={`text-[14px] font-bold ${
                                status === "Kritis" ? "text-red-400" :
                                status === "Peringatan" ? "text-amber-400" :
                                "text-[var(--text-primary)]"
                              }`}>
                                {item.stok} <span className="text-[11px] font-normal text-[var(--text-muted)]">{item.satuan}</span>
                              </span>
                              <div className="w-20 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${st.bar}`}
                                  style={{ width: `${pctBar}%`, transition: "width 0.5s ease" }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Batas Min */}
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] text-[var(--text-muted)]">
                              {item.batasMin} {item.satuan}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 md:px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${status === "Kritis" ? "animate-pulse" : ""}`}/>
                              {status}
                            </span>
                          </td>

                          {/* Last Updated */}
                          <td className="px-4 md:px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[12px] text-[var(--text-muted)]">{formatTgl(item.lastUpdated)}</span>
                          </td>

                          {/* Aksi */}
                          <td className="px-4 md:px-5 py-3.5">
                            <button
                              id={`update-stok-${item.id}`}
                              onClick={() => openModal(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-all hover:bg-amber-500/10"
                              style={{ border: "1px solid rgba(200,136,60,0.25)" }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-[11px] text-[var(--text-muted)]">
                  Menampilkan <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> dari <span className="font-semibold text-[var(--text-primary)]">{data.length}</span> item
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {summary.kritis > 0 && (
                    <span className="text-red-400 font-semibold">{summary.kritis} item perlu restok segera</span>
                  )}
                </span>
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-4"/>
          </div>
        </div>
      </main>

      {/* ── Modal Update Stok ── */}
      {showModal && editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,5,3,0.80)", backdropFilter: "blur(8px)" }}
            onClick={(e) => (e.target as HTMLElement) === e.currentTarget && setShowModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Update stok modal"
          />
          <div
            className="w-full max-w-md rounded-2xl flex flex-col animate-fade-up overflow-hidden relative z-10"
            style={{
              background: "linear-gradient(145deg, #2E1A10, #1F0D06)",
              border: "1px solid rgba(200,136,60,0.22)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,135,78,0.08)",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{editItem.emoji}</span>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Update Stok</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">{editItem.nama}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all"
                aria-label="Tutup modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Current info */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Stok Saat Ini</p>
                  <p className={`text-xl font-bold mt-0.5 ${
                    getStatus(editItem.stok, editItem.batasMin) === "Kritis" ? "text-red-400" :
                    getStatus(editItem.stok, editItem.batasMin) === "Peringatan" ? "text-amber-400" :
                    "text-[var(--text-primary)]"
                  }`}>
                    {editItem.stok} <span className="text-sm font-normal text-[var(--text-muted)]">{editItem.satuan}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Batas Min</p>
                  <p className="text-lg font-semibold text-[var(--text-muted)] mt-0.5">
                    {editItem.batasMin} {editItem.satuan}
                  </p>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Operasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["tambah", "kurangi"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDeltaMode(mode)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        deltaMode === mode
                          ? mode === "tambah"
                            ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                            : "text-red-300 border-red-500/30 bg-red-500/10"
                          : "text-[var(--text-muted)] border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      {mode === "tambah" ? "＋ Tambah Stok" : "－ Kurangi Stok"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delta input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="delta-stok" className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Jumlah ({editItem.satuan}) <span className="text-red-400">*</span>
                </label>
                <input
                  id="delta-stok"
                  type="number"
                  min={0}
                  step={editItem.satuan === "pcs" ? 1 : 0.5}
                  value={deltaStok}
                  onChange={(e) => setDeltaStok(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,136,60,0.18)" }}
                />
                {deltaStok && !isNaN(Number(deltaStok)) && Number(deltaStok) > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Stok akan menjadi:{" "}
                    <span className="font-bold text-[var(--text-primary)]">
                      {deltaMode === "tambah"
                        ? editItem.stok + Number(deltaStok)
                        : Math.max(0, editItem.stok - Number(deltaStok))
                      } {editItem.satuan}
                    </span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div
                className="flex items-center gap-3 pt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!deltaStok || isNaN(Number(deltaStok)) || Number(deltaStok) <= 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #8B4513, #C8883C)",
                    color: "#F5EDD8",
                    boxShadow: "0 4px 16px rgba(139,69,19,0.35)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Bahan Baku ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(5,2,1,0.85)", backdropFilter: "blur(8px)" }}
            onClick={(e) => (e.target as HTMLElement) === e.currentTarget && setShowAddModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowAddModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Tambah stok modal"
          />
          <div
            className="w-full max-w-md rounded-3xl p-6 relative z-10 animate-fade-up flex flex-col"
            style={{
              background: "linear-gradient(145deg,#2E1A10,#1A0D06)",
              border: "1px solid rgba(200,136,60,0.25)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.80), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  📦
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">Tambah Barang Baru</h3>
                  <p className="text-[10px] font-semibold text-amber-400 mt-0.5 tracking-wider uppercase">Inventaris Stok</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/[0.08] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Nama Bahan</label>
                <input type="text" required value={addForm.nama} onChange={(e) => setAddForm({...addForm, nama: e.target.value})} placeholder="Mis. Sirup Hazelnut" className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Kategori</label>
                <select value={addForm.kategori} onChange={(e) => setAddForm({...addForm, kategori: e.target.value as BahanBaku["kategori"]})} className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 appearance-none">
                  <option value="Kopi">Kopi</option>
                  <option value="Susu & Krim">Susu & Krim</option>
                  <option value="Pemanis">Pemanis</option>
                  <option value="Bahan Makanan">Bahan Makanan</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Satuan</label>
                  <input type="text" required value={addForm.satuan} onChange={(e) => setAddForm({...addForm, satuan: e.target.value})} placeholder="kg, liter, pcs" className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Batas Minimal</label>
                  <input type="number" required min="1" value={addForm.batasMin} onChange={(e) => setAddForm({...addForm, batasMin: e.target.value})} placeholder="0" className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="pb-2">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Stok Awal</label>
                <input type="number" required min="0" value={addForm.stok} onChange={(e) => setAddForm({...addForm, stok: e.target.value})} placeholder="0" className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500/50" />
              </div>
              
              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] text-white"
                style={{ background: "linear-gradient(135deg, #8B4513, #C8883C)", boxShadow: "0 8px 24px rgba(139,69,19,0.3)" }}
              >
                Simpan Bahan Baku
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
