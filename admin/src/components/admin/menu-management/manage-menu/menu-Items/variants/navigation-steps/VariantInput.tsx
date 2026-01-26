// components/VariantInput.tsx
import React from 'react'
import { Trash2, Tag, DollarSign, IndianRupee, Loader2 } from 'lucide-react'
import { VariantInputProps } from '../types/variant.types'

const VariantInput: React.FC<VariantInputProps> = ({
  variant,
  index,
  onNameChange,
  onPriceChange,
  onRemove,
  canRemove,
  isLoading,
}) => (
  <div className="border border-orange-200 bg-orange-50/20 rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg text-gray-800">
        Variant {index + 1}
      </h3>
      {canRemove && (
        <button
          onClick={() => onRemove(variant.id)}
          disabled={isLoading}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-200 rounded-full transition-colors duration-200"
          type="button"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>

    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-2 text-orange-500" />
          Variant Name
        </label>
        <input
          type="text"
          value={variant.name}
          onChange={(e) => onNameChange(variant.id, e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          placeholder="e.g., Small, Red, 100ml"
        />
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
          Price
        </label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="number"
            value={variant.price || 0}
            onChange={(e) => onPriceChange(variant.id, e.target.value)}
            className="w-full pl-9 pr-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="0.00"
            step="1"
            min="0"
          />
        </div>
      </div>
    </div>
  </div>
)

export default VariantInput
