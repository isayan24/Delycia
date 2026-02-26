import React from 'react'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface InfoTooltipProps {
  content: string | React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  iconSize?: number
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  side = 'top',
  className = '',
  iconSize = 14,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ${className}`}
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle size={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="w-[calc(100vw-3rem)] max-w-[280px] sm:max-w-xs text-xs bg-slate-900 text-white border-slate-700 p-3 z-50 break-words"
          sideOffset={5}
          collisionPadding={24}
          align="center"
        >
          <div className="break-words whitespace-normal">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
