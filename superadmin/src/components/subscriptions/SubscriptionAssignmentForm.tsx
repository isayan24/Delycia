import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X, Calendar, History } from 'lucide-react'
import {
  subscriptionAssignmentSchema,
  type SubscriptionAssignmentFormData,
} from '@/schemas/subscriptionSchema'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
import { useSubscriptionPlansQuery } from '@/hooks/queries/useSubscriptionPlansQuery'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '../ui/alert'

interface SubscriptionAssignment {
  id: number
  restaurant_id: number
  subscription_plan_id: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  auto_renew: boolean
  created_at: string
  updated_at: string
}

interface SubscriptionAssignmentFormProps {
  assignment?: SubscriptionAssignment
  onSubmit: (data: SubscriptionAssignmentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  subscriptionHistory?: SubscriptionAssignment[]
}

export function SubscriptionAssignmentForm({
  assignment,
  onSubmit,
  onCancel,
  isSubmitting = false,
  subscriptionHistory = [],
}: SubscriptionAssignmentFormProps) {
  const isEditMode = !!assignment?.id

  // Fetch restaurants and subscription plans
  const {
    data: restaurantsData,
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useRestaurantsQuery({ limit: 1000 })

  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useSubscriptionPlansQuery()

  // @ts-expect-error - zodResolver type compatibility warning is a known issue with Zod v3
  // The form works correctly at runtime
  const form = useForm<SubscriptionAssignmentFormData>({
    resolver: zodResolver(subscriptionAssignmentSchema),
    mode: 'onBlur',
    defaultValues: {
      restaurant_id: assignment?.restaurant_id || 0,
      subscription_plan_id: assignment?.subscription_plan_id || 0,
      start_date: assignment?.start_date || new Date().toISOString().split('T')[0],
      end_date:
        assignment?.end_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      auto_renew: assignment?.auto_renew ?? false,
      status: assignment?.status || 'active',
    },
  })

  const handleSubmit = async (data: SubscriptionAssignmentFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const restaurants = restaurantsData?.data?.data || []
  const plans = plansData?.data || []

  const isLoading = isLoadingRestaurants || isLoadingPlans
  const hasError = restaurantsError || plansError

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load required data. Please refresh the page and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Assignment Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Restaurant Selector */}
              <FormField
                control={form.control}
                name="restaurant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant *</FormLabel>
                    {isLoadingRestaurants ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        value={field.value ? field.value.toString() : ''}
                        disabled={isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a restaurant" />
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
                    )}
                    <FormDescription>
                      {isEditMode
                        ? 'Restaurant cannot be changed after assignment'
                        : 'Select the restaurant to assign a subscription plan'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plan Selector */}
              <FormField
                control={form.control}
                name="subscription_plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan *</FormLabel>
                    {isLoadingPlans ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans
                            .filter((plan) => plan.is_active)
                            .map((plan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name} - ${plan.price}/{plan.billing_cycle}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormDescription>
                      Select the subscription plan to assign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      When the subscription becomes active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      When the subscription expires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status and Auto-Renew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of the subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_renew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Auto-Renew</FormLabel>
                      <FormDescription>
                        Automatically renew subscription at end date
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || hasError}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Assigning...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Update Assignment' : 'Assign Plan'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Subscription History Section */}
      {subscriptionHistory.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Subscription History</h3>
          </div>

          <div className="space-y-2">
            {subscriptionHistory.map((history) => {
              const plan = plans.find((p) => p.id === history.subscription_plan_id)
              const statusColors = {
                active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              }

              return (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{plan?.name || 'Unknown Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.start_date).toLocaleDateString()} -{' '}
                      {new Date(history.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {history.auto_renew && (
                      <span className="text-xs text-muted-foreground">Auto-renew</span>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[history.status]}`}
                    >
                      {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
