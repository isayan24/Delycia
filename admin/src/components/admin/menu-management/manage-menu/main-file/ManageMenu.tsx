import React from 'react'
import { TopButtons } from '../navigation/TopButtons'
import { MenuContent } from './MenuContent'
import { useMenuStore } from '@/store/useMenuStore'

export default function ManageMenu() {
  const { highlightItem, navigateToItem } = useMenuStore()

  const handleSearch = (query: string) => {
    // Add search logic here if needed
  }

  const handleSubmit = () => {
    // Add submit logic here if needed
  }

  return (
    <div className="w-full h-fulls h-[calc(100vh-6rem)] flex flex-col gap-2 md:gap-2">
      <TopButtons
        onSearch={handleSearch}
        onSubmit={handleSubmit}
        onHighlightItem={highlightItem}
        onNavigateToItem={navigateToItem}
      />
      <section className="flex-1 min-h-0 md:borderd md:rounded-xl bg-white md:shadow-sm p-0 md:p-2 overflow-hidden">
        <MenuContent />
      </section>
    </div>
  )
}
