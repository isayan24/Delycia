import React, { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { useItemAddonsQuery } from '@/hooks/queries/useItemAddonsQuery'

interface Addon {
  id: number
  name: string
  price: number
  is_veg: number
  max_quantity?: number
  is_default?: number
}

interface AddonSelectionProps {
  itemId: string
  itemName: string
  itemPrice: number
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedAddons: Addon[]) => void
}

export default function AddonSelection({
  itemId,
  itemName,
  itemPrice,
  isOpen,
  onClose,
  onConfirm,
}: AddonSelectionProps) {
  const [selectedAddons, setSelectedAddons] = useState<Set<number>>(new Set())

  // Clean itemId to get the real inventory id if it's a variant
  const realItemId = useMemo(() => {
    if (typeof itemId === 'string' && itemId.includes('_variant_')) {
      return itemId.split('_variant_')[0]
    }
    return itemId
  }, [itemId])

  const { data: addonsData, isLoading } = useItemAddonsQuery(realItemId)

  const addons: Addon[] = addonsData?.addons || []

  // Pre-select default addons
  useEffect(() => {
    if (addons.length > 0 && selectedAddons.size === 0) {
      const defaults = new Set<number>()
      addons.forEach((addon) => {
        if (addon.is_default) {
          defaults.add(addon.id)
        }
      })
      if (defaults.size > 0) {
        setSelectedAddons(defaults)
      }
    }
  }, [addons])

  // Reset selection when modal closes or item changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAddons(new Set())
    }
  }, [isOpen])

  const toggleAddon = (addonId: number) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(addonId)) {
        newSet.delete(addonId)
      } else {
        newSet.add(addonId)
      }
      return newSet
    })
  }

  const handleConfirm = () => {
    const selected = addons.filter((addon) => selectedAddons.has(addon.id))
    onConfirm(selected)
  }

  const calculateTotal = () => {
    const addonsTotal = addons
      .filter((addon) => selectedAddons.has(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0)
    return itemPrice + addonsTotal
  }

  // If no addons are available (and not loading), we might want to skip this modal?
  // But for now, user might want to see that there are no addons.
  // Optimization: Component could notify parent to skip if addons.length === 0,
  // but that requires fetching before showing.
  // Simpler: Show modal, saying "No key addons available" if empty.

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {itemName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : addons.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No addons available for this item.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500">Add-ons</h4>
              <div className="grid gap-3">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedAddons.has(addon.id)}
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <label
                        htmlFor={`addon-${addon.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {addon.name}
                      </label>
                    </div>
                    <div className="text-sm font-semibold">
                      {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Add to Order • ₹{calculateTotal().toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
