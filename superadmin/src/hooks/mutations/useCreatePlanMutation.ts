import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPlan } from '@/lib/api/subscriptions'
import type { SubscriptionPlanFormData } from '@/schemas/subscriptionSchema'

interface CreatePlanResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    id: number
    plan_name: string
    description: string
    price: number
    billing_period: 'monthly' | 'quarterly' | 'annual'
    max_menu_items: number
    max_staff: number
    max_monthly_orders: number
    custom_branding: boolean
    analytics_access: boolean
    api_access: boolean
    priority_support: boolean
    is_active: boolean
    created_at: string
    updated_at: string
  }
}

async function createPlanFn(data: SubscriptionPlanFormData): Promise<CreatePlanResponse> {
  const response = await createPlan({ data })
  const result = await response.json()
  return result
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlanFn,
    onSuccess: (response) => {
      // Invalidate all subscription plan queries to refetch with the new plan
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to create subscription plan:', error)
    },
  })
}
