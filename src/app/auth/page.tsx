"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Log in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Successful login will automatically redirect via AuthContext
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        setSuccess("Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi.");
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat autentikasi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow specific to auth page */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700/20 rounded-full blur-[100px] pointer-events-none" />

      <div 
        className="w-full max-w-md p-8 rounded-3xl animate-fade-up relative z-10 glass-panel-light"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#C8883C] shadow-[0_0_20px_rgba(200,136,60,0.3)] mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5EDD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text tracking-tight">
            CafeLedger
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">
            {isLogin ? "Masuk ke dashboard Yalla Coffee" : "Daftarkan akun staf baru Anda"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in">
            <svg className="flex-shrink-0 mt-0.5 text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 animate-fade-in">
            <svg className="flex-shrink-0 mt-0.5 text-emerald-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="text-[12px] text-emerald-300">{success}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mawar Melati"
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@yallacoffee.com"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 text-white"
            style={{ background: "linear-gradient(135deg, #8B4513, #C8883C)", boxShadow: "0 8px 24px rgba(139,69,19,0.3)" }}
          >
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Memproses...</>
            ) : (
              isLogin ? "Masuk" : "Daftar Akun"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
          <p className="text-[12px] text-[var(--text-muted)]">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-amber-400 font-semibold hover:underline"
            >
              {isLogin ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
