"use client";

import { createContext, useContext } from "react";

import type { SessionUser } from "@/lib/session";

const AuthContext = createContext<SessionUser | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(AuthContext);

  if (!user) {
    throw new Error("useCurrentUser must be used inside AuthProvider");
  }

  return user;
}
