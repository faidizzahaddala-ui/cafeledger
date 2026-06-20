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
    // Get initial session
    const initializeAuth = async () => {
      try {
        const demoMode = localStorage.getItem("demo-mode");
        if (demoMode === "true") {
           setUser({ id: "demo-user", email: "demo@yallacoffee.com" } as User);
           setLoading(false);
           return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const demoMode = localStorage.getItem("demo-mode");
        if (demoMode === "true") return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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
