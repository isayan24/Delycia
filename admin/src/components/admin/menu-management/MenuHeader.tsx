import ManageMenu from "./manage-menu/main-file/ManageMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./menu-tabs";
import React from "react";
import ManageInventory from "./manage-inventory/inventory/main-file/ManageInventory";

export default function MenuHeader() {
  return (
    <section className="relative">
      <section>
        <Tabs defaultValue="menu" className="">
          <span className=" border-b  h-[4rem] bg-white fixed top-[5rem] w-full flex items-end px-5">
            <TabsList>
              <TabsTrigger value="menu" className="text-[1.1rem]">
                Manage Menu
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-[1.1rem]">
                Manage Inventory
              </TabsTrigger>
            </TabsList>
          </span>
          <TabsContent value="menu">
            {/* <div className="mt-[5rem]f w-fullg"></div> */}
            <ManageMenu />
          </TabsContent>
          <TabsContent value="inventory">
            <ManageInventory />
          </TabsContent>
        </Tabs>
      </section>
    </section>
  );
}
