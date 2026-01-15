import { createFileRoute } from '@tanstack/react-router'
import BookTableMain from '@/components/admin/book-table/BookTableMain'
import { RouteProtector } from '@/components/user-roles/RouteProtector'

export const Route = createFileRoute('/book-table')({
  component: BookTablePage,
})

function BookTablePage() {
  return (
    <RouteProtector allowedRoles={[1, 2, 3, 4, 5]} fallbackRoute="/">
      <BookTableMain />
    </RouteProtector>
  )
}
