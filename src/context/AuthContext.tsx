"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Automatically set a dummy user to bypass login completely
    setUser({ id: "bypassed-user", email: "owner@yallacoffee.com" } as User);
    setSession({
      access_token: "dummy",
      refresh_token: "dummy",
      expires_in: 3600,
      token_type: "bearer",
      user: { id: "bypassed-user", email: "owner@yallacoffee.com" } as User
    } as Session);
    setLoading(false);
  }, []);

  // Route Protection
  useEffect(() => {
    if (loading) return; // Don't redirect while checking auth status

    const isAuthPage = pathname === "/auth";

    if (!user && !isAuthPage) {
      // Not logged in, trying to access protected page
      router.push("/auth");
    } else if (user && isAuthPage) {
      // Logged in, trying to access auth page
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
