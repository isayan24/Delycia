import { createFileRoute } from '@tanstack/react-router'
import ManageInventory from '@/components/admin/menu-management/manage-inventory/inventory/main-file/ManageInventory'

export const Route = createFileRoute('/inventory/stock')({
  component: ManageInventoryPage,
})

function ManageInventoryPage() {
  return <ManageInventory />
}
