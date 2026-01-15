'use client';
import React from "react";
import CategorySIdebarSmall from "./CategorySIdebarSmall";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";


export default function CategoryWrapper() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (pathname.endsWith("/category") || !isMobile) {
    return null;
  }

  return (
    <div className="ml-[4rem]">
      <CategorySIdebarSmall />
    </div>
  );
}
