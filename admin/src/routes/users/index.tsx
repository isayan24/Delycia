import { createFileRoute } from '@tanstack/react-router'
import AllUsers from '@/components/admin/users/AllUsers'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/users/')({
  beforeLoad: requireAuth,
  component: UsersPage,
})

function UsersPage() {
  return (
    <>
      <AllUsers />
    </>
  )
}
