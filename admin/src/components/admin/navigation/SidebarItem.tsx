import React from 'react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../ui/sidebar'
import { Link } from '@tanstack/react-router'
import { LucideIcon } from 'lucide-react'

export default function SidebarItem({
  title,
  url,
  icon: Icon,
  isActive,
  className,
}: {
  title: string
  url?: any
  icon?: LucideIcon
  isActive?: boolean
  className?: string
}) {
  return (
    <SidebarMenu
      key={title}
      // asChild
      // defaultOpen={isActive}
      className={`group/collapsible ${className}`}
    >
      <SidebarMenuItem
        className={`${isActive ? '!border-r-4 !border-[#c77b00] !bg-gradient-to-r !from-transparent !to-[#ffeed1] !rounded-none ' : 'hover:!bg-gradient-to-r hover:!from-[#ffffff] hover:!to-[#e7e2da]'} !rounded-[3px] !p-0 !w-full !py-[5px]`}
      >
        <Link to={url} className="!w-full">
          <SidebarMenuButton tooltip={title} className="!w-full">
            <div className="!flex !items-center !gap-2 !ml-1">
              {Icon && (
                <Icon
                  height={20}
                  width={20}
                  className={`${isActive ? '!text-[#c77b00]' : ''} !w-[1.1rem] !h-[1.1rem] min-[700px]:!w-[1.2rem] min-[700px]:!h-[1.2rem]`}
                />
              )}
              <span
                className={`${isActive ? '!text-[#c77b00]' : ''} min-[700px]:!text-[1rem] text-nowrap`}
              >
                {title}
              </span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
