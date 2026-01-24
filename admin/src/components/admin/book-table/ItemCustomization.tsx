import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import AddonSelector from '@/components/admin/quick-bill/AddonSelector'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Item, Variant } from '@/types/menu.types'

interface ItemCustomizationProps {
  item: Item
  variants: Variant[]
  onAddItem: (item: Item, variant?: Variant, addons?: any[]) => void
  children: React.ReactNode
}

export default function ItemCustomization({
  item,
  variants,
  onAddItem,
  children,
}: ItemCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 500px)')

  // Prepare display variants
  const displayVariants = [
    {
      id: 'original_full',
      name: 'Full',
      price: item.price,
      inventory_id: item.id,
    },
    ...variants,
  ]

  const handleAdd = (addons: any[], selectedVariant?: any) => {
    if (selectedVariant && selectedVariant.id === 'original_full') {
      onAddItem(item, undefined, addons)
    } else {
      onAddItem(item, selectedVariant, addons)
    }
    setIsOpen(false)
  }

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          className="p-0 w-auto"
          align="end"
          side="left"
          sideOffset={10}
        >
          <AddonSelector
            className="w-[300px]"
            originalItemId={item.id}
            basePrice={item.price}
            variants={displayVariants}
            onAdd={handleAdd}
            onCancel={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="hidden">Customize Item</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pt-2">
          <AddonSelector
            className="w-full"
            originalItemId={item.id}
            basePrice={item.price}
            variants={displayVariants}
            onAdd={handleAdd}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
