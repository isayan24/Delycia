import { createFileRoute } from '@tanstack/react-router'
import AllUsers from '@/components/admin/users/AllUsers'

export const Route = createFileRoute('/users/')({
  component: UsersPage,
})

function UsersPage() {
  return (
    <div>
      <AllUsers />
    </div>
  )
}
