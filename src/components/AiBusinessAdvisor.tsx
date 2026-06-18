"use client";

import { useState, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AiAdvisorProps {
  totalPendapatan: number;
  totalBeban: number;
  labaBersih: number;
  stokKritis: number;
  loading: boolean;
}

// ── Analysis Engine ───────────────────────────────────────────────────────────
function generateAnalysis(
  pendapatan: number,
  beban: number,
  laba: number,
  stokKritis: number
): string[] {
  const margin = pendapatan > 0 ? (laba / pendapatan) * 100 : 0;
  const rasioBeban = pendapatan > 0 ? (beban / pendapatan) * 100 : 0;
  const lines: string[] = [];

  if (pendapatan === 0 && beban === 0) {
    lines.push("📊 Belum ada data transaksi yang cukup untuk dianalisis. Silakan tambahkan data penjualan dan pengeluaran melalui menu Kasir POS atau form Transaksi Baru di Dashboard.");
    lines.push("💡 Tip: Gunakan tombol 'Generate Data Dummy' di Dashboard untuk mengisi data demo sebelum presentasi.");
    return lines;
  }

  // ── RUGI ──
  if (laba < 0) {
    lines.push(`🔴 ANALISIS: Kafe sedang dalam posisi RUGI BERSIH. Margin laba saat ini berada di angka ${margin.toFixed(1)}%, yang artinya pengeluaran operasional melebihi pendapatan.`);

    if (rasioBeban > 100) {
      lines.push(`⚠️ Rasio beban terhadap pendapatan mencapai ${rasioBeban.toFixed(0)}% — ini sangat tinggi. Artinya, setiap Rp 1 pendapatan yang masuk, Anda membelanjakan lebih dari Rp ${(rasioBeban / 100).toFixed(2)} untuk operasional.`);
    } else {
      lines.push(`⚠️ Rasio beban terhadap pendapatan berada di ${rasioBeban.toFixed(0)}%. Beban operasional perlu dikurangi atau volume penjualan harus ditingkatkan secara signifikan.`);
    }

    lines.push("📋 REKOMENDASI EFISIENSI:");
    lines.push("  1️⃣ Evaluasi Struktur COGS — Negosiasi ulang harga supplier bahan baku. Pertimbangkan untuk membeli biji kopi dan susu dalam quantity lebih besar agar mendapat harga grosir yang lebih rendah per unit.");
    lines.push("  2️⃣ Optimasi Shift & Utilitas — Tinjau ulang jadwal barista part-time. Kurangi jumlah shift di jam-jam sepi (14.00-16.00) dan alokasikan SDM lebih banyak ke jam sibuk (07.00-11.00) untuk memaksimalkan penjualan per tenaga kerja.");
  }
  // ── UNTUNG ──
  else {
    lines.push(`🟢 SELAMAT! Kafe Yalla Coffee dalam posisi LABA BERSIH. Margin keuntungan bersih Anda saat ini adalah ${margin.toFixed(1)}%.`);

    if (margin >= 30) {
      lines.push(`🏆 Performa SANGAT BAIK — margin di atas 30% menunjukkan efisiensi operasional yang excellent. Ini adalah fondasi kuat untuk ekspansi bisnis.`);
      lines.push("📋 STRATEGI EKSPANSI:");
      lines.push("  1️⃣ Tambah Lini Menu Premium — Pertimbangkan untuk meluncurkan menu specialty seperti 'Seasonal Pour Over' atau 'Signature Cold Brew Bottle' dengan harga premium. Margin tinggi pada produk specialty bisa mencapai 70-85%.");
      lines.push("  2️⃣ Program Loyalty Pelanggan — Implementasikan sistem stamp card digital (beli 8 gratis 1) untuk meningkatkan retensi pelanggan dan frequency of visit hingga 40%.");
    } else if (margin >= 15) {
      lines.push(`✅ Performa SEHAT — margin ${margin.toFixed(1)}% berada di rentang industri F&B yang normal (15-25%). Ada ruang untuk optimasi lebih lanjut.`);
      lines.push("📋 STRATEGI PENINGKATAN:");
      lines.push("  1️⃣ Upselling & Bundling — Latih barista untuk menawarkan pairing combo (misal: Cappuccino + Croissant diskon 10%). Strategi ini bisa meningkatkan Average Order Value sebesar 15-25%.");
      lines.push("  2️⃣ Ekspansi Channel Digital — Tingkatkan kehadiran di GrabFood dan GoFood. Buat menu eksklusif online-only dengan margin yang lebih tinggi untuk mengkompensasi komisi platform.");
    } else {
      lines.push(`⚡ Performa MARGINAL — margin ${margin.toFixed(1)}% masih tipis. Perlu upaya untuk menaikkan profitabilitas sebelum mempertimbangkan ekspansi.`);
      lines.push("📋 REKOMENDASI PRIORITAS:");
      lines.push("  1️⃣ Review Pricing Strategy — Naikkan harga menu signature sebesar 5-10% secara gradual. Pelanggan loyal cenderung tidak sensitif terhadap kenaikan kecil jika kualitas konsisten.");
      lines.push("  2️⃣ Kurangi Waste & Spillage — Monitor ketat penggunaan bahan baku per cup. Implementasikan SOP takaran yang presisi untuk menekan COGS tanpa mengorbankan kualitas.");
    }
  }

  // ── STOK KRITIS ──
  if (stokKritis > 0) {
    lines.push("");
    lines.push(`🚨 PERINGATAN STOK KRITIS — Terdeteksi ${stokKritis} item bahan baku yang stoknya berada di bawah batas minimum! Segera lakukan restock untuk menghindari gangguan operasional. Kehabisan bahan baku utama bisa menyebabkan kehilangan pendapatan harian hingga 100%. Buka halaman Stok Bahan Baku untuk melihat detail item yang perlu segera di-reorder.`);
  }

  return lines;
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function ThinkingSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2 animate-pulse">
      {[85, 100, 95, 60, 100, 80, 70].map((w, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.05)" }}/>
          <div
            className="h-3 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              width: `${w}%`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-ping"/>
        <span className="text-[11px] text-amber-400/70 font-medium">AI sedang menganalisis data keuangan…</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AiBusinessAdvisor({
  totalPendapatan,
  totalBeban,
  labaBersih,
  stokKritis,
  loading: dataLoading,
}: AiAdvisorProps) {
  const [thinking, setThinking]   = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [visible, setVisible]     = useState(false);

  const analysis = useMemo(
    () => generateAnalysis(totalPendapatan, totalBeban, labaBersih, stokKritis),
    [totalPendapatan, totalBeban, labaBersih, stokKritis]
  );

  const handleAnalyze = () => {
    setShowResult(false);
    setVisible(false);
    setThinking(true);

    // Simulate AI processing
    setTimeout(() => {
      setThinking(false);
      setShowResult(true);
      // Trigger fade-in after a micro-delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, 2200);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(99,60,255,0.06), rgba(139,69,19,0.08), rgba(255,255,255,0.03))",
        border: "1px solid rgba(120,80,220,0.20)",
        boxShadow: "0 4px 24px rgba(99,60,255,0.08), 0 0 0 1px rgba(120,80,220,0.05)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(120,80,220,0.12)" }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* AI Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, #6340C7, #8B5CF6 50%, #A78BFA)",
              boxShadow: "0 0 20px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
              <circle cx="9" cy="10" r="1" fill="#F5EDD8"/>
              <circle cx="15" cy="10" r="1" fill="#F5EDD8"/>
              <path d="M9 14h6" strokeWidth="1.5"/>
            </svg>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-xl border-2 border-purple-400/30 animate-ping" style={{ animationDuration: "3s" }}/>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Business Advisor</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/25 uppercase tracking-wider">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
              Analisis cerdas berbasis data keuangan & inventaris kafe Anda
            </p>
          </div>
        </div>

        <button
          id="btn-ai-analysis"
          onClick={handleAnalyze}
          disabled={dataLoading || thinking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 whitespace-nowrap flex-shrink-0"
          style={{
            background: thinking
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #6340C7, #8B5CF6)",
            color: thinking ? "var(--text-muted)" : "#F5EDD8",
            boxShadow: thinking
              ? "none"
              : "0 4px 20px rgba(99,60,255,0.40), 0 0 0 1px rgba(139,92,246,0.25)",
          }}
        >
          {thinking ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Menganalisis…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              {showResult ? "Analisis Ulang" : "Minta Analisis AI"}
            </>
          )}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        {/* Default state */}
        {!thinking && !showResult && (
          <div className="flex items-center gap-4 py-4 text-[var(--text-muted)]">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Siap menganalisis bisnis Anda</p>
              <p className="text-[11px] mt-1 leading-relaxed">
                Klik tombol di atas untuk mendapatkan insight mendalam tentang performa keuangan, strategi pricing, dan rekomendasi operasional kafe berbasis data real-time.
              </p>
            </div>
          </div>
        )}

        {/* Thinking skeleton */}
        {thinking && <ThinkingSkeleton />}

        {/* Analysis result */}
        {showResult && !thinking && (
          <div
            className="flex flex-col gap-2.5 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            {/* Timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"/>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                Hasil Analisis — {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>

            {analysis.map((line, i) => {
              if (line === "") return <div key={i} className="h-2"/>;

              const isHeader = line.startsWith("📋") || line.startsWith("🔴") || line.startsWith("🟢") || line.startsWith("🚨");
              const isSubItem = line.startsWith("  ");
              const isWarning = line.startsWith("⚠️") || line.startsWith("🚨");

              return (
                <div
                  key={i}
                  className="transition-all duration-500"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  {isWarning ? (
                    <div
                      className="px-4 py-3 rounded-xl text-[12px] leading-relaxed"
                      style={{
                        background: line.startsWith("🚨")
                          ? "rgba(220,38,38,0.08)"
                          : "rgba(217,119,6,0.08)",
                        border: `1px solid ${line.startsWith("🚨")
                          ? "rgba(220,38,38,0.20)"
                          : "rgba(217,119,6,0.20)"}`,
                        color: line.startsWith("🚨")
                          ? "rgb(252,165,165)"
                          : "rgb(252,211,77)",
                      }}
                    >
                      {line}
                    </div>
                  ) : isSubItem ? (
                    <div
                      className="ml-4 pl-4 text-[12px] text-[var(--text-muted)] leading-relaxed"
                      style={{ borderLeft: "2px solid rgba(139,92,246,0.20)" }}
                    >
                      {line.trim()}
                    </div>
                  ) : (
                    <p className={`text-[12px] leading-relaxed ${
                      isHeader
                        ? "font-bold text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]"
                    }`}>
                      {line}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div
              className="flex items-center gap-2 mt-2 pt-3"
              style={{ borderTop: "1px solid rgba(139,92,246,0.10)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span className="text-[10px] text-[var(--text-muted)] opacity-70">
                Analisis ini dihasilkan berdasarkan data transaksi aktual di Supabase. Untuk hasil terbaik, pastikan data terupdate.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
