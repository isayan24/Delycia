import { createFileRoute } from '@tanstack/react-router'
import BookTableMain from '@/components/admin/book-table/BookTableMain'
import { requireAuth } from '@/middleware/auth'
import { FeatureGuard } from '@/components/common/FeatureGuard'

export const Route = createFileRoute('/billing/book-table')({
  beforeLoad: requireAuth,
  component: BookTablePage,
})

function BookTablePage() {
  return (
    <FeatureGuard feature="table_management">
      <BookTableMain />
    </FeatureGuard>
  )
}
