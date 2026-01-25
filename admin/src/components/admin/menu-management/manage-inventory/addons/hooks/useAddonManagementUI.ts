import { useState, useCallback } from 'react'
import type { Addon } from '@/api/types/addons.types'

export function useAddonManagementUI(addons: Addon[] = []) {
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null)
  const [refreshLinkedItems, setRefreshLinkedItems] = useState(0)

  // Selection handlers
  const handleToggleSelection = useCallback((addonId: string) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(addonId)) {
        newSet.delete(addonId)
      } else {
        newSet.add(addonId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedAddons(new Set(addons.map((addon) => addon.id)))
      } else {
        setSelectedAddons(new Set())
      }
    },
    [addons],
  )

  const handleClearSelection = useCallback(() => {
    setSelectedAddons(new Set())
  }, [])

  // Dialog handlers
  const handleCreate = useCallback(() => {
    setCurrentAddon(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((addon: Addon) => {
    setCurrentAddon(addon)
    setDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((addon: Addon) => {
    setAddonToDelete(addon)
    setDeleteConfirmOpen(true)
  }, [])

  const handleOpenLinkDialog = useCallback(() => {
    setLinkDialogOpen(true)
  }, [])

  const triggerLinkedItemsRefresh = useCallback(() => {
    setRefreshLinkedItems((prev) => prev + 1)
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false)
    setAddonToDelete(null)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
  }, [])

  return {
    // State
    selectedAddon,
    selectedAddons,
    dialogOpen,
    linkDialogOpen,
    currentAddon,
    deleteConfirmOpen,
    addonToDelete,
    refreshLinkedItems,

    // Setters (exposed nicely)
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
  }
}
