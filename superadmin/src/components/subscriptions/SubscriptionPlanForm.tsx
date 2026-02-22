import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react'
import {
  subscriptionPlanSchema,
  type SubscriptionPlanFormData,
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

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan | null
  onSubmit: (data: SubscriptionPlanFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

/** Billing period → default billing_days mapping */
const BILLING_DAYS_MAP: Record<string, number> = {
  month: 30,
  year: 365,
  trial: 14,
}

export function SubscriptionPlanForm({
  plan,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SubscriptionPlanFormProps) {
  const isEditMode = !!plan?.id

  // Parse existing features from JSON string
  const existingFeatures: string[] = plan?.features
    ? (() => {
        try {
          const parsed =
            typeof plan.features === 'string'
              ? JSON.parse(plan.features)
              : plan.features
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })()
    : ['']

  // @ts-expect-error - zodResolver type compatibility
  const form = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    mode: 'onBlur',
    defaultValues: {
      plan_code: plan?.plan_code || '',
      plan_name: plan?.plan_name || '',
      price: plan?.price || 0,
      currency: plan?.currency || 'INR',
      billing_period: plan?.billing_period || 'month',
      billing_days: plan?.billing_days || 30,
      savings: plan?.savings || 0,
      is_popular: !!plan?.is_popular,
      is_active: plan ? !!plan.is_active : true,
      display_order: plan?.display_order || 0,
      features: existingFeatures.length > 0 ? existingFeatures : [''],
      max_restaurants: plan?.max_restaurants || 1,
    },
  })

  const features = form.watch('features')

  const addFeature = useCallback(() => {
    const current = form.getValues('features')
    form.setValue('features', [...current, ''])
  }, [form])

  const removeFeature = useCallback(
    (index: number) => {
      const current = form.getValues('features')
      if (current.length <= 1) return
      form.setValue(
        'features',
        current.filter((_, i) => i !== index),
      )
    },
    [form],
  )

  const handleBillingPeriodChange = (value: string) => {
    form.setValue('billing_period', value as 'month' | 'year' | 'trial')
    form.setValue('billing_days', BILLING_DAYS_MAP[value] || 30)
  }

  const handleSubmit = async (data: SubscriptionPlanFormData) => {
    // Filter out empty feature strings
    const cleanedData = {
      ...data,
      features: data.features.filter((f) => f.trim()),
    }
    await onSubmit(cleanedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Basic Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plan_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monthly Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. monthly_pro" {...field} />
                  </FormControl>
                  <FormDescription>Unique identifier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="499.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Period *</FormLabel>
                  <Select
                    onValueChange={handleBillingPeriodChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Days *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 30)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="savings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Savings (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>vs monthly</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_restaurants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Restaurants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Features *
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {features?.map((_: string, index: number) => (
              <FormField
                key={index}
                control={form.control}
                name={`features.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder={`Feature ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      {features.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Options
          </h3>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Popular Badge</label>
              <p className="text-xs text-muted-foreground">
                Highlights this plan on the pricing page
              </p>
            </div>
            <FormField
              control={form.control}
              name="is_popular"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {isEditMode && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Active</label>
                <p className="text-xs text-muted-foreground">
                  Inactive plans can't be assigned
                </p>
              </div>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isEditMode ? 'Update Plan' : 'Create Plan'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
