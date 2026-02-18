import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import ErrorWarning from '../item-inputs/ErrorWarning'
import ItemNameInput from '../item-inputs/ItemNameInput'
import ItemDescriptionInput from '../item-inputs/ItemDescriptionInput'
import CategorySelector from '../selectors/CategorySelector'
import FoodTypeSelector from '../selectors/FoodTypeSelector'
import ImageUploadSection from '../item-inputs/ImageUploadSection'
import PricingSection from '../item-inputs/PricingSection'
import StockAvailability from '../item-inputs/StockAvailability'
import VariantManagerMain from '../variants/VariantManagerMain'
import { getErrorFields } from './utils/formValidation'

// Types
import type {
  Category,
  FoodType,
  FormField,
  ItemImage,
} from '../types/addItemModal'
import type { Variant } from '../variants/types/variant.types'

interface MobileUpdateItemDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  formData: any
  errors: any
  handleInputChange: (field: FormField, value: string | number) => void
  handleFoodTypeChange: (type: FoodType) => void
  itemImages: ItemImage[]
  setItemImages: (images: ItemImage[]) => void
  handleImageUpload: (newImages: any[]) => void
  handleRemoveImage: (imageId: string) => void
  handlePriceChange: (value: string) => void
  handleCostChange: (value: string) => void
  savedVariant: (variants: Variant[]) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  isPending: boolean
  showWarning: boolean
  getCurrentCategoryName: () => string | undefined
  isLoadingVariants: boolean
  existingVariants: Variant[]
}

export default function MobileUpdateItemDrawer({
  open,
  onOpenChange,
  categories,
  formData,
  errors,
  handleInputChange,
  handleFoodTypeChange,
  itemImages,
  setItemImages,
  handleImageUpload,
  handleRemoveImage,
  handlePriceChange,
  handleCostChange,
  savedVariant,
  onSubmit,
  isPending,
  showWarning,
  getCurrentCategoryName,
  isLoadingVariants,
  existingVariants,
}: MobileUpdateItemDrawerProps) {
  if (!open) return null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      dismissible={false}
      repositionInputs={false}
    >
      <DrawerContent className="max-h-[90vh] flex flex-col bg-white dark:bg-[#1a130f] border-none rounded-t-[24px] shadow-2xl">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-10">
          {/* Header Section (Scrollable) */}
          <div className="pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {getCurrentCategoryName()}
                </DrawerTitle>
                <p className="text-[10px] uppercase tracking-widest font-black text-orange-500/80">
                  Update Menu Item
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <Separator className="my-4 opacity-50" />
          </div>

          <ErrorWarning
            showWarning={showWarning}
            errorFields={getErrorFields(errors)}
          />

          <div className="mt-4 space-y-6">
            <ItemNameInput
              value={formData.name}
              onChange={(value: string) => handleInputChange('name', value)}
              hasError={errors.name}
            />

            <ItemDescriptionInput
              value={formData.description}
              onChange={(value: string) =>
                handleInputChange('description', value)
              }
              hasError={errors.description}
            />

            <section className="flex flex-col gap-6 py-2">
              <FoodTypeSelector
                selectedType={formData.foodType}
                onTypeChange={handleFoodTypeChange}
              />

              <CategorySelector
                selectedCategoryId={formData.category_id}
                categories={categories}
                onChange={(value: number) =>
                  handleInputChange('category_id', value)
                }
                hasError={errors.category_id}
              />
              <StockAvailability
                value={formData.stock}
                onChange={(value: number) => handleInputChange('stock', value)}
                hasError={errors.stock}
              />
            </section>

            <ImageUploadSection
              setItemImages={setItemImages}
              itemImages={itemImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              isImageLoading={false}
              hasError={errors.image}
            />

            <PricingSection
              cost={formData.cost?.toString() || ''}
              price={formData.price?.toString() || ''}
              onPriceChange={handlePriceChange}
              onCostChange={handleCostChange}
              hasError={errors.price || errors.cost}
            />

            <div className={isLoadingVariants ? 'opacity-50' : ''}>
              <VariantManagerMain
                onSave={savedVariant}
                initialVariants={existingVariants}
              />
            </div>
          </div>

          <div className="mt-10 mb-5 flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Discard
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-2 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 border-none transition-all active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                <span>Update Item</span>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
