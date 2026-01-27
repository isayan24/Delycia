'use client'
import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react'
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from '../ui/breadcrumb'
import { usePathname } from '@/lib/next-compat'
import Link from '@/lib/next-compat'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'

export default function BreadCrumbComponent() {
  const pathname = usePathname()
  const [pathArray, setPathArray] = useState<string[]>([])
  const { categories } = useCategoriesQuery()

  // Removed manual fetch

  useEffect(() => {
    setPathArray(pathname.split('/').slice(1))
  }, [pathname])

  return (
    <Breadcrumb className="text-nowrap">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" passHref legacyBehavior>
            <BreadcrumbLink
              className={`${pathname === '/' ? 'text-primary' : ''}`}
            >
              Home
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        {pathArray.map((path, index) => {
          const currentPath = `/${pathArray.slice(0, index + 1).join('/')}`
          return (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {path === 'category' ? (
                  <DropdownMenu>
                    <Link href="/category" passHref legacyBehavior>
                      <BreadcrumbLink
                        className={`${pathname === '/category' ? 'text-primary' : ''}`}
                      >
                        Category
                      </BreadcrumbLink>
                    </Link>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <ChevronDown />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {categories.map((item) => (
                        <DropdownMenuItem key={item?.name}>
                          <Link
                            href={'/category/' + item?.name.toLowerCase()}
                            passHref
                            legacyBehavior
                          >
                            <BreadcrumbLink>{item?.name}</BreadcrumbLink>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href={currentPath} passHref legacyBehavior>
                    <BreadcrumbLink
                      className={`${pathname === currentPath ? 'text-primary' : ''}`}
                    >
                      <>{path.charAt(0).toUpperCase() + path.slice(1)}</>
                    </BreadcrumbLink>
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
