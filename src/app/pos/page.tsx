"use client";

import { useState, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";
import { insertTransaksi } from "@/utils/supabase";

// ── Menu Data ─────────────────────────────────────────────────────────────────
type Category = "Semua" | "Minuman Panas" | "Minuman Dingin" | "Makanan";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Exclude<Category, "Semua">;
  emoji: string;
  gradient: string;
  desc: string;
}

const menuItems: MenuItem[] = [
  // Minuman Panas
  { id: 1,  name: "Espresso",          price: 22000, category: "Minuman Panas",  emoji: "☕", gradient: "from-stone-700 to-stone-900",   desc: "Double shot, bold & rich" },
  { id: 2,  name: "Americano",         price: 25000, category: "Minuman Panas",  emoji: "☕", gradient: "from-zinc-700 to-zinc-900",    desc: "Espresso + hot water" },
  { id: 3,  name: "Cappuccino",        price: 32000, category: "Minuman Panas",  emoji: "☕", gradient: "from-amber-700 to-amber-900",  desc: "Espresso + steamed milk foam" },
  { id: 4,  name: "Latte Panas",       price: 30000, category: "Minuman Panas",  emoji: "🥛", gradient: "from-orange-700 to-orange-900", desc: "Smooth & creamy" },
  { id: 5,  name: "V60 Pour Over",     price: 35000, category: "Minuman Panas",  emoji: "☕", gradient: "from-yellow-700 to-amber-900",  desc: "Single origin, manual brew" },
  // Minuman Dingin
  { id: 6,  name: "Kopi Aren",         price: 28000, category: "Minuman Dingin", emoji: "🧊", gradient: "from-amber-600 to-orange-800",  desc: "Espresso + palm sugar" },
  { id: 7,  name: "Kopi Susu Yalla",   price: 30000, category: "Minuman Dingin", emoji: "🥤", gradient: "from-amber-500 to-yellow-700",  desc: "Yalla signature blend" },
  { id: 8,  name: "Matcha Latte",      price: 35000, category: "Minuman Dingin", emoji: "🍵", gradient: "from-green-600 to-emerald-800", desc: "Japanese matcha, oat milk" },
  { id: 9,  name: "Caramel Macchiato", price: 38000, category: "Minuman Dingin", emoji: "🧋", gradient: "from-caramel to-amber-800",    desc: "Layered espresso & caramel" },
  { id: 10, name: "Cold Brew",         price: 32000, category: "Minuman Dingin", emoji: "🥤", gradient: "from-slate-600 to-slate-900",   desc: "12-hour cold brewed" },
  { id: 11, name: "Es Teh Tarik",      price: 18000, category: "Minuman Dingin", emoji: "🍹", gradient: "from-orange-500 to-red-700",    desc: "Creamy Malaysian tea" },
  // Makanan
  { id: 12, name: "Croissant",         price: 25000, category: "Makanan",        emoji: "🥐", gradient: "from-yellow-600 to-amber-700",  desc: "Butter croissant, flaky" },
  { id: 13, name: "Banana Bread",      price: 22000, category: "Makanan",        emoji: "🍞", gradient: "from-yellow-700 to-orange-800", desc: "Homemade, warm slice" },
  { id: 14, name: "Club Sandwich",     price: 38000, category: "Makanan",        emoji: "🥪", gradient: "from-lime-600 to-green-800",    desc: "Triple decker, chicken" },
  { id: 15, name: "Cheesecake",        price: 35000, category: "Makanan",        emoji: "🍰", gradient: "from-pink-500 to-rose-700",     desc: "NY-style, blueberry topping" },
  { id: 16, name: "Waffle",            price: 32000, category: "Makanan",        emoji: "🧇", gradient: "from-yellow-500 to-amber-700",  desc: "With maple syrup & butter" },
];

const categories: Category[] = ["Semua", "Minuman Panas", "Minuman Dingin", "Makanan"];

