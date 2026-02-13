import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  Pencil,
  Trash2,
  Calendar,
  Coffee,
  CookingPot,
} from 'lucide-react'
import { useLongPress } from './hooks/useLongPress'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'occupied':
        return {
          icon: <Coffee className="h-4 w-4" />,
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-100 dark:bg-orange-900/40',
          border: 'border-orange-200 dark:border-orange-800',
          shadow: 'shadow-orange-200/50 dark:shadow-orange-900/20',
          emoji: (
            <img
              src="/table/table-available.png"
              alt="Occupied"
              className="w-10 h-10 object-contain opacity-60"
            />
          ),
        }
      case 'reserved':
        return {
          icon: <Calendar className="h-4 w-4" />,
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-100 dark:bg-indigo-900/40',
          border: 'border-indigo-200 dark:border-indigo-800',
          shadow: 'shadow-indigo-200/50 dark:shadow-indigo-900/20',
          emoji: '📅',
        }
      case 'available':
      default:
        return {
          icon: <Users className="h-4 w-4" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-100/50 dark:bg-emerald-900/40',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          shadow: 'shadow-emerald-200/50 dark:shadow-emerald-900/10',
          emoji: (
            <img
              src="/table/serving-dish.png"
              alt="Available"
              className="w-10 h-10 object-contain opacity-80"
            />
          ),
        }
    }
  }

  const config = getStatusConfig(table.status)

  // Setup long press hook
  const bind = useLongPress({
    delay: 500,
    onLongPress: () => {
      if (table.status === 'available') {
        setShowActions(true)
      } else if (table.status === 'occupied' || table.status === 'reserved') {
        onLongPress(table)
      }
    },
    onClick: () => {
      if (showActions) {
        setShowActions(false)
        return
      }
      onSelect(table)
    },
  })

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      transition={{ duration: 0.2 }}
      className="relative h-full"
    >
      <Card
        className={cn(
          'h-full relative overflow-hidden transition-all duration-300 border-2 select-none',
          table.status === 'available'
            ? 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border-emerald-400/30 hover:border-emerald-400/60'
            : 'bg-white dark:bg-gray-800 border-orange-400/30 dark:border-orange-800/50 shadow-sm',
          showActions &&
            'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900',
        )}
        {...bind}
      >
        <CardContent className="p-5 max-[500px]:p-3 flex flex-col items-center justify-between h-full gap-4">
          {/* Top Row: Table Number & Status Pill */}
          <div className="w-full flex items-center justify-between">
            <span className="text-2xl max-[500px]:text-lg font-black text-gray-900 dark:text-white tracking-tighter">
              {table.table_number}
            </span>
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm',
                config.bg,
                config.color,
                config.border,
              )}
            >
              {config.icon}
              {table.status}
            </div>
          </div>

          {/* Main Visual */}
          <div className="relative group">
            <div className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110">
              {config.emoji}
            </div>
            {table.status === 'occupied' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
              />
            )}
          </div>

          {/* Capacity/Party Size Indicator */}
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Capacity
              </span>
              <span className="text-gray-900 dark:text-gray-300">
                {table.status === 'occupied' && table.party_size ? (
                  <>
                    {table.party_size} / {table.capacity}
                  </>
                ) : (
                  table.capacity
                )}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    table.status === 'occupied' &&
                    table.party_size &&
                    table.capacity
                      ? `${(table.party_size / table.capacity) * 100}%`
                      : '100%',
                }}
                className={cn(
                  'h-full rounded-full transition-all duration-500 ',
                  table.status === 'occupied'
                    ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] '
                    : 'bg-emerald-500 ',
                )}
              />
            </div>
          </div>
        </CardContent>

        {/* Action Overlay */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px]"
            >
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', damping: 12 }}
                className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white text-blue-600 shadow-xl hover:bg-white hover:scale-110 transition-all active:scale-90 border border-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  onEdit?.(table)
                }}
                aria-label="Edit table"
              >
                <Pencil className="h-5 w-5" />
              </motion.button>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white text-red-600 shadow-xl hover:bg-white hover:scale-110 transition-all active:scale-90 border border-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  onDelete?.(table)
                }}
                aria-label="Delete table"
              >
                <Trash2 className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Decorative Glow for occupied tables */}
      {table.status === 'occupied' && (
        <div className="absolute inset-0 -z-10 bg-orange-400/5 blur-xl rounded-2xl transition-opacity group-hover:opacity-100" />
      )}
    </motion.div>
  )
}
