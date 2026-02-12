"use client";
import { useState, useEffect } from "react";

export const useRestaurantUsername = (): string | null => {
  const [username, setUsername] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isInitialized) {
      const storedUsername = localStorage.getItem('currentRestaurantUsername');
      console.log('[useRestaurantUsername] Initial load:', storedUsername || 'none');
      setUsername(storedUsername);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentRestaurantUsername') {
        console.log('[useRestaurantUsername] Storage changed:', e.newValue || 'cleared');
        setUsername(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return username;
};
