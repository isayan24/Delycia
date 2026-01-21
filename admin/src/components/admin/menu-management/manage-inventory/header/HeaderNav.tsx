import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../menu-tabs'
import InventoryCategoryParent from '../inventory/inventory-category/InventoryCategoryParent'
import AddonMain from '../addons/AddonMain'

export default function HeaderNav() {
  return (
    <section className="h-full flex flex-col">
      <Tabs defaultValue="dishes" className="h-full flex flex-col">
        <div className="border-b px-5 pt-2">
          <TabsList>
            <TabsTrigger value="dishes" className="text-[1.1rem]">
              Dishes
            </TabsTrigger>
            <TabsTrigger value="addons" className="text-[1.1rem]">
              Add Ons
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="dishes"
          className="flex-1 min-h-0 overflow-auto p-0 m-0 data-[state=inactive]:hidden"
        >
          <InventoryCategoryParent />
        </TabsContent>
        <TabsContent
          value="addons"
          className="flex-1 min-h-0 overflow-auto p-0 m-0 data-[state=inactive]:hidden"
        >
          <AddonMain />
        </TabsContent>
      </Tabs>
    </section>
  )
}
