"use client";

import { BadgeCheck, ChevronsUpDown, LogOut, LogIn } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthProvider";
import { useLoginDialogStore } from "@/store/useLoginDialogStore";

export function NavUser({
  user: navUser,
}: {
  user: {
    name: string;
    // email: string;
    avatar: string;
  };
}) {
  const { user: authUser, logout, isAuthenticated } = useAuthContext();
  const { openLoginDialog } = useLoginDialogStore();

  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={navUser.avatar} alt={navUser.name} />
                <AvatarFallback className="rounded-lg">
                  {navUser.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{navUser.name}</span>
                {/* <span className="truncate text-xs">{navUser.email}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={navUser.avatar} alt={navUser.name} />
                  <AvatarFallback className="rounded-lg">
                    {navUser.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{navUser.name}</span>
                  {/* <span className="truncate text-xs">{authUser?.phone_number}</span> */}
                </div>
              </div>
            </DropdownMenuLabel>

            {/* Get the user id and pass to the route */}
            <DropdownMenuGroup>
              <Link
                onClick={() => {
                  if (!isAuthenticated) openLoginDialog();
                }}
                href={isAuthenticated ? "/user/p" : "#"}
              >
                <div className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                  <BadgeCheck className="w-4 h-4" />
                  Account
                </div>
              </Link>
              {/* <div>
                <Bell />
                Notifications
              </div> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {isAuthenticated ? (
              <div
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => {
                  logout();
                }}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </div>
            ) : (
              <div
                onClick={openLoginDialog}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
