import React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import RouteBreadcrumbs from '@/components/common/RouteBreadcrumbs'
import { RestaurantActiveToggle } from './RestaurantActiveToggle'
import { NotificationBell } from '@/components/common/NotificationBell'

export const AdminHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 transition-colors" />
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
        <RouteBreadcrumbs />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden sm:flex items-center">
          <RestaurantActiveToggle />
        </div>
        <div className="h-8 w-px bg-gray-100 hidden sm:block" />
        <NotificationBell />
      </div>
    </header>
  )
}

export default AdminHeader
