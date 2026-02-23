import { ChevronRight, type LucideIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link, useRouterState } from '@tanstack/react-router'
import React from 'react'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    color?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavMainItem({
  item,
}: {
  item: {
    title: string
    url: string
    icon: LucideIcon
    color?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }
}) {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const [open, setOpen] = React.useState(item.isActive)

  // Find the most specific match across sub-items
  const bestMatchUrl = React.useMemo(() => {
    const allUrls = [item.url, ...(item.items?.map((sub) => sub.url) || [])]
    const matches = allUrls.filter(
      (url) => pathname === url || pathname.startsWith(url + '/'),
    )
    return matches.reduce(
      (prev, curr) => (curr.length > prev.length ? curr : prev),
      '',
    )
  }, [item, pathname])

  // Sync open state with isActive, but allow manual toggle
  React.useEffect(() => {
    if (item.isActive) {
      setOpen(true)
    }
  }, [item.isActive])

  return (
    <Collapsible key={item.title} asChild open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={item.url === bestMatchUrl}
        >
          <Link
            to={item.url}
            activeProps={{
              'data-active': true,
            }}
            activeOptions={{ exact: true }}
          >
            <item.icon className={item.color} />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={subItem.url === bestMatchUrl}
                    >
                      <Link
                        to={subItem.url}
                        activeProps={{
                          'data-active': true,
                        }}
                        activeOptions={{ exact: true }}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  )
}
