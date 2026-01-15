import { createFileRoute } from '@tanstack/react-router'
import MenuHeader from '@/components/admin/menu-management/MenuHeader'

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})

function MenuPage() {
  return (
    <div>
      <MenuHeader />
    </div>
  )
}