// ── Cart Types ────────────────────────────────────────────────────────────────
interface CartItem extends MenuItem { qty: number; }

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ── Component ─────────────────────────────────────────────────────────────────
export default function PosPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [paying, setPaying]                 = useState(false);
  const [successModal, setSuccessModal]     = useState(false);
  const [lastTotal, setLastTotal]           = useState(0);
  const [payError, setPayError]             = useState<string | null>(null);
  const [search, setSearch]                 = useState("");

  // ── Filtered menu ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === "Semua" || item.category === activeCategory;
      const matchQ   = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    });
  }, [activeCategory, search]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((c) => c.id !== id));

  const total     = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartQty   = (id: number) => cart.find((c) => c.id === id)?.qty ?? 0;

  // ── Pay → INSERT ke Supabase ──────────────────────────────────────────────
  const handlePay = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    setPayError(null);

    const description = cart
      .map((c) => `${c.qty}x ${c.name}`)
      .join(", ");

    const result = await insertTransaksi({
      type:     "Pemasukan",
      category: "Sales",
      amount:   total,
      description,
    });

    setPaying(false);

    if (!result) {
      setPayError("Pembayaran gagal. Periksa koneksi Supabase dan coba lagi.");
      return;
    }

    setLastTotal(total);
    setCart([]);
    setSuccessModal(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AppSidebar />

      {/* ── POS Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-tight">Kasir POS — Yalla Coffee</h1>
              <p className="text-[10px] text-[var(--text-muted)]">
                {new Date().toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--text-muted)] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-3 py-1 rounded-full font-semibold">
              ● Kasir Aktif
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Shift: Pagi 07.00–15.00</span>
          </div>
        </header>

        {/* ── Split Layout ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ══ LEFT: Menu Grid (70%) ══ */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: "1px solid rgba(200,136,60,0.10)" }}>

            {/* Search + Category Bar */}
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  id="pos-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari menu…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,136,60,0.15)" }}
                />
              </div>
              {/* Category Tabs */}
              <div className="flex gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeCategory === cat
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                    style={
                      activeCategory === cat
                        ? { background: "linear-gradient(135deg,rgba(139,69,19,0.35),rgba(200,136,60,0.20))", border: "1px solid rgba(200,136,60,0.35)" }
                        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <p className="text-sm">Menu tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((item) => {
                    const qty = cartQty(item.id);
                    return (
                      <button
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        onClick={() => addToCart(item)}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 focus:outline-none ${
                          qty > 0 ? "ring-2 ring-amber-500/60" : ""
                        }`}
                        style={{
                          background: "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
                          border: qty > 0 ? "1px solid rgba(200,136,60,0.50)" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: qty > 0 ? "0 0 20px rgba(212,135,78,0.20)" : "0 4px 16px rgba(0,0,0,0.20)",
                        }}
                      >
                        {/* Qty badge */}
                        {qty > 0 && (
                          <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white animate-fade-in"
                            style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}>
                            {qty}
                          </span>
                        )}

                        {/* Emoji Thumbnail */}
                        <div className={`w-full h-24 flex items-center justify-center bg-gradient-to-br ${item.gradient} transition-all duration-200 group-hover:brightness-110`}>
                          <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
                        </div>

                        {/* Info */}
                        <div className="p-3 flex flex-col gap-0.5">
                          <span className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">{item.desc}</span>
                          <span className="text-[13px] font-bold mt-1.5"
                            style={{ color: "var(--gold)" }}>
                            {formatRp(item.price)}
                          </span>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.04] transition-colors duration-200 rounded-2xl pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ══ RIGHT: Cart (30%) ══ */}
          <div className="w-80 flex-shrink-0 flex flex-col" style={{ background: "rgba(0,0,0,0.15)" }}>

            {/* Cart Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span className="text-sm font-bold text-[var(--text-primary)]">Pesanan</span>
              </div>
              <div className="flex items-center gap-2">
                {itemCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-amber-300 bg-amber-500/15 border border-amber-500/25">
                    {itemCount} item
                  </span>
                )}
                {cart.length > 0 && (
                  <button
                    id="cart-clear-btn"
                    onClick={() => setCart([])}
                    className="text-[11px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    title="Kosongkan keranjang"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-muted)]">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Keranjang kosong</p>
                    <p className="text-[11px] opacity-60 mt-1">Pilih menu dari sebelah kiri</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      id={`cart-item-${item.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl animate-fade-in"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Emoji thumb */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.gradient}`}>
                        <span className="text-lg">{item.emoji}</span>
                      </div>

                      {/* Name + price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{formatRp(item.price)}</p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          id={`cart-minus-${item.id}`}
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-[var(--text-primary)]">
                          {item.qty}
                        </span>
                        <button
                          id={`cart-plus-${item.id}`}
                          onClick={() => updateQty(item.id, +1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-sm font-bold"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-1">
                        <span className="text-[12px] font-bold" style={{ color: "var(--gold)" }}>
                          {formatRp(item.price * item.qty)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          aria-label={`Hapus ${item.name}`}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Bill Summary + Pay ── */}
            <div className="flex-shrink-0 px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Breakdown */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[var(--text-muted)]">Subtotal ({itemCount} item)</span>
                  <span className="text-[var(--text-primary)] font-medium">{formatRp(total)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[var(--text-muted)]">Pajak (0%)</span>
                  <span className="text-[var(--text-muted)]">—</span>
                </div>
                <div className="h-px bg-white/[0.07] my-1" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
                  <span className="text-lg font-bold" style={{ color: "var(--gold)" }}>
                    {formatRp(total)}
                  </span>
                </div>
              </div>

              {/* Pay error */}
              {payError && (
                <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl text-[11px] text-red-300 animate-fade-in"
                  style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.25)" }}>
                  <svg className="mt-0.5 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {payError}
                </div>
              )}

              {/* PAY BUTTON */}
              <button
                id="btn-bayar"
                onClick={handlePay}
                disabled={cart.length === 0 || paying}
                className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: cart.length > 0
                    ? "linear-gradient(135deg, #5C2E0A, #8B4513 40%, #C8883C)"
                    : "rgba(255,255,255,0.06)",
                  color: cart.length > 0 ? "#F5EDD8" : "var(--text-muted)",
                  boxShadow: cart.length > 0 ? "0 8px 24px rgba(139,69,19,0.50), 0 0 0 1px rgba(200,136,60,0.25)" : "none",
                }}
              >
                {paying ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Memproses…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    {cart.length === 0 ? "Pilih Menu Dahulu" : `Bayar ${formatRp(total)}`}
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[var(--text-muted)] opacity-60 mt-2">
                Transaksi tersimpan otomatis ke Supabase
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Success Modal ══ */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(5,2,1,0.85)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl flex flex-col items-center gap-5 p-8 animate-fade-up text-center"
            style={{
              background: "linear-gradient(145deg,#2E1A10,#1A0D06)",
              border: "1px solid rgba(200,136,60,0.30)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.70), 0 0 60px rgba(212,135,78,0.12)",
            }}
          >
            {/* Check animation */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-fade-in"
              style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.25),rgba(22,163,74,0.10))", border: "2px solid rgba(22,163,74,0.40)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 mb-1">Pembayaran Berhasil</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{formatRp(lastTotal)}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-2">
                Transaksi telah tersimpan ke tabel{" "}
                <code className="font-mono bg-white/[0.06] px-1 rounded text-amber-400">transactions</code>
              </p>
            </div>

            {/* Receipt lines */}
            <div
              className="w-full px-4 py-3 rounded-xl text-left"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Ringkasan</p>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Tipe</span>
                <span className="text-emerald-400 font-semibold">Pemasukan</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[var(--text-muted)]">Kategori</span>
                <span className="text-[var(--text-primary)] font-semibold">Sales</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[var(--text-muted)]">Total</span>
                <span className="font-bold" style={{ color: "var(--gold)" }}>{formatRp(lastTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                id="success-new-order-btn"
                onClick={() => setSuccessModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg,#8B4513,#C8883C)",
                  color: "#F5EDD8",
                  boxShadow: "0 4px 16px rgba(139,69,19,0.40)",
                }}
              >
                + Pesanan Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
