import { HelpCircle, DollarSign, TrendingUp, Calculator } from 'lucide-react'

export default function PricingSection({
  cost,
  price,
  onCostChange,
  onPriceChange,
  hasError,
}: {
  cost: string
  price: string
  onCostChange: (value: string) => void
  onPriceChange: (value: string) => void
  hasError?: boolean
}) {
  const costNum = parseFloat(cost) || 0
  const priceNum = parseFloat(price) || 0
  const profit = priceNum - costNum
  const profitMargin: any =
    priceNum > 0 ? ((profit / priceNum) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
        <h2 className="text-base sm:text-lg font-[500] text-gray-800">
          Item Pricing
        </h2>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 sm:p-6 rounded-xl border border-orange-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Cost Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <label className="text-sm font-medium text-gray-700">
                Production Cost
              </label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Total cost to make this item
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                value={cost || ''}
                onChange={(e) => onCostChange(e.target.value)}
                className="w-full pl-8 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-lg"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Include materials, labor, and overhead costs
            </p>
          </div>

          {/* Price Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <label className="text-sm font-medium text-gray-700">
                Selling Price
              </label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Price you will charge customers
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => onPriceChange(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 sm:py-3 text-sm sm:text-lg border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                  hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Set your retail price for customers
            </p>
          </div>
        </div>

        {/* mark Profit Calculation */}
        {(costNum > 0 || priceNum > 0) && (
          <div className="mt-6 pt-4 border-t border-orange-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white p-2 sm:p-4 rounded-lg border border-orange-100">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                  Profit per Item
                </div>
                <div
                  className={`text-sm sm:text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ₹ {profit.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-lg border border-orange-100">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                  Profit Margin
                </div>
                <div
                  className={`text-sm sm:text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {profitMargin}%
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-lg border border-orange-100">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                  Markup
                </div>
                <div className="text-sm sm:text-lg font-semibold text-gray-700">
                  {costNum > 0
                    ? `${((priceNum / costNum - 1) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>
            </div>

            {profit < 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-700">
                    Warning: Your selling price is below cost. Consider
                    adjusting your price to ensure profitability.
                  </p>
                </div>
              </div>
            )}

            {profit >= 0 && profitMargin < 20 && costNum > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <p className="text-sm text-amber-700">
                    Low profit margin detected. Consider if this margin covers
                    all your business expenses.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
