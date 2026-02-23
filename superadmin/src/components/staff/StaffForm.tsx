import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import { staffSchema, type StaffFormData } from '@/schemas/staffSchema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const STAFF_ROLES = [
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Restaurant owner' },
  { id: 4, name: 'Restaurant manager' },
  { id: 5, name: 'Waiter' },
  { id: 6, name: 'Kitchen Staff' },
  { id: 7, name: 'Delivery' },
] as const

export const getRoleName = (roleValue: number) => {
  const role = STAFF_ROLES.find((r) => r.id === roleValue)
  return role ? role.name : `Role ${roleValue}`
}

interface StaffFormProps {
  staff?: StaffFormData & { id?: number; restaurant_ids?: number[] }
  onSubmit: (data: StaffFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  restaurants?: Array<{ id: number; name: string }>
}

export function StaffForm({
  staff,
  onSubmit,
  onCancel,
  isSubmitting = false,
  restaurants = [],
}: StaffFormProps) {
  const isEditMode = !!staff?.id

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      name: staff?.name || '',
      phone_number: staff?.phone_number || '',
      role: staff?.role || 5, // Default to Waiter
      restaurant_id: staff?.restaurant_ids?.[0] || staff?.restaurant_id || 0,
    },
  })

  const handleSubmit = async (data: StaffFormData) => {
    try {
      const payload = { ...data }

      // Generate username if not present (especially for new staff creation)
      if (!isEditMode && !payload.username) {
        const baseName = payload.name.toLowerCase().replace(/\s+/g, '')
        const randomSuffix = Math.floor(1000 + Math.random() * 9000) // Ensure 4 digits
        payload.username = `${baseName}${randomSuffix}`
      }

      await onSubmit(payload as StaffFormData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Staff Information
          </h3>

          <FormField
            control={form.control}
            name="restaurant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restaurant *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem
                        key={restaurant.id}
                        value={restaurant.id.toString()}
                      >
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter staff member name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STAFF_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Defines the access level and permissions for this staff member
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update Staff' : 'Create Staff'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
