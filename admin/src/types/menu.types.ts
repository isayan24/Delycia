export interface Category {
  id: string
  rid: string
  name: string
  description?: string
  img: string
  img_id?: string
  template_id?: number | null
  cuisine_type?: string
  display_order?: number
  is_active?: number
  item_count?: number
  created_at?: string
  updated_at?: string
}

export interface Variant {
  id: string
  name: string
  price: number
  inventory_id: string
}

export interface Item {
  id: string
  name: string
  img?: string
  image?: string
  images: string[]
  cost_price: number
  price: number
  category_id?: string
  rid?: string
  stock?: number
  variantId?: string // For cart items with selected variant
}

export interface MenuContextType {
  categories: Category[]
  selectedCategory: Category | null
  selectedCategoryId: string | null
  isEditCategoryDialogOpen: boolean
  isAddItemDialogOpen: boolean
  currentCategoryItem: Category | null
  refreshCategories: (rid: string) => Promise<void>
  handleCategorySelect: (category: Category) => void
  handleEditCategory: (category: Category) => void
  handleAddItem: (category: Category) => void
  setIsEditCategoryDialogOpen: (open: boolean) => void
  setIsAddItemDialogOpen: (open: boolean) => void
}
