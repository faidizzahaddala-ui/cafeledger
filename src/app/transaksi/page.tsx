"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TransaksiManagement from "@/components/TransaksiManagement";

export default function TransaksiPage() {
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
            <h1 className="text-base md:text-xl font-bold gradient-text truncate">Transaksi</h1>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <TransaksiManagement />
          </div>
        </div>
      </main>
    </div>
  );
}
