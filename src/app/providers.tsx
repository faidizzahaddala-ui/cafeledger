"use client";

import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RoleProvider>{children}</RoleProvider>
    </AuthProvider>
  );
}
