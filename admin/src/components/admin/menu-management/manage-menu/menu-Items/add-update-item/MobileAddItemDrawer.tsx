import React from 'react'
import { X, LayoutGrid, FileText } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import ErrorWarning from '../item-inputs/ErrorWarning'
import { SingleItemForm } from './components/SingleItemForm'
import { BulkItemForm } from './components/BulkItemForm'
import { getErrorFields } from './utils/formValidation'

// Types
import type {
  Category,
  FormData,
  Errors,
  FoodType,
  FormField,
  ItemImage,
} from '../types/addItemModal'
import type { Variant } from '../variants/types/variant.types'

interface MobileAddItemDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  categoryId: any
  isBulkMode: boolean
  setIsBulkMode: (val: boolean) => void
  handleModeToggle: () => void
  formData: FormData
  errors: Errors
  handleInputChange: (field: FormField, value: string | number) => void
  handleFoodTypeChange: (type: FoodType) => void
  itemImages: ItemImage[]
  setItemImages: React.Dispatch<React.SetStateAction<ItemImage[]>>
  handleImageUpload: (newImages: ItemImage[]) => void
  handleRemoveImage: (imageId: string) => void
  handlePriceChange: (value: string) => void
  handleCostChange: (value: string) => void
  savedVariant: (variants: Variant[]) => void
  bulkItems: any[]
  bulkErrors: any
  handleRemoveBulkItem: (id: string) => void
  handleBulkItemChange: (id: string, field: any, value: any) => void
  handleAddBulkItem: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  isPending: boolean
  showWarning: boolean
  getCurrentCategoryName: () => string | undefined
}

export default function MobileAddItemDrawer({
  open,
  onOpenChange,
  categories,
  isBulkMode,
  handleModeToggle,
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
  bulkItems,
  bulkErrors,
  handleRemoveBulkItem,
  handleBulkItemChange,
  handleAddBulkItem,
  onSubmit,
  isPending,
  showWarning,
  getCurrentCategoryName,
}: MobileAddItemDrawerProps) {
  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DrawerContent className="max-h-[90vh] flex flex-col bg-white dark:bg-[#1a130f] border-none rounded-t-[24px] shadow-2xl">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-10">
          {/* Header Section (Scrollable) */}
          <div className="pt-6 pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {getCurrentCategoryName()}
              </DrawerTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <Separator className="my-4 opacity-50" />
          </div>

          {/* Mode Switcher (Scrollable) */}
          <Tabs
            value={isBulkMode ? 'bulk' : 'single'}
            onValueChange={(val) => {
              if ((val === 'bulk') !== isBulkMode) {
                handleModeToggle()
              }
            }}
            className="w-full mb-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl h-11 border border-gray-100 dark:border-white/5">
              <TabsTrigger
                value="single"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-orange-600 font-bold transition-all text-xs"
              >
                <FileText size={14} />
                Single
              </TabsTrigger>
              <TabsTrigger
                value="bulk"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-orange-600 font-bold transition-all text-xs"
              >
                <LayoutGrid size={14} />
                Bulk Add
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ErrorWarning
            showWarning={showWarning}
            errorFields={getErrorFields(errors)}
          />

          <div className="mt-4 space-y-6">
            {isBulkMode ? (
              <BulkItemForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleFoodTypeChange={handleFoodTypeChange}
                categories={categories}
                bulkItems={bulkItems}
                bulkErrors={bulkErrors}
                handleRemoveBulkItem={handleRemoveBulkItem}
                handleBulkItemChange={handleBulkItemChange}
                handleAddBulkItem={handleAddBulkItem}
                isImageLoading={false}
              />
            ) : (
              <SingleItemForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleFoodTypeChange={handleFoodTypeChange}
                categories={categories}
                itemImages={itemImages}
                setItemImages={setItemImages}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                isImageLoading={false}
                handlePriceChange={handlePriceChange}
                handleCostChange={handleCostChange}
                setItemVariants={savedVariant}
              />
            )}
          </div>

          {/* Action Buttons (Scrollable) */}
          <div className="mt-10 mb-5 flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Discard
            </Button>
            <StatefulButton
              onClick={onSubmit}
              className="flex-[2] h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 border-none transition-all active:scale-[0.98]"
              disabled={isPending}
              loading={isPending}
            >
              {isBulkMode ? (
                <span>Save {bulkItems.length} Items</span>
              ) : (
                <span>Save Item</span>
              )}
            </StatefulButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
