import { Button } from '@/components/ui/button'
import { Users, AlertCircle } from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'

interface PartySizeSelectorProps {
  maxCapacity?: number
  showError?: boolean
}

export default function PartySizeSelector({
  maxCapacity = 8,
  showError = false,
}: PartySizeSelectorProps) {
  const { partySize, setPartySize, table } = useTableStore()

  // Use table capacity if available, otherwise use maxCapacity prop
  const effectiveMax = Math.min(table?.capacity || maxCapacity, 10)

  // Generate options from 1 to effectiveMax
  const options = Array.from({ length: effectiveMax }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Party Size
        </span>
        {showError && partySize === 0 && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Please select party size
          </span>
        )}
      </div>
      <div
        className={`flex flex-wrap gap-2 ${showError && partySize === 0 ? 'ring-1 ring-red-500 rounded-lg p-2' : ''}`}
      >
        {options.map((size) => (
          <Button
            key={size}
            type="button"
            variant={partySize === size ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPartySize(size)}
            className={`min-w-[70px] ${
              partySize === size
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-primary/10'
            }`}
          >
            {size} {size === 1 ? 'Person' : 'Persons'}
          </Button>
        ))}
      </div>
    </div>
  )
}
