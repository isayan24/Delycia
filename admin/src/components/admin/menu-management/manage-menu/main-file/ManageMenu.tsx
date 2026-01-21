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
    <div className="w-full h-full flex flex-col gap-4">
      <TopButtons
        onSearch={handleSearch}
        onSubmit={handleSubmit}
        onHighlightItem={highlightItem}
        onNavigateToItem={navigateToItem}
      />
      <section className="flex-1 min-h-0 border rounded-xl bg-white shadow-sm p-4 overflow-hidden">
        <MenuContent />
      </section>
    </div>
  )
}
