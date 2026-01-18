import React from 'react'

/**
 * LoadingScreen Component
 *
 * A beautiful full-screen loading component with animated Delycia logo
 * Features a left-to-right orange fill animation
 *
 * @param message - Optional loading message to display below the logo
 */
interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 z-[9999999999999999] flex items-center justify-center bg-black/20">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.1),transparent_50%)] animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Delycia Logo with Fill Effect */}
        <div className="relative mb-8">
          {/* Logo container with fill animation */}
          <div className="relative w-80 h-32">
            {/* Base grayscale logo */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/delycia-full.png"
                alt="Delycia"
                className="w-full h-full object-contain opacity-40 grayscale brightness-110"
              />
            </div>

            {/* Orange fill overlay - reveals from left to right using clip-path */}
            <div
              className="absolute inset-0 flex items-center justify-center animate-[revealLogo_3s_ease-out_forwards]"
              style={{ clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)' }}
            >
              <img
                src="/delycia-full.png"
                alt="Delycia"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Animated dots below logo */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0ms]" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce [animation-delay:150ms]" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* Loading message */}
        {message && (
          <p className="text-gray-700 text-lg font-medium animate-pulse">
            {message}
          </p>
        )}

        {/* Loading bar */}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes revealLogo {
          0% {
            clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
          }
          100% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
