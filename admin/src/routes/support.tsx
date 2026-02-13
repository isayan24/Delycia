import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { SupportPage } from '@/components/admin/support/SupportPage'

export const Route = createFileRoute('/support')({
  beforeLoad: requireAuth,
  component: SupportPage,
})
