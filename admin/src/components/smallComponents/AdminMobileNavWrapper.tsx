import AdminMobileNav from '../admin/navigation/AdminMobileNav'
import { useAuth } from '@/hooks/useAuth'

export default function AdminMobileNavWrapper() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || user) {
    return null
  }
  return <AdminMobileNav />
}
