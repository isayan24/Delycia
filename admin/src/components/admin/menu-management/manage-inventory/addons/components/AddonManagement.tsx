import { useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useAddons } from '../hooks/useAddons'
import { AddonDialog } from './AddonDialog'
import { LinkInventoryDialog } from './LinkInventoryDialog'
import { AddonActionBar } from './AddonActionBar'
import useInventoryStore from '../../inventory/main-file/UseInventoryStates'
import type { UpdateAddonParams } from '@/api/types/addons.types'
import type { AddonFormData } from '@/schemas/addonSchema'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAddonManagementUI } from '../hooks/useAddonManagementUI'
import { AddonDesktopLayout } from './layouts/AddonDesktopLayout'
import { AddonMobileLayout } from './layouts/AddonMobileLayout'

export function AddonManagement() {
  const { selectedRid } = useRestaurantSelector()
  const {
    addons,
    loading,
    fetchAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    bulkDelete,
    bulkUpdate,
    linkToItem,
    unlinkFromItem,
  } = useAddons()

  const { allItems } = useInventoryItems()

  // Ensure addons is always an array
  const addonsList = Array.isArray(addons) ? addons : []

  // Initialize UI state hook
  const {
    // State
    selectedAddon,
    selectedAddons,
    dialogOpen,
    linkDialogOpen,
    currentAddon,
    deleteConfirmOpen,
    addonToDelete,
    refreshLinkedItems,

    // Setters
    setSelectedAddon,
    setDialogOpen,
    setLinkDialogOpen,
    setDeleteConfirmOpen,

    // Handlers
    handleToggleSelection,
    handleSelectAll,
    handleClearSelection,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleOpenLinkDialog,
    triggerLinkedItemsRefresh,
    closeDeleteConfirm,
    closeDialog,
  } = useAddonManagementUI(addonsList)

  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Fetch addons on mount and when restaurant changes
  useEffect(() => {
    if (selectedRid) {
      fetchAddons({ rid: selectedRid })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRid])

  // Get all inventory items from the store
  const allInventoryItems = Object.values(allItems)
    .flat()
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category_id: item.category_id,
      category_name: item.category_name,
    }))

  const handleDeleteConfirm = async () => {
    if (addonToDelete) {
      await deleteAddon(addonToDelete.id, selectedRid)

      // Clear selection if deleting selected addon
      if (selectedAddon?.id === addonToDelete.id) {
        setSelectedAddon(null)
      }

      closeDeleteConfirm()
    }
  }

  // mark create addon
  const handleFormSubmit = async (
    data: AddonFormData | UpdateAddonParams | any,
  ) => {
    if (currentAddon) {
      // Edit existing
      await updateAddon(currentAddon.id, selectedRid, data)
    } else {
      // Create new
      await createAddon({
        rid: selectedRid,
        name: data.name,
        price: data.price,
        is_active: data.is_active,
      })
    }
  }

  // mark Link addon to multiple inventory items
  const handleLinkItems = async (addonId: string, inventoryIds: string[]) => {
    await linkToItem(inventoryIds, addonId)

    // Refresh linked items view
    triggerLinkedItemsRefresh()
  }

  const handleUnlinkItem = async (inventoryId: string) => {
    if (!selectedAddon) return

    try {
      await unlinkFromItem(inventoryId, [selectedAddon.id])
      // Refresh linked items view
      triggerLinkedItemsRefresh()
    } catch (error) {
      console.error('Error unlinking item:', error)
    }
  }

  // Bulk operation handlers
  const handleBulkActivate = async () => {
    const addonIds = Array.from(selectedAddons)
    await bulkUpdate(addonIds, selectedRid, { is_active: 1 })
    handleClearSelection()
  }

  const handleBulkDeactivate = async () => {
    const addonIds = Array.from(selectedAddons)
    await bulkUpdate(addonIds, selectedRid, { is_active: 0 })
    handleClearSelection()
  }

  const handleBulkDelete = async () => {
    const addonIds = Array.from(selectedAddons)
    await bulkDelete(addonIds, selectedRid)
    handleClearSelection()

    // Clear selection if deleting selected addon
    if (selectedAddon && selectedAddons.has(selectedAddon.id)) {
      setSelectedAddon(null)
    }
  }

  return (
    <div className="w-full h-[calc(100vh-5rem)] p-3">
      {isDesktop ? (
        <AddonDesktopLayout
          addons={addonsList}
          selectedAddon={selectedAddon}
          selectedAddons={selectedAddons}
          refreshLinkedItemsKey={refreshLinkedItems}
          onSelectAddon={setSelectedAddon}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onUnlinkItem={handleUnlinkItem}
          onOpenLinkDialog={handleOpenLinkDialog}
        />
      ) : (
        <AddonMobileLayout
          addons={addonsList}
          selectedAddon={selectedAddon}
          selectedAddons={selectedAddons}
          refreshLinkedItemsKey={refreshLinkedItems}
          onSelectAddon={setSelectedAddon}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onUnlinkItem={handleUnlinkItem}
          onOpenLinkDialog={handleOpenLinkDialog}
        />
      )}

      {/* Dialogs */}
      <AddonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addon={currentAddon}
        onSubmit={handleFormSubmit}
      />

      <LinkInventoryDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        addon={selectedAddon}
        onLink={handleLinkItems}
        allInventoryItems={allInventoryItems}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete addon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{addonToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Bar */}
      <AddonActionBar
        selectedCount={selectedAddons.size}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}
