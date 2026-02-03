import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
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
}

export default function TableCard({
  table,
  onSelect,
  onLongPress,
}: TableCardProps) {
  // Helpers moved from ShowTables logic
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
    delay: 500, // 500ms hold
    onLongPress: () => {
      if (table.status === 'occupied' || table.status === 'reserved') {
        onLongPress(table)
      } else {
        // If not occupied, behave like a click or ignore?
        // Let's trigger select for consistency if user just holds it
        onSelect(table)
      }
    },
    onClick: () => {
      onSelect(table)
    },
  })

  return (
    <Card
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
    </Card>
  )
}
