"use client";

import React from "react";

interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  minStock: number;
  status: "critical" | "warning" | "low";
}

const stockData: StockItem[] = [
  {
    id: "001",
    name: "Kopi House Blend Yalla",
    currentStock: 1.2,
    unit: "kg",
    minStock: 5,
    status: "critical",
  },
  {
    id: "002",
    name: "Susu UHT Full Cream",
    currentStock: 8,
    unit: "liter",
    minStock: 15,
    status: "warning",
  },
  {
    id: "003",
    name: "Sirup Hazelnut Monin",
    currentStock: 0.5,
    unit: "liter",
    minStock: 3,
    status: "critical",
  },
  {
    id: "004",
    name: "Sirup Caramel Torani",
    currentStock: 1.1,
    unit: "liter",
    minStock: 3,
    status: "warning",
  },
  {
    id: "005",
    name: "Gula Pasir",
    currentStock: 2,
    unit: "kg",
    minStock: 5,
    status: "low",
  },
];

const statusConfig = {
  critical: {
    badge: "badge-danger",
    label: "Kritis",
    dot: "bg-red-500",
    bar: "bg-gradient-to-r from-red-600 to-red-400",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.25)]",
  },
  warning: {
    badge: "badge-warning",
    label: "Peringatan",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.20)]",
  },
  low: {
    badge: "badge-warning",
    label: "Rendah",
    dot: "bg-orange-400",
    bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    glow: "",
  },
};

export default function StockAlerts() {
  return (
    <div className="flex flex-col gap-3">
      {stockData.map((item, idx) => {
        const cfg = statusConfig[item.status];
        const pct = Math.min((item.currentStock / item.minStock) * 100, 100);

        return (
          <div
            key={item.id}
            className={`sidebar-card p-4 animate-fade-in ${cfg.glow}`}
            style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Pulsing dot for critical */}
                <span className="relative flex-shrink-0 mt-0.5">
                  <span
                    className={`block w-2 h-2 rounded-full ${cfg.dot} ${
                      item.status === "critical" ? "animate-pulse-slow" : ""
                    }`}
                  />
                </span>
                <span className="text-[13px] font-medium text-[var(--text-primary)] leading-tight truncate">
                  {item.name}
                </span>
              </div>
              <span className={`flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
            </div>

            {/* Stock info */}
            <div className="flex items-center justify-between mb-1.5 pl-4">
              <span className="text-[11px] text-[var(--text-muted)]">
                Stok:{" "}
                <span className="text-[var(--text-primary)] font-semibold">
                  {item.currentStock} {item.unit}
                </span>
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Min: {item.minStock} {item.unit}
              </span>
            </div>

            {/* Progress bar */}
            <div className="pl-4">
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
