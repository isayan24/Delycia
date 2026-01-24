import React, { useEffect, useState, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Minus, Plus } from 'lucide-react'
import { useItemAddonsQuery } from '@/hooks/queries/useItemAddonsQuery'

interface Addon {
  id: number
  name: string
  price: number
  is_veg: number
  max_quantity?: number
  is_default?: number
  quantity?: number
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
  const [addonQuantities, setAddonQuantities] = useState<
    Record<number, number>
  >({})
  const hasAutoConfirmed = useRef(false)

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
    if (addons.length > 0 && Object.keys(addonQuantities).length === 0) {
      const defaults: Record<number, number> = {}
      addons.forEach((addon) => {
        if (addon.is_default) {
          defaults[addon.id] = 1
        }
      })
      if (Object.keys(defaults).length > 0) {
        setAddonQuantities(defaults)
      }
    }
  }, [addons])

  // Reset selection when modal closes or item changes
  useEffect(() => {
    if (!isOpen) {
      setAddonQuantities({})
      hasAutoConfirmed.current = false
    }
  }, [isOpen])

  // Auto-confirm if no addons available
  useEffect(() => {
    if (
      isOpen &&
      !isLoading &&
      addons.length === 0 &&
      !hasAutoConfirmed.current
    ) {
      hasAutoConfirmed.current = true
      onConfirm([])
    }
  }, [isOpen, isLoading, addons, onConfirm])

  const updateQuantity = (addonId: number, delta: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0
      const newQty = Math.max(0, Math.min(10, currentQty + delta)) // Max 10

      if (newQty === 0) {
        const { [addonId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [addonId]: newQty }
    })
  }

  const toggleAddon = (addonId: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0
      if (currentQty > 0) {
        const { [addonId]: _, ...rest } = prev
        return rest
      } else {
        return { ...prev, [addonId]: 1 }
      }
    })
  }

  const handleConfirm = () => {
    const selected = addons
      .filter((addon) => (addonQuantities[addon.id] || 0) > 0)
      .map((addon) => ({
        ...addon,
        quantity: addonQuantities[addon.id],
      }))
    onConfirm(selected)
  }

  const calculateTotal = () => {
    const addonsTotal = addons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0
      return sum + addon.price * qty
    }, 0)
    return itemPrice + addonsTotal
  }

  // If auto-confirming, don't show content
  if (isOpen && !isLoading && addons.length === 0) {
    return null
  }

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
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500">Add-ons</h4>
              <div className="grid gap-3">
                {addons.map((addon) => {
                  const qty = addonQuantities[addon.id] || 0
                  const isSelected = qty > 0

                  return (
                    <div
                      key={addon.id}
                      className={`flex items-center justify-between space-x-2 border rounded-lg p-3 transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border-primary/20'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={(e) => {
                        // Prevent toggling if clicking on buttons
                        if (
                          (e.target as HTMLElement).closest('button') ||
                          (e.target as HTMLElement).closest('.stop-propagation')
                        )
                          return
                        toggleAddon(addon.id)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`addon-${addon.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleAddon(addon.id)}
                          className="stop-propagation"
                        />
                        <div className="flex flex-col">
                          <label
                            htmlFor={`addon-${addon.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {addon.name}
                          </label>
                          <span className="text-xs text-muted-foreground mt-1">
                            {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <div className="flex items-center gap-2 stop-propagation">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateQuantity(addon.id, -1)
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-4 text-center">
                              {qty}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateQuantity(addon.id, 1)
                              }}
                              disabled={qty >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="text-sm font-semibold w-16 text-right">
                          {addon.price * qty > 0
                            ? `+₹${addon.price * qty}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
