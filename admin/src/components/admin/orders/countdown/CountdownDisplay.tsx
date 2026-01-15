
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import {
  calculateAcceptanceCountdown,
  formatAcceptanceCountdown,
} from "../utils/orderProcessing";

interface CountdownDisplayProps {
  orderTime: string;
  isActive?: boolean;
  onExpired?: () => void;
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number; // seconds
  renderAs?: "text" | "button"; // How to render the countdown
  buttonText?: string; // Text to show before countdown in button mode
}

interface CountdownValue {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
  isWarning: boolean;
}

/**
 * Optimized countdown display component that handles its own re-renders
 * without affecting parent components. Uses requestAnimationFrame for
 * smooth updates and includes tab visibility detection for performance.
 */
const CountdownDisplay: React.FC<CountdownDisplayProps> = memo(
  ({
    orderTime,
    isActive = true,
    onExpired,
    className = "",
    showWarning = true,
    warningThreshold = 60,
    renderAs = "text",
    buttonText = "Accept order",
  }) => {
    const [countdown, setCountdown] = useState<CountdownValue>(() => {
      const initial = calculateAcceptanceCountdown(orderTime);
      return {
        ...initial,
        formatted: formatAcceptanceCountdown(initial),
        isWarning: initial.totalSeconds <= warningThreshold,
      };
    });

    const animationFrameRef = useRef<number>(null);
    const lastUpdateRef = useRef<number>(0);
    const expiredCallbackFiredRef = useRef<boolean>(false);
    const isTabVisibleRef = useRef<boolean>(true);

    // Tab visibility detection for performance optimization
    useEffect(() => {
      const handleVisibilityChange = () => {
        isTabVisibleRef.current = !document.hidden;
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () =>
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
    }, []);

    // Optimized countdown update function using requestAnimationFrame
    const updateCountdown = useCallback(() => {
      if (!isActive) return;

      const now = Date.now();

      // Update only once per second, but use RAF for smooth timing
      if (now - lastUpdateRef.current >= 1000) {
        const newCountdown = calculateAcceptanceCountdown(orderTime);
        const newCountdownValue: CountdownValue = {
          ...newCountdown,
          formatted: formatAcceptanceCountdown(newCountdown),
          isWarning: newCountdown.totalSeconds <= warningThreshold,
        };

        setCountdown(newCountdownValue);
        lastUpdateRef.current = now;

        // Handle expiration callback
        if (
          newCountdown.isExpired &&
          !expiredCallbackFiredRef.current &&
          onExpired
        ) {
          expiredCallbackFiredRef.current = true;
          onExpired();
        }

        // Continue animation loop if not expired and component is active
        if (!newCountdown.isExpired && isActive) {
          // Reduce update frequency when tab is not visible
          const delay = isTabVisibleRef.current ? 0 : 1000;

          if (delay > 0) {
            setTimeout(() => {
              animationFrameRef.current =
                requestAnimationFrame(updateCountdown);
            }, delay);
          } else {
            animationFrameRef.current = requestAnimationFrame(updateCountdown);
          }
        }
      } else {
        // Continue animation loop even if we haven't updated yet
        if (!countdown.isExpired && isActive) {
          animationFrameRef.current = requestAnimationFrame(updateCountdown);
        }
      }
    }, [isActive, orderTime, warningThreshold, onExpired, countdown.isExpired]);

    // Start countdown animation
    useEffect(() => {
      if (isActive && !countdown.isExpired) {
        animationFrameRef.current = requestAnimationFrame(updateCountdown);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isActive, orderTime, updateCountdown]); // Only re-run if isActive or orderTime changes

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    // Reset expired callback when orderTime changes
    useEffect(() => {
      expiredCallbackFiredRef.current = false;
    }, [orderTime]);

    // Determine styling based on countdown state
    const getCountdownStyles = () => {
      if (countdown.isExpired) {
        return "text-red-600 font-bold";
      }
      if (showWarning && countdown.isWarning) {
        return "text-orange-600 font-semibold animate-pulse";
      }
      return "text-green-600";
    };

    // Render as button (for popup)
    if (renderAs === "button") {
      return (
        <span className={className}>
          {buttonText} ({countdown.formatted})
        </span>
      );
    }

    // Render as text (for order cards)
    return (
      <span className={`${getCountdownStyles()} ${className}`}>
        {countdown.isExpired ? "EXPIRED" : countdown.formatted}
      </span>
    );
  }
);

CountdownDisplay.displayName = "CountdownDisplay";

export default CountdownDisplay;
