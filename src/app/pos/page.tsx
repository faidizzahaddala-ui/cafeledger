"use client";

import { useState, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";
import { insertTransaksi } from "@/utils/supabase";

// ── Menu Data ─────────────────────────────────────────────────────────────────
type Category = "Semua" | "Minuman Panas" | "Minuman Dingin" | "Makanan";
type PaymentMethod = "Tunai" | "QRIS" | "Kartu";

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
  { id: 1,  name: "Espresso",          price: 22000, category: "Minuman Panas",  emoji: "☕", gradient: "from-stone-700 to-stone-900",   desc: "Double shot, bold & rich" },
  { id: 2,  name: "Americano",         price: 25000, category: "Minuman Panas",  emoji: "☕", gradient: "from-zinc-700 to-zinc-900",    desc: "Espresso + hot water" },
  { id: 3,  name: "Cappuccino",        price: 32000, category: "Minuman Panas",  emoji: "☕", gradient: "from-amber-700 to-amber-900",  desc: "Espresso + steamed milk foam" },
  { id: 4,  name: "Latte Panas",       price: 30000, category: "Minuman Panas",  emoji: "🥛", gradient: "from-orange-700 to-orange-900", desc: "Smooth & creamy" },
  { id: 5,  name: "V60 Pour Over",     price: 35000, category: "Minuman Panas",  emoji: "☕", gradient: "from-yellow-700 to-amber-900",  desc: "Single origin, manual brew" },
  { id: 6,  name: "Kopi Aren",         price: 28000, category: "Minuman Dingin", emoji: "🧊", gradient: "from-amber-600 to-orange-800",  desc: "Espresso + palm sugar" },
  { id: 7,  name: "Kopi Susu Yalla",   price: 30000, category: "Minuman Dingin", emoji: "🥤", gradient: "from-amber-500 to-yellow-700",  desc: "Yalla signature blend" },
  { id: 8,  name: "Matcha Latte",      price: 35000, category: "Minuman Dingin", emoji: "🍵", gradient: "from-green-600 to-emerald-800", desc: "Japanese matcha, oat milk" },
  { id: 9,  name: "Caramel Macchiato", price: 38000, category: "Minuman Dingin", emoji: "🧋", gradient: "from-caramel to-amber-800",    desc: "Layered espresso & caramel" },
  { id: 10, name: "Cold Brew",         price: 32000, category: "Minuman Dingin", emoji: "🥤", gradient: "from-slate-600 to-slate-900",   desc: "12-hour cold brewed" },
  { id: 11, name: "Es Teh Tarik",      price: 18000, category: "Minuman Dingin", emoji: "🍹", gradient: "from-orange-500 to-red-700",    desc: "Creamy Malaysian tea" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // ── Payment States ──────────────────────────────────────────────────────────
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod]       = useState<PaymentMethod>("Tunai");
  const [amountTendered, setAmountTendered]     = useState<number>(0);
  const [lastChange, setLastChange]             = useState<number>(0);

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
  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setPaymentModalOpen(true);
    setPaymentMethod("Tunai");
    setAmountTendered(total); // Default to exact amount
  };

  const processPayment = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "Tunai" && amountTendered < total) return;
    
    setPaying(true);
    setPayError(null);

    const description = cart
      .map((c) => `${c.qty}x ${c.name}`)
      .join(", ") + ` [Via: ${paymentMethod}]`;

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
    setLastChange(paymentMethod === "Tunai" ? amountTendered - total : 0);
    setCart([]);
    setPaymentModalOpen(false);
    setMobileCartOpen(false);
    setSuccessModal(true);
  };

  // ── Shared Cart Content (reused for desktop sidebar + mobile drawer) ──────
  const CartContent = () => (
    <>
      {/* Cart Header */}
      <div className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-4 flex-shrink-0"
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
            <button id="cart-clear-btn" onClick={() => setCart([])}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
              title="Kosongkan keranjang">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          )}
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileCartOpen(false)}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all ml-1"
            aria-label="Tutup keranjang"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
              <p className="text-[11px] opacity-60 mt-1">Pilih menu untuk menambahkan</p>
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
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.gradient}`}>
                  <span className="text-lg">{item.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{formatRp(item.price)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button id={`cart-minus-${item.id}`} onClick={() => updateQty(item.id, -1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>−</button>
                  <span className="w-5 text-center text-[13px] font-bold text-[var(--text-primary)]">{item.qty}</span>
                  <button id={`cart-plus-${item.id}`} onClick={() => updateQty(item.id, +1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-sm font-bold"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>+</button>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-1">
                  <span className="text-[12px] font-bold" style={{ color: "var(--gold)" }}>{formatRp(item.price * item.qty)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors" aria-label={`Hapus ${item.name}`}>
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

      {/* Bill Summary + Pay */}
      <div className="flex-shrink-0 px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex justify-between text-[12px]">
            <span className="text-[var(--text-muted)]">Subtotal ({itemCount} item)</span>
            <span className="text-[var(--text-primary)] font-medium">{formatRp(total)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[var(--text-muted)]">Pajak (0%)</span>
            <span className="text-[var(--text-muted)]">—</span>
          </div>
          <div className="h-px bg-white/[0.07] my-1"/>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
            <span className="text-lg font-bold" style={{ color: "var(--gold)" }}>{formatRp(total)}</span>
          </div>
        </div>

        {payError && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl text-[11px] text-red-300 animate-fade-in"
            style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <svg className="mt-0.5 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {payError}
          </div>
        )}

        <button
          id="btn-bayar"
          onClick={openPaymentModal}
          disabled={cart.length === 0}
          className="w-full py-3.5 lg:py-4 rounded-2xl text-sm lg:text-base font-bold transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            background: cart.length > 0
              ? "linear-gradient(135deg, #5C2E0A, #8B4513 40%, #C8883C)"
              : "rgba(255,255,255,0.06)",
            color: cart.length > 0 ? "#F5EDD8" : "var(--text-muted)",
            boxShadow: cart.length > 0 ? "0 8px 24px rgba(139,69,19,0.50), 0 0 0 1px rgba(200,136,60,0.25)" : "none",
          }}
        >
          {paying ? (
            "Memproses..."
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
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)}/>

      {/* ── POS Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-3.5 flex-shrink-0 gap-2"
          style={{ borderBottom: "1px solid rgba(200,136,60,0.12)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)" }}
              aria-label="Buka menu navigasi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm lg:text-base font-bold gradient-text leading-tight truncate">Kasir POS — Yalla Coffee</h1>
              <p className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                {new Date().toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] lg:text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 lg:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
              ● Aktif
            </span>
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">Shift: Pagi</span>
          </div>
        </header>

        {/* ── Split Layout ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* ══ Menu Grid ══ */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Search + Category Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 lg:px-5 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
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
              {/* Category Tabs — scrollable on small screens */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mb-0.5 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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

            {/* Product Grid — responsive: 2col → 3col sm → 4col lg */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <p className="text-sm">Menu tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {filtered.map((item) => {
                    const qty = cartQty(item.id);
                    return (
                      <button
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        onClick={() => addToCart(item)}
                        className={`group relative flex flex-col overflow-hidden rounded-xl lg:rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 focus:outline-none ${
                          qty > 0 ? "ring-2 ring-amber-500/60" : ""
                        }`}
                        style={{
                          background: "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
                          border: qty > 0 ? "1px solid rgba(200,136,60,0.50)" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: qty > 0 ? "0 0 20px rgba(212,135,78,0.20)" : "0 4px 16px rgba(0,0,0,0.20)",
                        }}
                      >
                        {qty > 0 && (
                          <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white animate-fade-in"
                            style={{ background: "linear-gradient(135deg,#8B4513,#C8883C)" }}>
                            {qty}
                          </span>
                        )}

                        <div className={`w-full h-20 lg:h-24 flex items-center justify-center bg-gradient-to-br ${item.gradient} transition-all duration-200 group-hover:brightness-110`}>
                          <span className="text-3xl lg:text-4xl drop-shadow-lg">{item.emoji}</span>
                        </div>

                        <div className="p-2.5 lg:p-3 flex flex-col gap-0.5">
                          <span className="text-[11px] lg:text-[12px] font-semibold text-[var(--text-primary)] leading-tight line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[9px] lg:text-[10px] text-[var(--text-muted)] line-clamp-1">{item.desc}</span>
                          <span className="text-[12px] lg:text-[13px] font-bold mt-1"
                            style={{ color: "var(--gold)" }}>
                            {formatRp(item.price)}
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.04] transition-colors duration-200 rounded-xl lg:rounded-2xl pointer-events-none"/>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bottom spacer for floating button on mobile */}
              <div className="h-20 lg:hidden"/>
            </div>
          </div>

          {/* ══ Desktop Cart Sidebar (lg+) ══ */}
          <div
            className="hidden lg:flex w-80 flex-shrink-0 flex-col"
            style={{ background: "rgba(0,0,0,0.15)", borderLeft: "1px solid rgba(200,136,60,0.10)" }}
          >
            <CartContent/>
          </div>
        </div>
      </div>

      {/* ══ Mobile: Floating Cart Button (lg:hidden) ══ */}
      {!mobileCartOpen && (
        <button
          id="mobile-cart-fab"
          onClick={() => setMobileCartOpen(true)}
          className="fixed bottom-5 right-5 z-40 lg:hidden flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 animate-fade-up"
          style={{
            background: "linear-gradient(135deg, #5C2E0A, #8B4513 40%, #C8883C)",
            color: "#F5EDD8",
            boxShadow: "0 8px 32px rgba(139,69,19,0.55), 0 0 0 1px rgba(200,136,60,0.30)",
          }}
        >
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          {itemCount > 0 ? (
            <span>{formatRp(total)}</span>
          ) : (
            <span>Keranjang</span>
          )}
        </button>
      )}

      {/* ══ Mobile Cart Drawer (lg:hidden) ══ */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(5,2,1,0.70)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileCartOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileCartOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Tutup keranjang"
          />
          {/* Drawer — slides up from bottom, max 85vh */}
          <div
            className="relative z-10 flex flex-col animate-fade-up"
            style={{
              maxHeight: "85vh",
              background: "linear-gradient(180deg, #2E1A10 0%, #1A0D08 100%)",
              borderTop: "1px solid rgba(200,136,60,0.25)",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.60)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/[0.15]"/>
            </div>
            <CartContent/>
          </div>
        </div>
      )}

      {/* ══ Payment Modal ══ */}
      {paymentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(5,2,1,0.85)", backdropFilter: "blur(10px)" }}
          onClick={(e) => (e.target as HTMLElement) === e.currentTarget && setPaymentModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl flex flex-col p-6 animate-fade-up glass-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Proses Pembayaran</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Total */}
            <div className="flex flex-col items-center justify-center py-4 mb-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[12px] text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-1">Total Tagihan</p>
              <p className="text-3xl font-bold gradient-text">{formatRp(total)}</p>
            </div>

            {/* Payment Method */}
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-3">
                {(["Tunai", "QRIS", "Kartu"] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== "Tunai") setAmountTendered(total);
                    }}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                      paymentMethod === method
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                        : "bg-white/[0.03] border-white/[0.05] text-[var(--text-muted)] hover:bg-white/[0.06]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator (Only for Cash) */}
            {paymentMethod === "Tunai" && (
              <div className="mb-6 animate-fade-in space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Uang Diterima</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-muted)]">Rp</span>
                    <input
                      type="number"
                      value={amountTendered || ""}
                      onChange={(e) => setAmountTendered(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/[0.1] rounded-xl text-lg font-bold focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setAmountTendered(total)} className="py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-xs font-semibold text-[var(--text-primary)] transition-colors">Uang Pas</button>
                  <button onClick={() => setAmountTendered(50000)} className="py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-xs font-semibold text-[var(--text-primary)] transition-colors">50.000</button>
                  <button onClick={() => setAmountTendered(100000)} className="py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-xs font-semibold text-[var(--text-primary)] transition-colors">100.000</button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <span className="text-sm text-[var(--text-primary)] font-medium">Kembalian</span>
                  <span className={`text-lg font-bold ${amountTendered >= total ? "text-emerald-400" : "text-red-400"}`}>
                    {amountTendered >= total ? formatRp(amountTendered - total) : "Kurang"}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {payError && (
              <div className="mb-4 flex items-start gap-2 px-3 py-2 rounded-xl text-[11px] text-red-300 animate-fade-in bg-red-500/10 border border-red-500/20">
                <svg className="mt-0.5 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {payError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-5 py-3.5 rounded-xl text-sm font-semibold transition-colors bg-white/[0.03] hover:bg-white/[0.06] text-[var(--text-primary)]"
              >
                Batal
              </button>
              <button
                onClick={processPayment}
                disabled={paying || (paymentMethod === "Tunai" && amountTendered < total)}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95 text-white"
                style={{ background: "linear-gradient(135deg, #8B4513, #C8883C)", boxShadow: "0 8px 24px rgba(139,69,19,0.4)" }}
              >
                {paying ? "Memproses..." : "Konfirmasi Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                Tersimpan ke tabel{" "}
                <code className="font-mono bg-white/[0.06] px-1 rounded text-amber-400">transactions</code>
              </p>
            </div>

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
                <span className="text-[var(--text-muted)]">Total Tagihan</span>
                <span className="font-bold" style={{ color: "var(--gold)" }}>{formatRp(lastTotal)}</span>
              </div>
              {lastChange > 0 && (
                <div className="flex justify-between text-xs mt-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[var(--text-muted)] font-medium">Kembalian</span>
                  <span className="font-bold text-amber-400 text-sm">{formatRp(lastChange)}</span>
                </div>
              )}
            </div>

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
