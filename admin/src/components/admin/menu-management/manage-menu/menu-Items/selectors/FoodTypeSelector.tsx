import { HelpCircle, LeafyGreen, Triangle } from 'lucide-react'

export default function FoodTypeSelector({ selectedType, onTypeChange }: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 sm:mb-3">
        <div className="flex items-center gap-2">
          <LeafyGreen className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <h2 className="text-base sm:text-lg font-[500] text-gray-800">
            Food Type
          </h2>
        </div>
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            Food type of the item
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => onTypeChange('Veg')}
          className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border transition-all ${
            selectedType === 'Veg'
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="w-3 h-3 sm:w-4 sm:h-4 border border-green-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm sm:text-base font-medium">Veg</span>
        </button>

        <button
          onClick={() => onTypeChange('Non-Veg')}
          className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border transition-all ${
            selectedType === 'Non-Veg'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="w-3 h-3 sm:w-4 sm:h-4 border border-red-500 flex items-center justify-center">
            <Triangle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-red-500 fill-red-500" />
          </div>
          <span className="text-sm sm:text-base font-medium">Non-Veg</span>
        </button>
      </div>
    </div>
  )
}
