import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSoundContext } from "@/context/SoundContext";

interface UseSoundOnPendingProps {
  pendingOrdersCount: number;
}

export default function UseSoundOnPending({
  pendingOrdersCount,
}: UseSoundOnPendingProps) {
  const { isSoundEnabled } = useSoundContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [prevOrderCount, setPrevOrderCount] = useState<number>(0);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/order-placed.wav");
    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
    };
  }, []);

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);

    ["click", "keydown", "touchstart"].forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      ["click", "keydown", "touchstart"].forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.error("Error playing audio:", err));
    }
  }, []);

  const startSoundLoop = useCallback(() => {
    if (soundIntervalRef.current) return;

    // Play immediately
    playSound();

    // Then play every 2 seconds
    soundIntervalRef.current = setInterval(playSound, 2000);
  }, [playSound]);

  const stopSoundLoop = useCallback(() => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  }, []);

  // Handle pending orders
  useEffect(() => {
    const currentOrderCount = pendingOrdersCount;
    const hasPendingOrders = currentOrderCount > 0;

    // Check if there's a new order (count increased from 0 to >0)

    if (hasPendingOrders) {
      setShowAlert(true);

      if (userInteracted && isSoundEnabled) {
        startSoundLoop();
      } else if (!isSoundEnabled) {
        stopSoundLoop();
      }
    } else {
      setShowAlert(false);
      stopSoundLoop();
    }

    // Update previous count
    setPrevOrderCount(currentOrderCount);
  }, [
    pendingOrdersCount,
    userInteracted,
    isSoundEnabled,
    prevOrderCount,
    startSoundLoop,
    stopSoundLoop,
  ]);

  return <div></div>;
}
