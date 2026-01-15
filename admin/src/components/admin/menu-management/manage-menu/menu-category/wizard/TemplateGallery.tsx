import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  AlertCircle,
  ArrowLeft,
  CheckSquare,
  Square,
} from 'lucide-react'
import { CategoryTemplate } from './types/wizardTypes'
// import { getTemplatesByCuisine } from "@/helpers/categories/fetchCategories"; // OLD - Replaced
import { useTemplatesByCuisineQuery } from '@/hooks/queries' // NEW - TanStack Query
import TemplateCard from './TemplateCard'
import TemplatePreviewModal from './TemplatePreviewModal'

interface TemplateGalleryProps {
  cuisine: string
  selectedTemplates: Set<number>
  onToggle: (templateId: number) => void
  onSelectAll: (templateIds: number[]) => void
  onDeselectAll: () => void
  onBack: () => void
}

export default function TemplateGallery({
  cuisine,
  selectedTemplates,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onBack,
}: TemplateGalleryProps) {
  // NEW - Use TanStack Query 🚀
  const {
    data: templates = [],
    isLoading: loading,
    error,
    refetch,
  } = useTemplatesByCuisineQuery(cuisine)

  const [filteredTemplates, setFilteredTemplates] = useState<
    CategoryTemplate[]
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] =
    useState<CategoryTemplate | null>(null)

  useEffect(() => {
    // Filter templates based on search query
    if (searchQuery.trim()) {
      const filtered = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
      setFilteredTemplates(filtered)
    } else {
      setFilteredTemplates(templates)
    }
  }, [searchQuery, templates])

  const allSelected =
    filteredTemplates.length > 0 &&
    filteredTemplates.every((t) => selectedTemplates.has(t.id))

  const handleToggleAll = () => {
    if (allSelected) {
      onDeselectAll()
    } else {
      onSelectAll(filteredTemplates.map((t) => t.id))
    }
  }

  if (loading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cuisines
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Templates
        </h3>
        <p className="text-gray-600 mb-4">Failed to load templates</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={onBack} variant="outline">
            Back to Cuisines
          </Button>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Templates Available
        </h3>
        <p className="text-gray-600 mb-4">
          No templates found for {cuisine} cuisine.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cuisines
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {cuisine} Categories
            </h2>
            <p className="text-sm text-gray-600">
              {templates.length} template{templates.length !== 1 && 's'}{' '}
              available
            </p>
          </div>
        </div>
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          {selectedTemplates.size} selected
        </Badge>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleToggleAll}
          className="whitespace-nowrap"
        >
          {allSelected ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4 mr-2" />
              Select All
            </>
          )}
        </Button>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[400px] pr-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplates.has(template.id)}
                onToggle={onToggle}
                onPreview={setPreviewTemplate}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          isSelected={selectedTemplates.has(previewTemplate.id)}
          onToggle={() => onToggle(previewTemplate.id)}
        />
      )}
    </div>
  )
}
