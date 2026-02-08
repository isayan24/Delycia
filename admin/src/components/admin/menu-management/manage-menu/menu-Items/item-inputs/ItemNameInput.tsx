import { ChefHat, Highlighter } from 'lucide-react'

export default function ItemNameInput({ value, onChange, hasError }: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 sm:mb-3">
        <div className="flex items-center gap-2">
          <Highlighter className="h-4 w-4 sm:h-5 sm:w-5 text-[#000000]" />
          <h2 className="text-base sm:text-lg font-[500] text-gray-800">
            Item Name
          </h2>
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Item name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 sm:p-6 text-sm sm:text-md border rounded-md pl-10 sm:pl-12 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            hasError ? 'border-red-500 bg-red-50' : ''
          }`}
        />
        <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
