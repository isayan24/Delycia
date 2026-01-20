import { createFileRoute } from '@tanstack/react-router'
import BookTableMain from '@/components/admin/book-table/BookTableMain'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/billing/book-table')({
  beforeLoad: requireAuth,
  component: BookTablePage,
})

function BookTablePage() {
  return <BookTableMain />
}
