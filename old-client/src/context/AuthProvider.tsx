"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth, UseAuthReturn } from "@/hooks/useAuth";

// Create Auth Context
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

// Auth Provider Component
export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
