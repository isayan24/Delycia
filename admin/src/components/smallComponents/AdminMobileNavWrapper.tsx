import AdminMobileNav from '../admin/navigation/AdminMobileNav'
import { useAuth } from '@/hooks/useAuth'

export default function AdminMobileNavWrapper() {
  const { user, accessToken } = useAuth()

  if (!accessToken || user) {
    return null
  }
  return <AdminMobileNav />
}
