import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import { bulkUpdateMenuSchema, type BulkUpdateMenuData } from '@/schemas/menuSchema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

interface BulkEditMenuProps {
  selectedItems: Array<{ id: number; name: string; price: number; is_available: boolean }>
  onSubmit: (data: BulkUpdateMenuData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  categories?: Array<{ id: number; name: string }>
}

export function BulkEditMenu({
  selectedItems,
  onSubmit,
  onCancel,
  isSubmitting = false,
  categories = [],
}: BulkEditMenuProps) {
  const [updatePrice, setUpdatePrice] = useState(false)
  const [updateAvailability, setUpdateAvailability] = useState(false)
  const [updateCategory, setUpdateCategory] = useState(false)

  const form = useForm<BulkUpdateMenuData>({
    resolver: zodResolver(bulkUpdateMenuSchema),
    mode: 'onBlur',
    defaultValues: {
      item_ids: selectedItems.map((item) => item.id),
      updates: {
        price: undefined,
        is_available: undefined,
        category_id: undefined,
      },
    },
  })

  const handleSubmit = async (data: BulkUpdateMenuData) => {
    try {
      // Only include fields that are being updated
      const updates: any = {}
      if (updatePrice && data.updates.price !== undefined) {
        updates.price = data.updates.price
      }
      if (updateAvailability && data.updates.is_available !== undefined) {
        updates.is_available = data.updates.is_available
      }
      if (updateCategory && data.updates.category_id !== undefined) {
        updates.category_id = data.updates.category_id
      }

      await onSubmit({
        item_ids: data.item_ids,
        updates,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Selected Items Summary */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Selected Items ({selectedItems.length})</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {selectedItems.map((item) => (
            <div key={item.id} className="text-sm flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Bulk Update Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Update Fields</h3>

            {/* Price Update */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-price"
                  checked={updatePrice}
                  onCheckedChange={(checked) => setUpdatePrice(checked as boolean)}
                />
                <label
                  htmlFor="update-price"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Update Price
                </label>
              </div>
              {updatePrice && (
                <FormField
                  control={form.control}
                  name="updates.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Availability Update */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-availability"
                  checked={updateAvailability}
                  onCheckedChange={(checked) => setUpdateAvailability(checked as boolean)}
                />
                <label
                  htmlFor="update-availability"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Update Availability
                </label>
              </div>
              {updateAvailability && (
                <FormField
                  control={form.control}
                  name="updates.is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Set items as available or unavailable
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Category Update */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-category"
                  checked={updateCategory}
                  onCheckedChange={(checked) => setUpdateCategory(checked as boolean)}
                />
                <label
                  htmlFor="update-category"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Update Category
                </label>
              </div>
              {updateCategory && (
                <FormField
                  control={form.control}
                  name="updates.category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (!updatePrice && !updateAvailability && !updateCategory)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update {selectedItems.length} Items
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
