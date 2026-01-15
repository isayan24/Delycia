import React from 'react'
import { TopButtons } from '../navigation/TopButtons'
import { MenuContent } from './MenuContent'
import { useMenuStore } from '@/store/useMenuStore'

export default function ManageMenu() {
  const { highlightItem, navigateToItem } = useMenuStore()

  const handleSearch = (query: string) => {
    // Add search logic here if needed
    console.log('Search query:', query)
  }

  const handleSubmit = () => {
    // Add submit logic here if needed
    console.log('Submit changes')
  }

  return (
    <div className="w-full h-[calc(100vh-9rem)] rounded-2xl mt-[4rem]">
      <TopButtons
        onSearch={handleSearch}
        onSubmit={handleSubmit}
        onHighlightItem={highlightItem}
        onNavigateToItem={navigateToItem}
      />
      <section className="border p-5 h-[calc(100vh-12.5rem)]">
        <MenuContent />
      </section>
    </div>
  )
}
