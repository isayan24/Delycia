import { createFileRoute } from '@tanstack/react-router'
import OrderHistoryMain from '@/components/admin/order-history/OrderHistoryMain'
import { requireAuth } from '@/middleware/auth'
import { z } from 'zod'

const orderHistorySearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
  filter_type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export const Route = createFileRoute('/orders/history')({
  beforeLoad: requireAuth,
  validateSearch: orderHistorySearchSchema,
  component: OrderHistoryPage,
})

function OrderHistoryPage() {
  return (
    <div>
      <OrderHistoryMain />
    </div>
  )
}
