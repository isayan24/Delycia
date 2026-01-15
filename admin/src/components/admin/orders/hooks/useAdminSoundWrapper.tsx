import React from "react";
import UseSoundOnPending from "./useSoundOnPending";
import { usePathname } from "@/hooks/usePathname";

interface UseAdminSoundWrapperProps {
  pendingOrdersCount: number;
}

export default function UseAdminSoundWrapper({
  pendingOrdersCount,
}: UseAdminSoundWrapperProps) {
  const pathname = usePathname();
  return !pathname.startsWith("/login") ? (
    <UseSoundOnPending pendingOrdersCount={pendingOrdersCount} />
  ) : null;
}
