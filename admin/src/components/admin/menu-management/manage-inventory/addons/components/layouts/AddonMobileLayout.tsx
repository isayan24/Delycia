import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { AddonList } from '../AddonList'
import { LinkedItemsView } from '../LinkedItemsView'
import type { Addon } from '@/api/types/addons.types'

interface AddonMobileLayoutProps {
  addons: Addon[]
  selectedAddon: Addon | null
  selectedAddons: Set<string>
  refreshLinkedItemsKey: number
  // Handlers
  onSelectAddon: (addon: Addon | null) => void
  onToggleSelection: (addonId: string) => void
  onSelectAll: (selected: boolean) => void
  onCreate: () => void
  onEdit: (addon: Addon) => void
  onDelete: (addon: Addon) => void
  onUnlinkItem: (inventoryId: string) => void
  onOpenLinkDialog: () => void
}

export function AddonMobileLayout({
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
}: AddonMobileLayoutProps) {
  return (
    <div className="h-[calc(100vh-13rem)]">
      <div className="border rounded-lg bg-card overflow-auto h-full w-full">
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

      {/* Mobile Drawer for Linked Items */}
      <Drawer
        open={!!selectedAddon}
        onOpenChange={(open) => !open && onSelectAddon(null)}
      >
        <DrawerContent className="h-[80vh]">
          <DrawerTitle className="sr-only">
            Linked Items for {selectedAddon?.name}
          </DrawerTitle>
          <div className="h-full overflow-auto p-1">
            <LinkedItemsView
              key={refreshLinkedItemsKey}
              selectedAddon={selectedAddon}
              onUnlinkItem={onUnlinkItem}
              onOpenLinkDialog={onOpenLinkDialog}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
