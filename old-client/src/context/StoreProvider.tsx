"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useItemStore } from "@/store/orderStore";

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait till Next.js rehydration completes
  useEffect(() => {
    // Initialize the store by rehydrating
    useItemStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
} 