import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X, Calendar, RefreshCw } from 'lucide-react'
import {
  subscriptionUpdateSchema,
  type SubscriptionUpdateFormData,
} from '@/schemas/subscriptionSchema'
import type { SubscriptionPlan } from '@/lib/api/subscriptions'
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
import { Switch } from '@/components/ui/switch'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
import { useSubscriptionPlansQuery } from '@/hooks/queries/useSubscriptionPlansQuery'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

const BILLING_LABEL: Record<string, string> = {
  month: 'Monthly',
  year: 'Yearly',
  trial: 'Trial',
}

interface SubscriptionUpdateFormProps {
  onSubmit: (data: SubscriptionUpdateFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function SubscriptionUpdateForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SubscriptionUpdateFormProps) {
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

  const form = useForm<SubscriptionUpdateFormData>({
    resolver: zodResolver(subscriptionUpdateSchema),
    mode: 'onBlur',
    defaultValues: {
      id: 0,
      auto_renew: true,
      status: 'active',
    },
  })

  const restaurants = (restaurantsData?.data || []).filter(
    (r) => !!r.subscription_assignment_id,
  )
  const plans = (plansData?.data || []).filter(
    (p: SubscriptionPlan) => !!p.is_active,
  )

  const isLoading = isLoadingRestaurants || isLoadingPlans
  const hasError = restaurantsError || plansError

  // When a restaurant is selected, set the subscription ID
  const handleRestaurantChange = (restaurantId: string) => {
    const rId = parseInt(restaurantId, 10)
    const restaurant = restaurants.find((r) => r.id === rId)
    if (restaurant?.subscription_assignment_id) {
      form.setValue('id', restaurant.subscription_assignment_id)
      // If we had more info (start_date, end_date), we'd set them here
      if (restaurant.subscription_status) {
        form.setValue('status', restaurant.subscription_status as any)
      }
    }
  }

  // When a plan is selected, auto-calculate the end date based on billing_days
  const handlePlanChange = (planId: string) => {
    console.log(planId, 'plan id \n\n\n\n')
    const numId = parseInt(planId, 10)
    form.setValue('subscription_plan_id', numId)

    const selectedPlan = plans.find((p) => p.id === numId)
    if (selectedPlan) {
      const startDate =
        form.getValues('start_date') || new Date().toISOString().split('T')[0]
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + selectedPlan.billing_days)
      form.setValue('end_date', end.toISOString().split('T')[0])
      if (!form.getValues('start_date')) {
        form.setValue('start_date', startDate)
      }
    }
  }

  const handleSubmit = async (data: SubscriptionUpdateFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {hasError && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load required data. Please refresh and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Restaurant Selection */}
        <FormItem>
          <FormLabel>Restaurant with Active Subscription *</FormLabel>
          {isLoadingRestaurants ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={handleRestaurantChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant to update" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {restaurants.map((r: any) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name} ({r.subscription_plan_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormDescription>
            Only restaurants that already have a subscription can be updated
            here.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <div className="grid grid-cols-2 gap-4">
          {/* Plan */}
          <FormField
            control={form.control}
            name="subscription_plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Subscription Plan</FormLabel>
                {isLoadingPlans ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={handlePlanChange}
                    value={field.value ? field.value.toString() : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new plan (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan: SubscriptionPlan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.plan_name} — ₹
                          {Number(plan.price).toLocaleString('en-IN')}/
                          {BILLING_LABEL[plan.billing_period] ||
                            plan.billing_period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="date" {...field} className="pl-10" />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="date" {...field} className="pl-10" />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Auto-renew */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Auto-Renew</label>
            <p className="text-xs text-muted-foreground">
              Automatically renew when subscription expires
            </p>
          </div>
          <FormField
            control={form.control}
            name="auto_renew"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || isLoading || !!hasError || !form.getValues('id')
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Update Plan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
