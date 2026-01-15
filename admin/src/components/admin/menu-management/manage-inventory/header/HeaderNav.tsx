import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../menu-tabs";
import InventoryCategoryParent from "../inventory/inventory-category/InventoryCategoryParent";
import AddonMain from "../addons/AddonMain";

export default function HeaderNav() {
  return (
    <section>
      <section>
        <Tabs defaultValue="dishes" className="">
          {/* <Separator className='!w-[97%] mx-auto'/> */}
          <section className=" border-b h-[3rem] w-full flex items-end px-5">
            <TabsList>
              <TabsTrigger value="dishes" className="text-[1.1rem]">
                Dishes
              </TabsTrigger>
              <TabsTrigger value="addons" className="text-[1.1rem]">
                Add Ons
              </TabsTrigger>
            </TabsList>
          </section>
          <TabsContent
            value="dishes"
            className="overflow-auto !max-h-[calc(100vh-16rem)]"
          >
            <InventoryCategoryParent />
          </TabsContent>
          <TabsContent value="addons">
            <AddonMain />
          </TabsContent>
        </Tabs>
      </section>
    </section>
  );
}
