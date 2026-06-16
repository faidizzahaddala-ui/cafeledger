"use client";

import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accentColor: "gold" | "green" | "red";
  animationDelay?: string;
}

const accentMap = {
  gold: {
    icon:    "bg-gradient-to-br from-amber-500/20 to-yellow-600/10 text-amber-400",
    border:  "hover:border-amber-500/40",
    glow:    "hover:shadow-[0_8px_32px_rgba(212,135,78,0.25)]",
    badge:   "text-amber-400",
    bar:     "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  green: {
    icon:    "bg-gradient-to-br from-emerald-500/20 to-green-600/10 text-emerald-400",
    border:  "hover:border-emerald-500/40",
    glow:    "hover:shadow-[0_8px_32px_rgba(22,163,74,0.20)]",
    badge:   "text-emerald-400",
    bar:     "bg-gradient-to-r from-emerald-500 to-green-400",
  },
  red: {
    icon:    "bg-gradient-to-br from-red-500/20 to-rose-600/10 text-red-400",
    border:  "hover:border-red-500/40",
    glow:    "hover:shadow-[0_8px_32px_rgba(220,38,38,0.20)]",
    badge:   "text-red-400",
    bar:     "bg-gradient-to-r from-red-500 to-rose-400",
  },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  animationDelay = "0s",
}: KpiCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div
      className={`glass-card p-6 flex flex-col gap-4 ${accent.border} ${accent.glow} animate-fade-up`}
      style={{ animationDelay }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-[var(--text-muted)] opacity-70">{subtitle}</span>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.icon}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold flex items-center gap-1 ${
              trend.positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <span>{trend.positive ? "▲" : "▼"}</span>
            {trend.value}
          </span>
        )}
      </div>

      {/* Accent Bar */}
      <div className="w-full h-[3px] rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full ${accent.bar} rounded-full`} style={{ width: "65%" }} />
      </div>
    </div>
  );
}
