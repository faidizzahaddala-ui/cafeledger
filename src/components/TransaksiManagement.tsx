"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  getTransaksi,
  insertTransaksi,
  type Transaksi,
  type TipeTransaksi,
  type KategoriTransaksi,
} from "@/utils/supabase";

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style:                 "currency",
    currency:              "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });

const categoryColor: Record<KategoriTransaksi, string> = {
  Sales:            "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "Other Income":   "bg-teal-500/15    text-teal-400    border-teal-500/25",
  COGS:             "bg-amber-500/15   text-amber-400   border-amber-500/25",
  Utility:          "bg-blue-500/15    text-blue-400    border-blue-500/25",
  Salary:           "bg-purple-500/15  text-purple-400  border-purple-500/25",
  "Other Expense":  "bg-pink-500/15    text-pink-400    border-pink-500/25",
};

// Kategori bergantung pada Tipe yang dipilih
const categoryByType: Record<TipeTransaksi, KategoriTransaksi[]> = {
  Pemasukan:   ["Sales", "Other Income"],
  Pengeluaran: ["COGS", "Utility", "Salary", "Other Expense"],
};

const getCategoryOptions = (type: TipeTransaksi) => categoryByType[type];

const defaultForm = {
  type:        "Pemasukan" as TipeTransaksi,
  category:    "Sales"     as KategoriTransaksi,
  description: "",
  amount:      "",
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function TransaksiManagement() {
  // ── State ──
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(defaultForm);
  const [filterType, setFilterType]       = useState<"Semua" | TipeTransaksi>("Semua");
  const [errors, setErrors]               = useState<{ description?: string; amount?: string }>({});
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState(false);

  // ── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getTransaksi();
      setTransaksiList(data);
    } catch (_e) {
      setFetchError("Gagal memuat data transaksi dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Real-time Subscription ──────────────────────────────────────────────────
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransaksiList((prev) => [payload.new as Transaksi, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTransaksiList((prev) =>
              prev.filter((t) => t.id !== (payload.old as Transaksi).id)
            );
          } else {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered =
    filterType === "Semua"
      ? transaksiList
      : transaksiList.filter((t) => t.type === filterType);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!form.description.trim())
      e.description = "Deskripsi tidak boleh kosong.";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Nominal harus berupa angka positif.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit → INSERT ke Supabase ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const result = await insertTransaksi({
      type:        form.type,
      category:    form.category,
      description: form.description.trim(),
      amount:      Number(form.amount),
    });

    setSubmitting(false);

    if (!result) {
      setSubmitError(
        "Gagal menyimpan transaksi. Periksa koneksi atau struktur tabel Supabase."
      );
      return;
    }

    // Sukses → tutup modal, reset form, tampilkan toast
    closeModal();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3500);
    fetchData(); // fallback refresh
  };

  // ── Close Modal ─────────────────────────────────────────────────────────────
  const closeModal = () => {
    setShowModal(false);
    setForm(defaultForm);
    setErrors({});
    setSubmitError(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Section Wrapper ── */}
      <section
        id="transaksi-section"
        className="flex flex-col gap-4 animate-fade-up"
        style={{ animationDelay: "0.5s" }}
      >
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Manajemen Transaksi
          </h2>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[11px] text-[var(--text-muted)] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {loading ? "Memuat…" : `${transaksiList.length} entri`}
          </span>
        </div>

        {/* Toast: Sukses */}
        {successMsg && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-300 animate-fade-in"
            style={{ background: "rgba(16,163,74,0.12)", border: "1px solid rgba(16,163,74,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Transaksi berhasil disimpan ke database!
          </div>
        )}

        {/* Toast: Fetch Error */}
        {fetchError && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-300 animate-fade-in"
            style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {fetchError}
            <button onClick={fetchData} className="ml-auto text-xs underline opacity-80 hover:opacity-100">
              Coba lagi
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setFilterType(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  filterType === f
                    ? f === "Pemasukan"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : f === "Pengeluaran"
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "text-[var(--text-muted)] bg-white/[0.03] border-white/[0.06] hover:text-[var(--text-primary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh manual */}
            <button
              id="btn-refresh-transaksi"
              onClick={fetchData}
              disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              aria-label="Refresh data"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={loading ? "animate-spin" : ""}
              >
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>

            {/* + Transaksi Baru */}
            <button
              id="btn-transaksi-baru"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #8B4513, #C8883C)",
                color: "#F5EDD8",
                boxShadow: "0 4px 16px rgba(139, 69, 19, 0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Transaksi Baru
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" id="transaksi-table">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}>
                  {["Tanggal", "Tipe", "Kategori", "Deskripsi", "Nominal"].map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Loading Skeleton */}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-3 rounded-full animate-pulse"
                          style={{
                            background: "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 75%)",
                            width: j === 3 ? "70%" : j === 4 ? "50%" : "60%",
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-muted)]">Belum ada transaksi</p>
                          <p className="text-[11px] text-[var(--text-muted)] opacity-60 mt-0.5">
                            Klik &quot;+ Transaksi Baru&quot; untuk menambahkan data
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows — semua referensi pakai kolom bahasa Inggris */}
                {!loading && filtered.map((trx) => (
                  <tr
                    key={trx.id}
                    className="group transition-colors duration-150 hover:bg-white/[0.025]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* Tanggal ← created_at */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[var(--text-muted)] text-[12px]">
                        {formatTanggal(trx.created_at)}
                      </span>
                    </td>

                    {/* Tipe ← type */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          trx.type === "Pemasukan"
                            ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                            : "bg-red-500/12 text-red-400 border-red-500/25"
                        }`}
                      >
                        <span>{trx.type === "Pemasukan" ? "▲" : "▼"}</span>
                        {trx.type}
                      </span>
                    </td>

                    {/* Kategori ← category */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          categoryColor[trx.category] ?? "bg-white/10 text-white/60 border-white/10"
                        }`}
                      >
                        {trx.category}
                      </span>
                    </td>

                    {/* Deskripsi ← description */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <span className="text-[var(--text-primary)] text-[13px] leading-snug line-clamp-1">
                        {trx.description}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                        #{String(trx.id).slice(0, 8).toUpperCase()}
                      </p>
                    </td>

                    {/* Nominal ← amount */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`font-bold text-[13px] ${
                          trx.type === "Pemasukan" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {trx.type === "Pengeluaran" ? "−" : "+"}
                        {formatRupiah(trx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-[11px] text-[var(--text-muted)]">
                Menampilkan{" "}
                <span className="text-[var(--text-primary)] font-semibold">{filtered.length}</span>{" "}
                dari{" "}
                <span className="text-[var(--text-primary)] font-semibold">{transaksiList.length}</span>{" "}
                transaksi
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Net:{" "}
                <span
                  className={`font-bold ${
                    filtered.reduce((s, t) => s + (t.type === "Pemasukan" ? t.amount : -t.amount), 0) >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatRupiah(
                    Math.abs(
                      filtered.reduce((s, t) => s + (t.type === "Pemasukan" ? t.amount : -t.amount), 0)
                    )
                  )}
                </span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal ── */}
      {showModal && (
        <div
          id="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(10,5,3,0.80)", backdropFilter: "blur(8px)" }}
          onClick={(e) => (e.target as HTMLElement) === e.currentTarget && closeModal()}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-label="Form transaksi baru"
        >
          <div
            id="modal-transaksi"
            className="w-full max-w-lg rounded-2xl flex flex-col animate-fade-up overflow-hidden"
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
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Tambah Transaksi Baru</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Data tersimpan ke Supabase</p>
                </div>
              </div>
              <button
                id="modal-close-btn"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all"
                aria-label="Tutup modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

              {/* Submit Error */}
              {submitError && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl text-[12px] text-red-300 animate-fade-in"
                  style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.25)" }}
                >
                  <svg className="mt-0.5 flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {submitError}
                </div>
              )}

              {/* Row: Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-type" className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Tipe <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="form-type"
                      value={form.type}
                      onChange={(e) => {
                        const newType = e.target.value as TipeTransaksi;
                        const newCats = getCategoryOptions(newType);
                        setForm({
                          ...form,
                          type: newType,
                          category: newCats[0], // auto-reset ke kategori pertama dari tipe baru
                        });
                      }}
                      className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl text-sm font-medium text-[var(--text-primary)] outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,136,60,0.18)" }}
                    >
                      <option value="Pemasukan"  style={{ background: "#2C1810" }}>📈 Pemasukan</option>
                      <option value="Pengeluaran" style={{ background: "#2C1810" }}>📉 Pengeluaran</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-category" className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="form-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as KategoriTransaksi })}
                      className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl text-sm font-medium text-[var(--text-primary)] outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,136,60,0.18)" }}
                    >
                      {getCategoryOptions(form.type).map((c) => (
                        <option key={c} value={c} style={{ background: "#2C1810" }}>{c}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-description" className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Deskripsi <span className="text-red-400">*</span>
                </label>
                <input
                  id="form-description"
                  type="text"
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  placeholder="Contoh: Penjualan Es Kopi Susu batch pagi…"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${errors.description ? "rgba(239,68,68,0.5)" : "rgba(200,136,60,0.18)"}`,
                  }}
                />
                {errors.description && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-amount" className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Nominal (Rp) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">Rp</span>
                  <input
                    id="form-amount"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.amount}
                    onChange={(e) => {
                      setForm({ ...form, amount: e.target.value });
                      setErrors((p) => ({ ...p, amount: undefined }));
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${errors.amount ? "rgba(239,68,68,0.5)" : "rgba(200,136,60,0.18)"}`,
                    }}
                  />
                </div>
                {form.amount && !isNaN(Number(form.amount)) && Number(form.amount) > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    = {formatRupiah(Number(form.amount))}
                  </p>
                )}
                {errors.amount && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Preview */}
              {form.description && form.amount && !isNaN(Number(form.amount)) && Number(form.amount) > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl animate-fade-in"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      form.type === "Pemasukan"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : "bg-red-500/15 text-red-400 border-red-500/25"
                    }`}>
                      {form.type}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] truncate">{form.description}</span>
                  </div>
                  <span className={`flex-shrink-0 text-sm font-bold ml-3 ${
                    form.type === "Pemasukan" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {form.type === "Pengeluaran" ? "−" : "+"}
                    {formatRupiah(Number(form.amount))}
                  </span>
                </div>
              )}

              {/* Supabase info */}
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] opacity-60">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Kolom yang diisi:{" "}
                <code className="font-mono bg-white/[0.06] px-1 rounded">type</code>
                <code className="font-mono bg-white/[0.06] px-1 rounded">category</code>
                <code className="font-mono bg-white/[0.06] px-1 rounded">description</code>
                <code className="font-mono bg-white/[0.06] px-1 rounded">amount</code>
              </div>

              {/* Buttons */}
              <div
                className="flex items-center gap-3 pt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  type="button"
                  id="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="modal-submit-btn"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #8B4513, #C8883C)",
                    color: "#F5EDD8",
                    boxShadow: "0 4px 16px rgba(139,69,19,0.35)",
                  }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Simpan Transaksi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
