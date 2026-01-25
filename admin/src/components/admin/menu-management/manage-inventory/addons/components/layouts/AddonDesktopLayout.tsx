import { AddonList } from '../AddonList'
import { LinkedItemsView } from '../LinkedItemsView'
import type { Addon } from '@/api/types/addons.types'

interface AddonDesktopLayoutProps {
  addons: Addon[]
  selectedAddon: Addon | null
  selectedAddons: Set<string>
  refreshLinkedItemsKey: number
  // Handlers
  onSelectAddon: (addon: Addon) => void
  onToggleSelection: (addonId: string) => void
  onSelectAll: (selected: boolean) => void
  onCreate: () => void
  onEdit: (addon: Addon) => void
  onDelete: (addon: Addon) => void
  onUnlinkItem: (inventoryId: string) => void
  onOpenLinkDialog: () => void
}

export function AddonDesktopLayout({
  addons,
  selectedAddon,
  selectedAddons,
  refreshLinkedItemsKey,
  onSelectAddon,
  onToggleSelection,
  onSelectAll,
  onCreate,
  onEdit,
  onDelete,
  onUnlinkItem,
  onOpenLinkDialog,
}: AddonDesktopLayoutProps) {
  return (
    <div className="flex gap-5 h-[calc(100vh-13rem)]">
      {/* Left Column - Addon List */}
      <div className="border rounded-lg bg-card overflow-auto h-full w-[40%]">
        <AddonList
          addons={addons}
          selectedAddon={selectedAddon}
          selectedAddons={selectedAddons}
          onSelectAddon={onSelectAddon}
          onToggleSelection={onToggleSelection}
          onSelectAll={onSelectAll}
          onAddNew={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Right Column - Linked Items */}
      <div className="border rounded-lg bg-card overflow-auto w-[60%]">
        <LinkedItemsView
          key={refreshLinkedItemsKey}
          selectedAddon={selectedAddon}
          onUnlinkItem={onUnlinkItem}
          onOpenLinkDialog={onOpenLinkDialog}
        />
      </div>
    </div>
  )
}
