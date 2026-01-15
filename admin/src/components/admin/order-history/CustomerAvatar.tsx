import React, { memo } from 'react'

interface CustomerAvatarProps {
  initials: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const CustomerAvatar = memo(function CustomerAvatar({ 
  initials, 
  name, 
  size = 'md',
  className = '' 
}: CustomerAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-orange-500 text-white rounded-full 
        flex items-center justify-center 
        font-medium flex-shrink-0
        ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  )
})

export default CustomerAvatar