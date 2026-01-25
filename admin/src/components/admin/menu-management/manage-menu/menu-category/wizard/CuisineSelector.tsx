import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { getCuisineTypes } from "@/helpers/categories/fetchCategories"; // OLD - Replaced
import { useCuisineTypesQuery } from '@/hooks/queries' // NEW - TanStack Query

interface CuisineSelectorProps {
  onSelect: (cuisine: string) => void
}

// Cuisine type icons mapping (using emojis for visual appeal)
const CUISINE_ICONS: Record<string, string> = {
  Indian: '🍛',
  Italian: '🍕',
  Chinese: '🍜',
  Continental: '🍽️',
  Dessert: '🍰',
  'Fast Food': '🍔',
  Mexican: '🌮',
  Japanese: '🍣',
  Thai: '🍲',
  Korean: '🥘',
  Mediterranean: '🥗',
  American: '🍖',
  French: '🥐',
  Vietnamese: '🍵',
  Spanish: '🥘',
  Greek: '🫒',
}

export default function CuisineSelector({ onSelect }: CuisineSelectorProps) {
  // NEW - Use TanStack Query 🚀
  const {
    data: cuisines = [],
    isLoading: loading,
    error,
    refetch,
  } = useCuisineTypesQuery()

  if (loading) {
    return (
      <div className="py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Cuisine Type
          </h2>
          <p className="text-gray-600">Loading available cuisines...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Cuisines
        </h3>
        <p className="text-gray-600 mb-4">Failed to load cuisine types</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (cuisines.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Cuisines Available
        </h3>
        <p className="text-gray-600">
          No category templates are currently available. Try creating a custom
          category instead.
        </p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="text-center mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Select Cuisine Type
        </h2>
        <p className="text-xs md:text-base text-gray-600">
          Browse category templates organized by cuisine
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cuisines.map((cuisine: any) => {
          const icon = CUISINE_ICONS[cuisine.cuisine_type] || '🍽️'

          return (
            <Card
              key={cuisine.cuisine_type}
              className="p-3 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all duration-200 border-2 group"
              onClick={() => onSelect(cuisine.cuisine_type)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-3xl group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">
                    {cuisine.cuisine_type}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {cuisine.template_count}{' '}
                    {cuisine.template_count === 1 ? 'category' : 'categories'}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
