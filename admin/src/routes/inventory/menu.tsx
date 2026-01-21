import { createFileRoute } from '@tanstack/react-router'
import ManageMenu from '@/components/admin/menu-management/manage-menu/main-file/ManageMenu'

export const Route = createFileRoute('/inventory/menu')({
  component: ManageMenuPage,
})

function ManageMenuPage() {
  return <ManageMenu />
}
