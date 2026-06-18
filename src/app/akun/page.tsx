"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";

export default function AkunPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ── Sidebar (desktop: in-flow | mobile: overlay drawer) ── */}
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* ── Main Content ── */}
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
            <h1 className="text-base md:text-xl font-bold gradient-text truncate">Manajemen Akun</h1>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" placeholder="Cari nama karyawan..." className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl py-2.5 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 transition-all hover:bg-white/[0.05]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-light)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Staf
              </button>
            </div>

            {/* Table Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-6 py-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Karyawan</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Peran Akses</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Login Terakhir</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {/* Row 1 */}
                    <tr className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            F
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Faid Izzah</p>
                            <p className="text-[11px] text-[var(--text-muted)]">faid@yallacoffee.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          Owner
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,163,74,0.6)] animate-pulse" />
                          <span className="text-xs text-emerald-400 font-medium">Online</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">Sekarang</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            B
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Budi Santoso</p>
                            <p className="text-[11px] text-[var(--text-muted)]">kasir1@yallacoffee.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Kasir
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-50" />
                          <span className="text-xs text-[var(--text-muted)]">Offline</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">2 jam yang lalu</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                    {/* Row 3 */}
                    <tr className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            S
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Siti Aminah</p>
                            <p className="text-[11px] text-[var(--text-muted)]">barista1@yallacoffee.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          Barista
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-50" />
                          <span className="text-xs text-[var(--text-muted)]">Offline</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">Kemarin</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
                <p className="text-xs text-[var(--text-muted)] text-center opacity-70">
                  Mode Demo: Halaman ini adalah pratinjau antarmuka untuk Fase 2. Fungsi penambahan user belum terhubung ke database.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
