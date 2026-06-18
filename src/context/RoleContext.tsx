"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = "Owner" | "Kasir" | "Barista";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (page: string) => boolean;
}

// ── Access Matrix ─────────────────────────────────────────────────────────────
const ACCESS_MAP: Record<UserRole, string[]> = {
  Owner:   ["/", "/pos", "/transaksi", "/laporan", "/stok", "/akun", "/pengaturan"],
  Kasir:   ["/", "/pos"],
  Barista: ["/stok"],
};

// ── Context ───────────────────────────────────────────────────────────────────
const RoleContext = createContext<RoleContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("Owner");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cafeledger-role") as UserRole | null;
      if (saved && ["Owner", "Kasir", "Barista"].includes(saved)) {
        setRoleState(saved);
      }
    } catch {
      // SSR or localStorage unavailable
    }
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("cafeledger-role", newRole);
    } catch {
      // ignore
    }
  }, []);

  const canAccess = useCallback(
    (page: string) => ACCESS_MAP[role].includes(page),
    [role]
  );

  return (
    <RoleContext.Provider value={{ role, setRole, canAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within <RoleProvider>");
  return ctx;
}
