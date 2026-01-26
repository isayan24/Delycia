import { PackageX, Search, ShoppingBasket } from 'lucide-react'
import React from 'react'

export default function NoFoodBox({ refetch }: { refetch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4 max-w-md mx-auto">
        <div className="relative mb-6">
          <PackageX className="h-20 w-20 text-muted-foreground" strokeWidth={1.5} />
          <div className="absolute -right-2 -bottom-2 bg-muted rounded-full p-2">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-3">No items found</h3>
        <p className="text-muted-foreground mb-6">
          There are currently no items available in this category. Please check back later or explore other categories.
        </p>
        <button 
          onClick={() => refetch()} 
          className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <ShoppingBasket className="h-5 w-5" />
          <span>Refresh Category</span>
        </button>
      </div>
  )
}
