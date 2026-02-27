import React, { memo } from 'react'
import { TabsList, TabsTrigger } from '../ui/tabs'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
import allFood from '../../../public/allFood.png'

const HomePageTabs = memo(function HomePageTabs({ category, showImage }: any) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* mark Mobile tabs - existing design */}
      <TabsList
        className={`w-full rounded-none justify-start bg-transparent py-2 gap-2 px-4 min-[700px]:hidden overflow-x-auto no-scrollbar
          transition-all duration-300 ease-in-out ${showImage ? 'text-zinc-600' : 'text-gray-900'}
          `}
      >
        <TabsTrigger
          value="All"
          className="flex flex-col items-center gap-1.5 p-1 bg-transparent! min-w-[64px] max-w-[72px] shrink-0 group"
          onClick={scrollToTop}
        >
          <div className="w-11 h-11 overflow-hidden rounded-full transition-transform duration-300 group-data-[state=active]:scale-110">
            <img
              src={allFood}
              alt="All Food"
              className="h-full w-full object-cover"
              width={44}
              height={44}
            />
          </div>
          <span className="text-[10px] font-medium leading-tight text-center whitespace-normal line-clamp-2 transition-all duration-300 group-data-[state=active]:text-orange-600 group-data-[state=active]:font-bold">
            All Items
          </span>
        </TabsTrigger>
        {category.map((link: any) => (
          <TabsTrigger
            key={link.id}
            value={link.name}
            className="flex flex-col items-center gap-1.5 p-1 bg-transparent! min-w-[64px] max-w-[72px] shrink-0 group"
            onClick={scrollToTop}
          >
            <div className="w-11 h-11 overflow-hidden rounded-full transition-transform duration-300 group-data-[state=active]:scale-110">
              <UseOptimizeImage
                src={link.img}
                alt={link.name}
                rounded="rounded-full"
                width={44}
                height={44}
                className="object-cover"
              />
            </div>
            <span className="text-[10px] font-medium leading-tight text-center whitespace-normal line-clamp-2 transition-all duration-300 group-data-[state=active]:text-orange-600 group-data-[state=active]:font-bold">
              {link.name}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  )
})

export default HomePageTabs
