import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Minus, Plus } from 'lucide-react'
import { useItemAddonsQuery } from '@/hooks/queries/useItemAddonsQuery'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Variant } from '@/types/menu.types'
import { cn } from '@/lib/utils'

interface AddonType {
  id: number
  name: string
  price: number
  is_veg: number
  max_quantity?: number
  is_default?: number
  quantity?: number
}

interface AddonSelectorProps {
  originalItemId: string
  basePrice: number
  variants?: Variant[]
  onAdd: (addons: AddonType[], variant?: Variant) => void
  onCancel: () => void
  className?: string
}

export default function AddonSelector({
  originalItemId,
  basePrice,
  variants = [],
  onAdd,
  onCancel,
  className,
}: AddonSelectorProps) {
  const [addonQuantities, setAddonQuantities] = useState<
    Record<number, number>
  >({})
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    variants.length > 0 ? variants[0] : undefined,
  )

  const { data: addonsData, isLoading } = useItemAddonsQuery(originalItemId)
  const addons: AddonType[] = addonsData?.addons || []

  // Update selected variant if variants prop changes
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0])
    }
  }, [variants, selectedVariant])

  // Pre-select defaults
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

  const updateQuantity = (addonId: number, delta: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0
      const newQty = Math.max(0, Math.min(10, currentQty + delta))

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

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const selected = addons
      .filter((addon) => (addonQuantities[addon.id] || 0) > 0)
      .map((addon) => ({
        ...addon,
        quantity: addonQuantities[addon.id],
      }))

    onAdd(selected, selectedVariant)
  }

  const calculateTotal = () => {
    const itemPrice = selectedVariant ? selectedVariant.price : basePrice
    const addonsTotal = addons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0
      return sum + addon.price * qty
    }, 0)
    return itemPrice + addonsTotal
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div
      className="w-[300px] flex flex-col gap-3 p-1 max-[768px]:w-full border border-amber-300 rounded-md bg-amber-50/40"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-1">
        <h4 className="font-semibold text-sm">Customize Item</h4>
      </div>

      {/* Variant Selection */}
      {variants.length > 0 && (
        <div className="px-1 space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Size
          </span>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`
                            border rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all flex items-center gap-2
                            ${
                              selectedVariant?.id === variant.id
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-slate-50 border-slate-200'
                            }
                        `}
                onClick={() => setSelectedVariant(variant)}
              >
                <span>{variant.name}</span>
                <span
                  className={
                    selectedVariant?.id === variant.id
                      ? 'opacity-90'
                      : 'text-primary'
                  }
                >
                  ₹{variant.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="h-[200px] pr-3 -mr-3">
        {addons.length > 0 ? (
          <div className="space-y-2 pr-1">
            {/* Optional divider if variants exist */}
            {variants.length > 0 && <div className="h-px bg-slate-100 my-2" />}

            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Add-ons
            </span>

            {addons.map((addon) => {
              const qty = addonQuantities[addon.id] || 0
              const isSelected = qty > 0
              return (
                <div
                  key={addon.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleAddon(addon.id)}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAddon(addon.id)}
                      className="h-4 w-4 shrink-0 transition-transform active:scale-95"
                    />
                    <div className="flex flex-col truncate">
                      <span className="font-medium truncate">{addon.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="flex items-center gap-1.5 ml-2 animate-in fade-in zoom-in-50 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-md shadow-sm"
                        onClick={() => updateQuantity(addon.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-4 text-center font-semibold text-xs">
                        {qty}
                      </span>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-md shadow-sm"
                        onClick={() => updateQuantity(addon.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs h-full flex items-center justify-center">
            No addons available
          </div>
        )}
      </ScrollArea>

      <div className="pt-2 border-t mt-1 flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="flex-[2]" onClick={handleAdd}>
          Add • ₹{calculateTotal()}
        </Button>
      </div>
    </div>
  )
}
