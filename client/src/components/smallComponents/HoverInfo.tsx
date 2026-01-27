"use client";
import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export default function HoverInfo({className}:{className?:string}) {
  const infoBtnUI =
    " border rounded-full p-1 bg-white border-black bottom-2 left-2 ";

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Info className={`${infoBtnUI} ${className}`} />
      </HoverCardTrigger>
      <HoverCardContent>Info About The Food</HoverCardContent>
    </HoverCard>
  );
}
