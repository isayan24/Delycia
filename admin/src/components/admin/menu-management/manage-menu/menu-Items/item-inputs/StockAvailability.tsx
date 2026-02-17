import { Combine, HelpCircle, PackageCheck } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelperTooltip } from '@/components/common/HelperTooltip'

export default function StockAvailability({ value, onChange, hasError }: any) {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-1 sm:mb-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <h2 className="text-base sm:text-lg font-[500] text-gray-800">
            Stock Availability
          </h2>
        </div>
        <HelperTooltip content="How many items are available in stock" />
      </div>

      <div className="relative">
        <input
          type="number"
          placeholder="items in stock"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full sm:w-[15rem] p-2 text-sm sm:text-md border rounded-md pl-10 sm:pl-12 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            hasError ? 'border-red-500 bg-red-50' : ''
          }`}
        />
        <Combine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
