import { Button } from '@/components/ui/button'
import { Users, AlertCircle } from 'lucide-react'

interface PartySizeSelectorProps {
  partySize: number
  setPartySize: (size: number) => void
  maxCapacity?: number
  showError?: boolean
}

export default function PartySizeSelector({
  partySize,
  setPartySize,
  maxCapacity = 6,
  showError = false,
}: PartySizeSelectorProps) {
  // Generate options from 1 to maxCapacity
  const options = Array.from({ length: maxCapacity }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          How many people are dining?
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
            className={`min-w-[60px] ${
              partySize === size
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'hover:bg-orange-50'
            }`}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  )
}
