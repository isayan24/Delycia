import React from 'react'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/useIsMobile'

interface HelperTooltipProps {
  content: string
}

/**
 * A responsive helper component that shows a tooltip on hover (desktop)
 * and a popover on click (mobile).
 */
export function HelperTooltip({ content }: HelperTooltipProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-all active:scale-90"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="bg-gray-900 text-white border-none shadow-2xl p-3 text-xs w-fit max-w-[200px] z-[100] animate-in fade-in zoom-in-95 duration-200"
        >
          <p className="font-medium leading-relaxed">{content}</p>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-gray-900 text-white border-none shadow-xl font-medium"
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
