'use client'
'use client'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
import Link from '@/lib/next-compat'
import { usePathname } from '@/lib/next-compat'
import React from 'react'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'

interface Category {
  id: string | number
  name: string
  img: string
}

export default function CategorySIdebarSmall() {
  const { categories: category } = useCategoriesQuery()
  const pathname = usePathname()

  // Removed manual fetch

  const isActiveLink = (categoryName: any) => {
    const categoryPath = `/category/${categoryName.toLowerCase()}`
    return pathname === categoryPath
  }

  return (
    <div
      style={{ scrollbarWidth: 'none', boxShadow: '-4px 0px 6px #000' }}
      className="h-[100vh] w-[4.2rem] fixed top-0 left-0 bg-white flex flex-col items-center gap-3 py-5 overflow-hidden 
      transition-all duration-300 ease-in-out 
      "
    >
      {category.map((cat) => (
        <Link
          href={`/category/${cat.name.toLowerCase()}`}
          key={cat.id}
          className={`flex flex-col items-center gap-1 cursor-pointer relative select-none ${isActiveLink(cat.name) ? 'text-orange-600 scale-100' : 'scale-95'} w-[75%] transition-all duration-300 ease-in-out`}
        >
          {isActiveLink(cat.name) && (
            <span className="absolute z-10 -right-[.52rem] top-0 bottom-0 w-[.25rem] bg-orange-500 rounded-l-full"></span>
          )}
          <div className="rounded-full h-[3rem] w-[3rem]">
            <UseOptimizeImage
              src={cat.img}
              alt={cat.name}
              width={100}
              height={100}
              rounded="rounded-full"
              className="rounded-full"
            />
          </div>
          <span className="text-xs text-center">{cat.name}</span>
        </Link>
      ))}
    </div>
  )
}
