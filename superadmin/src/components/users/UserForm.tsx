import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import { userSchema, type UserFormData } from '@/schemas/userSchema'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
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
import { Checkbox } from '@/components/ui/checkbox'

interface UserFormProps {
  user?: UserFormData & { id?: number }
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserFormProps) {
  const isEditMode = !!user?.id

  // Fetch restaurants for assignment dropdown
  const { data: restaurantsData, isLoading: isLoadingRestaurants } = useRestaurantsQuery({ limit: 1000 })

  // Note: zodResolver type compatibility warning is a known issue with Zod v3
  // The form works correctly at runtime
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      country_code: user?.country_code || '+91',
      phone_number: user?.phone_number || '',
      role: user?.role || 1,
      restaurant_ids: user?.restaurant_ids || [],
      profile_pic: user?.profile_pic || '',
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const selectedRestaurants = form.watch('restaurant_ids')

  const toggleRestaurant = (restaurantId: number) => {
    const current = selectedRestaurants || []
    const updated = current.includes(restaurantId)
      ? current.filter((id) => id !== restaurantId)
      : [...current, restaurantId]
    form.setValue('restaurant_ids', updated, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91"
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
                  <FormItem className="col-span-2">
                    <FormLabel>Phone Number *</FormLabel>
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
          </div>
        </div>

        {/* Role and Status Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Role and Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Customer</SelectItem>
                      <SelectItem value="10">Staff</SelectItem>
                      <SelectItem value="100">Manager</SelectItem>
                      <SelectItem value="1000">Superadmin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile_pic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Restaurant Assignment Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Restaurant Assignment</h3>
          <FormField
            control={form.control}
            name="restaurant_ids"
            render={() => (
              <FormItem>
                <FormLabel>Restaurants *</FormLabel>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {isLoadingRestaurants ? (
                    <div className="text-sm text-muted-foreground">Loading restaurants...</div>
                  ) : restaurantsData?.data.data && restaurantsData.data.data.length > 0 ? (
                    <div className="space-y-2">
                      {restaurantsData.data.data.map((restaurant) => (
                        <div key={restaurant.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`restaurant-${restaurant.id}`}
                            checked={selectedRestaurants?.includes(restaurant.id)}
                            onCheckedChange={() => toggleRestaurant(restaurant.id)}
                          />
                          <label
                            htmlFor={`restaurant-${restaurant.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {restaurant.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No restaurants available</div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
