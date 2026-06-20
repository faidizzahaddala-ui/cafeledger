"use client";

import React from "react";

// Dummy normalized bar heights (for visual effect)
const dataMap: Record<string, { days: string[]; heights: number[] }> = {
  "7H": {
    days: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    heights: [55, 70, 45, 88, 65, 92, 78],
  },
  "14H": {
    days: ["1", "3", "5", "7", "9", "11", "13"],
    heights: [45, 55, 40, 60, 50, 75, 80],
  },
  "30H": {
    days: ["1", "5", "10", "15", "20", "25", "30"],
    heights: [60, 40, 80, 55, 90, 70, 95],
  },
};

export default function ChartPlaceholder({ period = "7H" }: { period?: string }) {
  const chartData = dataMap[period] || dataMap["7H"];
  const barHeights = chartData.heights;
  const days = chartData.days;
  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart area */}
      <div className="flex-1 relative">
        {/* Y-axis guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--text-muted)] w-8 text-right flex-shrink-0">
                {val > 0 ? `${val}%` : ""}
              </span>
              <div className="flex-1 border-t border-white/[0.05]" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute bottom-8 left-12 right-0 flex items-end justify-around h-[calc(100%-2rem)]">
          {barHeights.map((height, idx) => (
            <div key={idx} className="flex flex-col items-center justify-end gap-1.5 group h-full">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] text-[var(--text-primary)] whitespace-nowrap pointer-events-none z-10">
                Rp {(height * 150000).toLocaleString("id-ID")}
              </div>

              {/* Bar */}
              <div
                className="w-7 rounded-t-md transition-all duration-500 group-hover:brightness-125 cursor-pointer"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(to top, #8B4513, #D4874E)`,
                  boxShadow: `0 0 12px rgba(212, 135, 78, ${height / 200})`,
                  animationDelay: `${idx * 0.07}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around pl-12 pt-2">
        {days.map((day, idx) => (
          <span
            key={idx}
            className="text-[11px] text-[var(--text-muted)] font-medium w-7 text-center"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-coffee-500 to-caramel" />
          <span className="text-[11px] text-[var(--text-muted)]">Transaksi Harian</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <span className="text-emerald-400 font-semibold">▲ 12.4%</span>
          <span>vs minggu lalu</span>
        </div>
      </div>
    </div>
  );
}
