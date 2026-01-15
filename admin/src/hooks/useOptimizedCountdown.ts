
import { useState, useEffect, useRef, useCallback } from "react";
import {
  calculateAcceptanceCountdown,
  formatAcceptanceCountdown,
} from "@/components/admin/orders/utils/orderProcessing";

interface CountdownValue {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
  isWarning: boolean;
}

interface UseOptimizedCountdownProps {
  orderTime: string;
  isActive?: boolean;
  onUpdate?: (countdown: CountdownValue) => void;
  onExpired?: () => void;
  warningThreshold?: number;
}

/**
 * Optimized countdown hook that minimizes re-renders by using callbacks
 * instead of state updates. Uses requestAnimationFrame and tab visibility
 * detection for better performance.
 */
export function useOptimizedCountdown({
  orderTime,
  isActive = true,
  onUpdate,
  onExpired,
  warningThreshold = 60,
}: UseOptimizedCountdownProps): CountdownValue {
  const [countdown, setCountdown] = useState<CountdownValue>(() => {
    const initial = calculateAcceptanceCountdown(orderTime);
    return {
      ...initial,
      formatted: formatAcceptanceCountdown(initial),
      isWarning: initial.totalSeconds <= warningThreshold,
    };
  });

  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const expiredCallbackFiredRef = useRef<boolean>(false);
  const isTabVisibleRef = useRef<boolean>(true);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Optimized update function
  const updateCountdown = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();

    // Update only once per second
    if (now - lastUpdateRef.current >= 1000) {
      const newCountdown = calculateAcceptanceCountdown(orderTime);
      const newCountdownValue: CountdownValue = {
        ...newCountdown,
        formatted: formatAcceptanceCountdown(newCountdown),
        isWarning: newCountdown.totalSeconds <= warningThreshold,
      };

      setCountdown(newCountdownValue);
      lastUpdateRef.current = now;

      // Call update callback if provided
      if (onUpdate) {
        onUpdate(newCountdownValue);
      }

      // Handle expiration
      if (
        newCountdown.isExpired &&
        !expiredCallbackFiredRef.current &&
        onExpired
      ) {
        expiredCallbackFiredRef.current = true;
        onExpired();
      }
    }

    // Continue if not expired
    if (!countdown.isExpired && isActive) {
      // Reduce frequency when tab is not visible
      const delay = isTabVisibleRef.current ? 0 : 5000;

      if (delay > 0) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(updateCountdown);
        }, delay);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateCountdown);
      }
    }
  }, [
    isActive,
    orderTime,
    onUpdate,
    onExpired,
    warningThreshold,
    countdown.isExpired,
  ]);

  // Start countdown
  useEffect(() => {
    if (isActive && !countdown.isExpired) {
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateCountdown, isActive, countdown.isExpired]);

  // Reset expired callback when orderTime changes
  useEffect(() => {
    expiredCallbackFiredRef.current = false;
  }, [orderTime]);

  return countdown;
}

export default useOptimizedCountdown;
