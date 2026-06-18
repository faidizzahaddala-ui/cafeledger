"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";

export default function PengaturanPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Header ── */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 gap-3"
          style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="text-base md:text-xl font-bold gradient-text truncate">Pengaturan</h1>
          </div>
        </header>
        
        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
            
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center border border-amber-500/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Profil Bisnis</h2>
                  <p className="text-[12px] text-[var(--text-muted)]">Informasi dasar Yalla Coffee untuk cetak struk.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nama Outlet</label>
                  <input type="text" defaultValue="Yalla Coffee - Main Street" className="w-full text-sm font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nomor Telepon</label>
                  <input type="text" defaultValue="0812-3456-7890" className="w-full text-sm font-medium" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Alamat Lengkap</label>
                  <textarea rows={2} defaultValue="Jl. Sudirman No. 45, Jakarta Selatan" className="w-full text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center border border-emerald-500/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Konfigurasi Pajak & Biaya</h2>
                  <p className="text-[12px] text-[var(--text-muted)]">Pengaturan pemotongan otomatis pada sistem kasir.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pajak Pertambahan Nilai (PPN) 11%</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Otomatis tambahkan PPN pada setiap transaksi Dine-In.</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-emerald-500 relative cursor-not-allowed opacity-80">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Service Charge 5%</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Biaya layanan tambahan untuk meja VIP.</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-black/40 border border-white/10 relative cursor-not-allowed opacity-80">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--text-muted)] shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors">
                Batal
              </button>
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-[0_0_16px_rgba(200,136,60,0.4)] transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #8B4513, #C8883C)" }}>
                Simpan Perubahan
              </button>
            </div>

            <p className="text-center text-[11px] text-[var(--text-muted)] opacity-60 pt-4">
              Mode Demo: Halaman ini adalah pratinjau antarmuka untuk Fase 2. Data tidak akan tersimpan secara permanen.
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
