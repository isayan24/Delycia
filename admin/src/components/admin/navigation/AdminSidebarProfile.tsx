import { BadgeCheck, Bell, ChevronsUpDown, LogOut, LogIn } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Link } from '@tanstack/react-router'

export function AdminSidebarProfile({
  user,
}: {
  user: {
    name: string
    // email: string;
    avatar: string
  }
}) {
  const { logout, accessToken, getValidAccessToken } = useAuth()

  const { isMobile } = useSidebar()

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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                {/* <span className="truncate text-xs">{user.email}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  {/* <span className="truncate text-xs">{user.email}</span> */}
                </div>
              </div>
            </DropdownMenuLabel>

            {/* Get the user id and pass to the route */}
            <DropdownMenuGroup>
              <Link to={`/users/p`}>
                <div className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                  <BadgeCheck className="w-4 h-4" />
                  Account
                </div>
              </Link>

              {/* <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {accessToken ? (
              <div
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={async () => {
                  await logout()
                  window.location.href = `${window.location.origin}/login`
                }}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </div>
            ) : (
              <Link to="/login">
                <div className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </div>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
