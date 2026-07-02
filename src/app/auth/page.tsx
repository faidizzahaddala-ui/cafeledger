"use client";
import { useRole, UserRole } from "@/context/RoleContext";

export default function AuthPage() {
  const { setRole } = useRole();

  const handleDemoLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem("demo-mode", "true");
    // Force reload to let AuthContext pick up demo-mode
    window.location.href = "/";
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
            Pilih peran untuk simulasi presentasi
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDemoLogin("Owner")}
            className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 text-white bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-orange-900/20"
          >
            <span className="text-xl">👑</span> Login sebagai Owner
          </button>
          
          <button
            onClick={() => handleDemoLogin("Kasir")}
            className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 text-[var(--text-primary)] bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08]"
          >
            <span className="text-xl">💵</span> Login sebagai Kasir
          </button>

          <button
            onClick={() => handleDemoLogin("Barista")}
            className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 text-[var(--text-primary)] bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08]"
          >
            <span className="text-xl">☕</span> Login sebagai Barista
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
          <p className="text-[10px] text-[var(--text-muted)] opacity-60">
            Aplikasi khusus internal Yalla Coffee.
            <br />Hubungi Administrator untuk pendaftaran akun.
          </p>
        </div>
      </div>
    </div>
  );
}
