import { createFileRoute } from '@tanstack/react-router'
import AdminProfile from '@/components/admin/profile/AdminProfile'

export const Route = createFileRoute('/users/p/')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div>
      <AdminProfile />
    </div>
  )
}
