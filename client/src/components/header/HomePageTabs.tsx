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
        className={`w-full rounded-none justify-start bg-transparent py-[.2rem] gap-3 px-3 min-[700px]:hidden
          transition-all duration-300 ease-in-out ${showImage && 'text-[#52525b]'}
          `}
      >
        <TabsTrigger
          value="All"
          className="max-[700px]:p-1 flex items-center gap-1 max-[700px]:flex-col !bg-transparent justify-center"
          onClick={scrollToTop}
        >
          <div className="w-9 h-9 overflow-hidden rounded-full">
            <img
              src={allFood}
              alt="All Food"
              className="h-full w-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <span className="max-[700px]:mb-1 transition-all duration-300 ease-in-out">
            All
          </span>
        </TabsTrigger>
        {category.map((link: any) => (
          <TabsTrigger
            key={link.id}
            value={link.name}
            className="max-[700px]:py-0 max-[700px]:p-1 flex items-center gap-1 max-[700px]:flex-col !bg-transparent"
            onClick={scrollToTop}
          >
            <div className="w-9 h-9 overflow-hidden rounded-full">
              <UseOptimizeImage
                src={link.img}
                alt={link.name}
                rounded="rounded-full"
                width={40}
                height={40}
              />
            </div>
            <span className="max-[700px]:mb-1 transition-all duration-300 ease-in-out">
              {link.name}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  )
})

export default HomePageTabs
