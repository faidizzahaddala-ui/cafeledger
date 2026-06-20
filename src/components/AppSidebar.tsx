/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, type UserRole } from "@/context/RoleContext";

// ── Nav Item Definition ───────────────────────────────────────────────────────
interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles: UserRole[]; // which roles can see this item
  badge?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    label: "Dashboard",
    href: "/",
    roles: ["Owner", "Kasir"],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    label: "Kasir POS",
    href: "/pos",
    roles: ["Owner", "Kasir"],
    badge: (
      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
        Live
      </span>
    ),
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: "Transaksi",
    href: "/transaksi",
    roles: ["Owner"],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    label: "Laporan Keuangan",
    href: "/laporan",
    roles: ["Owner"],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    label: "Stok Bahan Baku",
    href: "/stok",
    roles: ["Owner", "Barista"],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: "Manajemen Akun",
    href: "/akun",
    roles: ["Owner"],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    label: "Pengaturan",
    href: "/pengaturan",
    roles: ["Owner"],
  },
];

// ── Role Config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; avatar: string; email: string }> = {
  Owner:   { label: "Owner",   color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",   avatar: "from-amber-600 to-orange-700",  email: "owner@yallacoffee.id" },
  Kasir:   { label: "Kasir",   color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", avatar: "from-emerald-600 to-green-700", email: "kasir@yallacoffee.id" },
  Barista: { label: "Barista", color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/25",     avatar: "from-blue-600 to-indigo-700",   email: "barista@yallacoffee.id" },
};

// ── Shared sidebar content ────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  onLinkClick,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  const cfg = ROLE_CONFIG[role];

  return (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 py-5 border-b border-white/[0.06] flex-shrink-0 relative ${collapsed ? 'px-0 justify-center cursor-pointer' : 'px-4'}`}
           onClick={collapsed ? onToggleCollapse : undefined}
           title={collapsed ? "Perluas Menu" : undefined}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(212,135,78,0.40)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">CafeLedger</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide">Yalla Coffee</span>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden md:block"
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-3 mb-2 opacity-60">
            Menu Utama
          </p>
        )}
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={onLinkClick}
            className={`nav-link ${isActive(item.href) ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex items-center gap-2 flex-1">
                {item.label}
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── Role Switcher ── */}
      <div className={`px-3 py-3 border-t border-white/[0.06] flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.04] ${
              collapsed ? "justify-center" : ""
            }`}
            style={{ border: "1px solid transparent" }}
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.avatar} flex items-center justify-center flex-shrink-0 text-xs font-bold text-white`}>
              {cfg.label[0]}
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col overflow-hidden text-left flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{cfg.label}</span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate">{cfg.email}</span>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                  className={`flex-shrink-0 transition-transform duration-200 ${roleSwitcherOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </>
            )}
          </button>

          {/* Dropdown */}
          {roleSwitcherOpen && (
            <div
              className={`absolute ${collapsed ? "left-full ml-2 bottom-0" : "left-0 right-0 bottom-full mb-2"} rounded-xl overflow-hidden animate-fade-in z-50`}
              style={{
                background: "linear-gradient(145deg, #3A1F12, #2E1710)",
                border: "1px solid rgba(200,136,60,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.60), 0 0 0 1px rgba(200,136,60,0.08)",
                minWidth: collapsed ? "180px" : undefined,
              }}
            >
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-muted)] opacity-70">
                  Ganti Peran
                </p>
              </div>
              {(["Owner", "Kasir", "Barista"] as UserRole[]).map((r) => {
                const rc = ROLE_CONFIG[r];
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    id={`role-option-${r.toLowerCase()}`}
                    onClick={() => {
                      setRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/[0.04] ${
                      isSelected ? "bg-white/[0.06]" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rc.avatar} flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white`}>
                      {rc.label[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--text-primary)]">{rc.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{rc.email}</p>
                    </div>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
              <div className="px-3 py-2 border-t border-white/[0.06] mt-1">
                <button
                  onClick={async () => {
                    const { supabase } = await import('@/utils/supabase');
                    await supabase.auth.signOut();
                    window.location.href = "/auth";
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all text-[11px] font-bold tracking-wide"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Keluar / Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar (md+): normal flow, always visible ── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 h-full transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{
          background: "linear-gradient(180deg, #2C1810 0%, #1A0D08 100%)",
          borderRight: "1px solid rgba(200, 136, 60, 0.12)",
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* ── Mobile Drawer: fixed overlay, only when mobileOpen ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(5,2,1,0.70)", backdropFilter: "blur(4px)" }}
            onClick={onMobileClose}
            onKeyDown={(e) => e.key === "Escape" && onMobileClose?.()}
            role="button"
            tabIndex={0}
            aria-label="Tutup menu"
          />

          {/* Drawer Panel */}
          <aside
            className="relative flex flex-col w-64 h-full z-10 animate-fade-up"
            style={{
              background: "linear-gradient(180deg, #2C1810 0%, #1A0D08 100%)",
              borderRight: "1px solid rgba(200, 136, 60, 0.18)",
              boxShadow: "4px 0 32px rgba(0,0,0,0.60)",
            }}
          >
            {/* Close button (mobile only) */}
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all z-10"
              aria-label="Tutup sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <SidebarContent
              collapsed={false}
              onLinkClick={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}
