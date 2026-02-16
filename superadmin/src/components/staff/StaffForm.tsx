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

interface StaffFormProps {
  staff?: StaffFormData & { id?: number }
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
    resolver: zodResolver(staffSchema),
    mode: 'onBlur',
    defaultValues: {
      name: staff?.name || '',
      email: staff?.email || '',
      phone_number: staff?.phone_number || '',
      role: staff?.role || 10,
      restaurant_id: staff?.restaurant_id || 0,
      password: '',
    },
  })

  const handleSubmit = async (data: StaffFormData) => {
    try {
      // Don't send password if it's empty in edit mode
      if (isEditMode && !data.password) {
        const { password, ...dataWithoutPassword } = data
        await onSubmit(dataWithoutPassword as StaffFormData)
      } else {
        await onSubmit(data)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const getRoleName = (roleValue: number) => {
    const roleMap: Record<number, string> = {
      10: 'Staff',
      50: 'Manager',
      100: 'Admin',
    }
    return roleMap[roleValue] || `Role ${roleValue}`
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Staff Information</h3>
          
          <FormField
            control={form.control}
            name="restaurant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restaurant *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                  disabled={isEditMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {isEditMode && 'Restaurant cannot be changed after creation'}
                </FormDescription>
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
                  <Input
                    placeholder="Enter staff member name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="staff@example.com"
                      {...field}
                    />
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
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    <SelectItem value="10">Staff</SelectItem>
                    <SelectItem value="50">Manager</SelectItem>
                    <SelectItem value="100">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Defines the access level and permissions for this staff member
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password {isEditMode ? '(Optional)' : '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter password'}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {isEditMode 
                    ? 'Only enter a password if you want to change it'
                    : 'Minimum 8 characters required'
                  }
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
