import React, { useState } from 'react'
import { IKImage } from 'imagekitio-react'

interface UseOptimizeImageProps {
  src: string
  alt: string
  className?: string
  blurBgImage?: string
  rounded?: string
  [key: string]: any
}

export default function UseOptimizeImage({
  rounded = 'rounded-xl',
  src,
  alt,
  className = '',
  blurBgImage = '/blurFood.png',
  width = 100,
  height = 100,
  ...otherProps
}: UseOptimizeImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  React.useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        setShowOverlay(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [loaded])

  return (
    <div className={`relative w-full h-full overflow-hidden ${rounded}`}>
      <style>{`
        @keyframes custom-pulse-opacity {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Static blur background */}
      <div
        className={`${rounded} overflow-hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80`}
        style={{
          backgroundImage: `url(${blurBgImage})`,
          filter: 'blur(8px) brightness(1)',
          transform: 'scale(1.2)',
          animationName: 'custom-pulse-opacity',
          animationDuration: '4s',
          animationIterationCount: 'infinite',
        }}
      />

      <IKImage
        urlEndpoint="https://ik.imagekit.io/phy7j8tcu"
        src={src}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        className={`absolute overflow-hidden inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-100 transition-none' : 'opacity-0'
        } ${className}`}
        transformation={[
          {
            quality: '100',
            width: '100',
            height: '100',
          },
        ]}
        onLoad={() => setLoaded(true)}
        {...otherProps}
      />

      {/* Loading overlay */}
      {showOverlay && (
        <div
          className={`${rounded} absolute inset-0 bg-black/20 backdrop-blur-sm animate-pulse`}
        />
      )}
    </div>
  )
}
