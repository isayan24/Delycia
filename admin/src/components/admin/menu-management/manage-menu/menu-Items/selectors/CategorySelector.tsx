import { HelpCircle, LayoutList } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelperTooltip } from '@/components/common/HelperTooltip'

export default function CategorySelector({
  selectedCategoryId,
  categories,
  onChange,
  hasError,
}: any) {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-1 sm:mb-3">
        <div className="flex items-center gap-2">
          <LayoutList className="h-4 w-4 sm:h-5 sm:w-5 text-[#dc9629]" />
          <h2 className="text-base sm:text-lg font-[500] text-gray-800">
            Menu Category
          </h2>
        </div>
        <HelperTooltip content="Menu category of the item" />
      </div>

      <Select value={selectedCategoryId} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full sm:w-[15rem] ${
            hasError ? 'border-red-500 bg-red-50' : ''
          } !text-sm sm:!text-lg`}
        >
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((category: any) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="!text-sm sm:!text-[1rem]"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
