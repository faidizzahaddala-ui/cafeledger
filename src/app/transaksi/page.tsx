"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";

export default function TransaksiPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
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
            <h1 className="text-base md:text-xl font-bold gradient-text">Transaksi</h1>
          </div>
        </header>
        
        {/* Body */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div
            className="max-w-md w-full rounded-2xl p-8 text-center flex flex-col items-center gap-5 animate-fade-up"
            style={{
              background: "linear-gradient(145deg, rgba(200,136,60,0.08), rgba(255,255,255,0.03))",
              border: "1px solid rgba(200,136,60,0.20)",
              boxShadow: "0 8px 32px rgba(200,136,60,0.08)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(200,136,60,0.12)", border: "1px solid rgba(200,136,60,0.25)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Modul dalam Pengembangan</h2>
              <p className="text-[13px] text-[var(--text-muted)] mt-3 leading-relaxed">
                Fitur ini dijadwalkan pada roadmap rilis <span className="font-semibold text-amber-200">Fase 2 (Post-MVP)</span> untuk optimalisasi sistem informasi kafenya.
              </p>
            </div>
            <a
              href="/"
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
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
