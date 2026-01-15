import React from "react";
import {
  SidebarMenu,
  SidebarMenuSubItem,
  SidebarMenuSub,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { CollapsibleTrigger } from "../../ui/collapsible";
import { CollapsibleContent } from "../../ui/collapsible";
import { ChevronDown, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "@/hooks/usePathname";

export default function CollapsableCategory({
  isActive,
  categories,
}: {
  isActive: boolean;
  categories: { title: string; url: string }[];
}) {
  const pathname = usePathname();

  console.log(pathname, "pathname");

  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={` ${isActive ? "border-r-4 border-[#c77b00] text-[#c77b00] hover:text-[#c77b00] bg-gradient-to-r from-transparent to-[#ffeed1] rounded-[3px] " : " hover:bg-gradient-to-r hover:from-[#ffffff] hover:to-[#e7e2da]"} pl-1 py-[5px]`}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton asChild tooltip="Category">
            <span>
              <Link href="/category" className="flex items-center gap-2 ">
                <Settings2
                  className={`${isActive ? "text-[#c77b00]" : ""} w-[1.1rem] h-[1.1rem]`}
                />
              </Link>
              <Link
                href="/category"
                className={`${isActive ? "text-[#c77b00]" : ""} w-full flex items-center gap-2 text-nowrap min-[700px]:text-[1rem]`}
              >
                Category
              </Link>
              <ChevronDown
                className={`${isActive ? "text-[#c77b00]" : ""} ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180`}
              />
            </span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub>
          {categories.map((category: any) => (
            <SidebarMenuSubItem
              className={`${pathname === `/category/${category.name.toLowerCase()}` ? "border-r-4 border-[#c77b00] bg-gradient-to-r from-transparent to-[#ffeed1] rounded-[3px]" : "rounded-[3px] hover:bg-gradient-to-r hover:from-[#ffffff] hover:to-[#e7e2da]"}`}
              key={category.id}
            >
              <SidebarMenuButton asChild>
                <Link href={`/category/${category.name.toLowerCase()}`}>
                  <span
                    className={`${pathname === category.name.toLowerCase() ? "text-[#c77b00]" : ""} text-nowrap min-[700px]:text-[1rem]`}
                  >
                    {category.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenu>
  );
}
