import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Pencil, Trash2 } from 'lucide-react'
import { useLongPress } from './hooks/useLongPress'

interface TableCardProps {
  table: {
    id: number
    table_number: string
    status: string
    zone: string
    capacity?: number
    party_size?: number
  }
  onSelect: (table: any) => void
  onLongPress: (table: any) => void
  onEdit?: (table: any) => void
  onDelete?: (table: any) => void
}

export default function TableCard({
  table,
  onSelect,
  onLongPress,
  onEdit,
  onDelete,
}: TableCardProps) {
  const [showActions, setShowActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Close overlay when clicking outside
  useEffect(() => {
    if (!showActions) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowActions(false)
      }
    }

    // Use a slight delay so the current event cycle finishes
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showActions])

  // Helpers
  const getTableIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return '🍽️'
      case 'reserved':
        return '🍽️'
      case 'available':
        return '🍽️'
      default:
        return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'reserved':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'available':
        return 'border-green-400/50 bg-green-50/20 dark:bg-green-950/20'
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'reserved':
        return 'Reserved'
      case 'available':
        return 'Available'
      default:
        return 'Empty'
    }
  }

  // Setup long press hook
  const bind = useLongPress({
    delay: 500,
    onLongPress: () => {
      if (table.status === 'available') {
        // Show the action overlay for available tables
        setShowActions(true)
      } else if (table.status === 'occupied' || table.status === 'reserved') {
        onLongPress(table)
      }
    },
    onClick: () => {
      if (showActions) {
        // If overlay is visible, tap dismisses it
        setShowActions(false)
        return
      }
      onSelect(table)
    },
  })

  return (
    <Card
      ref={cardRef}
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(
        table.status,
      )} ${table.status !== 'available' ? 'border-dashed border-2' : ''} select-none active:scale-95`}
      {...bind}
    >
      <CardContent className="p-4 text-center">
        {/* Table Number */}
        <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {table.table_number}
        </div>

        {/* Table Icon and Status */}
        {table.status && (
          <div className="space-y-2">
            <div className="text-2xl">{getTableIcon(table.status)}</div>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Users className="h-3 w-3" />
              {table.status === 'occupied' && table.party_size ? (
                <span className="font-medium">
                  {table.party_size}
                  {table.capacity ? `/${table.capacity}` : ''}
                </span>
              ) : (
                table.capacity && <span>{table.capacity}</span>
              )}
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {getStatusText(table.status)}
            </div>
          </div>
        )}

        {/* Status Indicator for pending tables */}
        {table.status === 'pending' && (
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </CardContent>

      {/* Action Overlay — shown on long-press for available tables */}
      {showActions && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-lg bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-blue-600 shadow-lg hover:bg-blue-50 transition-colors active:scale-90"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(false)
              onEdit?.(table)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Edit table"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-red-600 shadow-lg hover:bg-red-50 transition-colors active:scale-90"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(false)
              onDelete?.(table)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Delete table"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </Card>
  )
}
