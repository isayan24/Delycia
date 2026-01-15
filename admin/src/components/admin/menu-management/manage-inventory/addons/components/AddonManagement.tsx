
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRestaurantSelector } from "@/hooks/useRestaurantSelector";
import { useAddons } from "../hooks/useAddons";
import { AddonList } from "./AddonList";
import { LinkedItemsView } from "./LinkedItemsView";
import { AddonDialog } from "./AddonDialog";
import { LinkInventoryDialog } from "./LinkInventoryDialog";
import { AddonActionBar } from "./AddonActionBar";
import useInventoryStore from "../../inventory/main-file/UseInventoryStates";
import type { Addon, UpdateAddonParams } from "@/api/types/addons.types";
import type { AddonFormData } from "@/schemas/addonSchema";
import { useInventoryItems } from "@/hooks/useInventoryItems";

export function AddonManagement() {
  const { selectedRid } = useRestaurantSelector();
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
  } = useAddons();

  const { allItems } = useInventoryItems();

  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null);
  const [refreshLinkedItems, setRefreshLinkedItems] = useState(0);

  // Fetch addons on mount and when restaurant changes
  useEffect(() => {
    if (selectedRid) {
      fetchAddons({ rid: selectedRid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRid]);

  // Ensure addons is always an array
  const addonsList = Array.isArray(addons) ? addons : [];

  // Get all inventory items from the store
  const allInventoryItems = Object.values(allItems)
    .flat()
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category_id: item.category_id,
      category_name: item.category_name,
    }));

  const handleCreate = () => {
    setCurrentAddon(null);
    setDialogOpen(true);
  };

  const handleEdit = (addon: Addon) => {
    setCurrentAddon(addon);
    setDialogOpen(true);
  };

  const handleDeleteClick = (addon: Addon) => {
    setAddonToDelete(addon);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (addonToDelete) {
      await deleteAddon(addonToDelete.id, selectedRid);

      // Clear selection if deleting selected addon
      if (selectedAddon?.id === addonToDelete.id) {
        setSelectedAddon(null);
      }

      setDeleteConfirmOpen(false);
      setAddonToDelete(null);
    }
  };

  // mark create addon
  const handleFormSubmit = async (
    data: AddonFormData | UpdateAddonParams | any
  ) => {
    if (currentAddon) {
      // Edit existing
      await updateAddon(currentAddon.id, selectedRid, data);
    } else {
      // Create new
      await createAddon({
        rid: selectedRid,
        name: data.name,
        price: data.price,
        is_active: data.is_active,
      });
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  // mark Link addon to multiple inventory items
  const handleLinkItems = async (addonId: string, inventoryIds: string[]) => {
    await linkToItem(inventoryIds, addonId);

    // Refresh linked items view
    setRefreshLinkedItems((prev) => prev + 1);
  };

  const handleUnlinkItem = async (inventoryId: string) => {
    if (!selectedAddon) return;

    try {
      await unlinkFromItem(inventoryId, [selectedAddon.id]);
      // Refresh linked items view
      setRefreshLinkedItems((prev) => prev + 1);
    } catch (error) {
      console.error("Error unlinking item:", error);
    }
  };

  // Bulk operation handlers
  const handleBulkActivate = async () => {
    const addonIds = Array.from(selectedAddons);
    await bulkUpdate(addonIds, selectedRid, { is_active: 1 });
    setSelectedAddons(new Set());
  };

  const handleBulkDeactivate = async () => {
    const addonIds = Array.from(selectedAddons);
    await bulkUpdate(addonIds, selectedRid, { is_active: 0 });
    setSelectedAddons(new Set());
  };

  const handleBulkDelete = async () => {
    const addonIds = Array.from(selectedAddons);
    await bulkDelete(addonIds, selectedRid);
    setSelectedAddons(new Set());

    // Clear selection if deleting selected addon
    if (selectedAddon && selectedAddons.has(selectedAddon.id)) {
      setSelectedAddon(null);
    }
  };

  // Selection handlers
  const handleToggleSelection = (addonId: string) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAddons(new Set(addonsList.map((addon) => addon.id)));
    } else {
      setSelectedAddons(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedAddons(new Set());
  };

  return (
    <div className="w-full h-[calc(100vh-5rem)] p-3  ">
      {/* Two Column Layout */}
      <div className="flex gap-5 h-[calc(100vh-13rem)] ">
        {/* Left Column - Addon List */}
        <div className="border rounded-lg bg-card overflow-auto h-full w-[40%]">
          <AddonList
            addons={addonsList}
            selectedAddon={selectedAddon}
            selectedAddons={selectedAddons}
            onSelectAddon={setSelectedAddon}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
            onAddNew={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Right Column - Linked Items */}
        <div className="border rounded-lg bg-card overflow-auto w-[60%]">
          <LinkedItemsView
            key={refreshLinkedItems}
            selectedAddon={selectedAddon}
            onUnlinkItem={handleUnlinkItem}
            onOpenLinkDialog={handleOpenLinkDialog}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addon={currentAddon}
        onSubmit={handleFormSubmit}
        rid={selectedRid}
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
  );
}
