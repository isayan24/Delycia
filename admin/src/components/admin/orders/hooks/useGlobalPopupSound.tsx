import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSoundContext } from "@/context/SoundContext";

interface UseGlobalPopupSoundProps {
  hasNewOrder: boolean;
}

export default function UseGlobalPopupSound({ hasNewOrder }: UseGlobalPopupSoundProps) {
  const { isSoundEnabled } = useSoundContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);

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

    ['click', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      ['click', 'keydown', 'touchstart'].forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err =>
        console.error("Error playing audio:", err)
      );
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

  // Handle new orders and sound enable/disable
  useEffect(() => {
    if (hasNewOrder && userInteracted && isSoundEnabled) {
      startSoundLoop();
    } else {
      stopSoundLoop();
    }
  }, [hasNewOrder, userInteracted, isSoundEnabled, startSoundLoop, stopSoundLoop]);

  
  return <div></div>;
}