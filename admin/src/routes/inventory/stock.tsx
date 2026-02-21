import { createFileRoute } from '@tanstack/react-router'
import ManageInventory from '@/components/admin/menu-management/manage-inventory/inventory/main-file/ManageInventory'
import { FeatureGuard } from '@/components/common/FeatureGuard'

export const Route = createFileRoute('/inventory/stock')({
  component: ManageInventoryPage,
})

function ManageInventoryPage() {
  return (
    <FeatureGuard feature="inventory_management">
      <ManageInventory />
    </FeatureGuard>
  )
}
