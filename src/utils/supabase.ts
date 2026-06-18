import { createClient } from "@supabase/supabase-js";

// ── Environment Variables ──────────────────────────────────────────────────────
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL atau Anon Key tidak ditemukan. " +
    "Pastikan file .env.local sudah berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// ── Supabase Client (Singleton) ────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
});

export type SupabaseClient = typeof supabase;

// ── Types (sesuai skema tabel `transactions` di Supabase) ─────────────────────
export type TipeTransaksi     = "Pemasukan" | "Pengeluaran";
export type KategoriTransaksi = "Sales" | "COGS" | "Utility" | "Salary";

export interface Transaksi {
  id:          string;
  created_at:  string;
  type:        TipeTransaksi;
  category:    KategoriTransaksi;
  description: string;
  amount:      number;
}

// ── Query Helpers ──────────────────────────────────────────────────────────────

/**
 * Mengambil semua baris dari tabel `transactions`, diurutkan dari terbaru.
 */
export async function getTransaksi(): Promise<Transaksi[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, created_at, type, category, description, amount")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] getTransaksi error:", error.message);
    return [];
  }
  return (data as Transaksi[]) ?? [];
}

/**
 * Menyimpan satu transaksi baru ke tabel `transactions`.
 * Kolom: type, category, description, amount (id & created_at di-generate Supabase).
 */
export async function insertTransaksi(payload: {
  type:        TipeTransaksi;
  category:    KategoriTransaksi;
  description: string;
  amount:      number;
}): Promise<Transaksi | null> {
  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select("id, created_at, type, category, description, amount")
    .single();

  if (error) {
    console.error("[Supabase] insertTransaksi error:", error.message);
    return null;
  }
  return data as Transaksi;
}

/**
 * Ringkasan KPI dari tabel `transactions`.
 */
export async function getKpiSummary() {
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount");

  if (error) {
    console.error("[Supabase] getKpiSummary error:", error.message);
    return { omzet: 0, beban: 0, laba: 0 };
  }

  const rows  = (data ?? []) as { type: string; amount: number }[];
  const omzet = rows.filter((r) => r.type === "Pemasukan").reduce((s, r) => s + r.amount, 0);
  const beban = rows.filter((r) => r.type === "Pengeluaran").reduce((s, r) => s + r.amount, 0);
  return { omzet, beban, laba: omzet - beban };
}
