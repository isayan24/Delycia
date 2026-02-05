import { createFileRoute } from '@tanstack/react-router'
import AdminProfile from '@/components/admin/profile/AdminProfile'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/settings/account')({
  beforeLoad: requireAuth,
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div>
      <AdminProfile />
    </div>
  )
}
