import React from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DynamicWifiIconProps {
  level: 0 | 1 | 2 | 3 | 4
  className?: string
}

export const DynamicWifiIcon: React.FC<DynamicWifiIconProps> = ({
  level,
  className,
}) => {
  if (level === 0) {
    return <WifiOff className={cn('w-4 h-4 text-red-500', className)} />
  }

  // Common props for the SVG
  const svgProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: cn('w-4 h-4', className),
  }

  // Opacity classes for "dimmed" arcs
  const activeClass = 'opacity-100'
  const inactiveClass = 'opacity-30' // Dimmed look for inactive bars

  return (
    <svg {...svgProps}>
      {/* Outer Arc (Level 4) */}
      <path
        d="M5 12.55a11 11 0 0 1 14.08 0"
        className={level >= 4 ? activeClass : inactiveClass}
      />
      {/* Middle Arc (Level 3) */}
      <path
        d="M1.42 9a16 16 0 0 1 21.16 0"
        className={level >= 3 ? activeClass : inactiveClass}
      />
      {/* Inner Arc (Level 2) */}
      <path
        d="M8.53 16.11a6 6 0 0 1 6.95 0"
        className={level >= 2 ? activeClass : inactiveClass}
      />
      {/* Dot (Level 1) - Always active if level > 0 */}
      <line x1="12" y1="20" x2="12.01" y2="20" className={activeClass} />
    </svg>
  )
}
