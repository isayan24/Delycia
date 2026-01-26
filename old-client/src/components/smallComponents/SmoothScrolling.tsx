'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detect Firefox-based browsers
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    if (isFirefox) {
      // Use native smooth scrolling for Firefox
      document.documentElement.style.scrollBehavior = 'smooth';
      return;
    }

    // Use Lenis for other browsers
    const lenis = new Lenis({
      lerp: 0.05,
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      touchMultiplier: 1.5,
      infinite: false,
    })

    function raf(time: number): void {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
