import React, { useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { useItemAddonsQuery, Addon } from '@/hooks/queries/useItemAddonsQuery'
import { cn } from '@/lib/utils'

interface AddonSelectorProps {
  itemId: string
  onAddonsChange: (
    addons: (Addon & { quantity: number })[],
    total: number,
  ) => void
  selectedAddons?: (Addon & { quantity: number })[]
}

export default function AddonSelector({
  itemId,
  onAddonsChange,
  selectedAddons = [],
}: AddonSelectorProps) {
  const { data, isLoading } = useItemAddonsQuery(itemId)
  const addons = data?.addons || []

  // Handle defaults only once when addons are loaded and selection is empty
  useEffect(() => {
    if (addons.length > 0 && selectedAddons.length === 0) {
      const defaults = addons.filter((addon) => addon.is_default)
      if (defaults.length > 0) {
        const initialSelection = defaults.map((addon) => ({
          ...addon,
          quantity: 1,
        }))
        const total = initialSelection.reduce(
          (sum, addon) => sum + addon.price * 1,
          0,
        )
        // Set defaults without triggering a loop (check if already set handled by dependency)
        // Since selectedAddons is empty (checked above), this is safe to call once.
        onAddonsChange(initialSelection, total)
      }
    }
    // We only want to run this when addons load.
    // If we include selectedAddons, it might re-run if user clears selection.
    // Ideally we want to run this only ONCE per item load.
    // But checking selectedAddons.length === 0 is a reasonable heuristic for "first load".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addons]) // Only run when addons array changes (loaded)

  const updateQuantity = (addonId: number, delta: number) => {
    // Find current addon in selectedAddons
    const current = selectedAddons.find((a) => a.id === addonId)
    const currentQty = current?.quantity || 0
    const newQty = Math.max(0, Math.min(10, currentQty + delta))

    let newSelected: (Addon & { quantity: number })[]

    if (newQty === 0) {
      // Remove
      newSelected = selectedAddons.filter((a) => a.id !== addonId)
    } else {
      if (current) {
        // Update
        newSelected = selectedAddons.map((a) =>
          a.id === addonId ? { ...a, quantity: newQty } : a,
        )
      } else {
        // Add new (shouldn't happen via this handler usually)
        const addon = addons.find((a) => a.id === addonId)
        if (addon) {
          newSelected = [...selectedAddons, { ...addon, quantity: newQty }]
        } else {
          newSelected = selectedAddons
        }
      }
    }

    const total = newSelected.reduce((sum, a) => sum + a.price * a.quantity, 0)
    onAddonsChange(newSelected, total)
  }

  const toggleAddon = (addonId: number) => {
    const isSelected = selectedAddons.some((a) => a.id === addonId)
    let newSelected: (Addon & { quantity: number })[]

    if (isSelected) {
      // Deselect
      newSelected = selectedAddons.filter((a) => a.id !== addonId)
    } else {
      // Select with qty 1
      const addon = addons.find((a) => a.id === addonId)
      if (addon) {
        newSelected = [...selectedAddons, { ...addon, quantity: 1 }]
      } else {
        newSelected = selectedAddons
      }
    }

    const total = newSelected.reduce((sum, a) => sum + a.price * a.quantity, 0)
    onAddonsChange(newSelected, total)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (addons.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Add-ons</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {addons.map((addon) => {
          const selectedItem = selectedAddons.find((a) => a.id === addon.id)
          const qty = selectedItem?.quantity || 0
          const isSelected = qty > 0

          return (
            <div
              key={addon.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer',
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200',
              )}
              onClick={() => toggleAddon(addon.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleAddon(addon.id)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{addon.name}</span>
                  <span className="text-xs text-gray-500">
                    {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 rounded-lg border-gray-200 hover:bg-white hover:text-orange-600"
                    onClick={() => updateQuantity(addon.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-semibold w-4 text-center">
                    {qty}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 rounded-lg border-gray-200 hover:bg-white hover:text-orange-600"
                    onClick={() => updateQuantity(addon.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
