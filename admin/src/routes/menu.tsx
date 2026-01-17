import { createFileRoute } from '@tanstack/react-router'
import MenuHeader from '@/components/admin/menu-management/MenuHeader'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/menu')({
  beforeLoad: requireAuth,
  component: MenuPage,
})

function MenuPage() {
  return (
    <div>
      <MenuHeader />
    </div>
  )
}
