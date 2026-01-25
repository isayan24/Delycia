import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { addonSchema, type AddonFormData } from '@/schemas/addonSchema'
import type { Addon } from '@/api/types/addons.types'
import { Loader2 } from 'lucide-react'

interface AddonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addon?: Addon | null
  onSubmit: (data: AddonFormData) => Promise<void>
}

export function AddonDialog({
  open,
  onOpenChange,
  addon,
  onSubmit,
}: AddonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!addon

  const form = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: '',
      price: 0,
      is_active: 1,
    },
  })

  // Reset form when dialog opens/closes or addon changes
  useEffect(() => {
    if (open && addon) {
      form.reset({
        name: addon.name,
        price: addon.price,
        is_active: addon.is_active,
      })
    } else if (open && !addon) {
      form.reset({
        name: '',
        price: 0,
        is_active: 1,
      })
    }
  }, [open, addon, form])

  const handleSubmit = async (data: AddonFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Addon' : 'Create New Addon'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the addon details below'
              : 'Add a new addon to your menu'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Addon Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Extra Cheese"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? 0 : parseFloat(value))
                      }}
                      value={field.value || ''}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Set the price for this addon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription className="text-xs">
                      Enable this addon for use in orders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Save Changes' : 'Create Addon'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
