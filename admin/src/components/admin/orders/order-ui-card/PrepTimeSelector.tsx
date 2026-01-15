import React from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface PrepTimeSelectorProps {
  prepTime: number
  onPrepTimeChange: (time: number) => void  
}

export function PrepTimeSelector({ 
  prepTime, 
  onPrepTimeChange,  
}: PrepTimeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium ">Set food preparation time</p>
      
      <div className="flex items-center gap-3 border-dashed border-green-400 borders rounded-lg p-2 bg-green-100/30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPrepTimeChange(prepTime - 5)}
          disabled={prepTime <= 5}
          className="w-10 h-10 p-0 bg-green-100 hover:bg-green-300/30 border-green-200"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold">{prepTime} mins</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={prepTime >= 60}
          onClick={() => onPrepTimeChange(prepTime + 5)}
          className="w-10 h-10 p-0 bg-green-100 hover:bg-green-300/30 border-green-200"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div> 
    </div>
  )
}