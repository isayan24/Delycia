/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Package, Sparkles } from 'lucide-react'
import { WizardState, CategoryTemplate } from './types/wizardTypes'
import { useTemplatesByCuisineQuery } from '@/hooks/queries'

interface ReviewConfirmProps {
  wizardState: WizardState
  onRemoveTemplate: (templateId: number) => void
  onRemoveCustomCategory: (id: string) => void
  onComplete: () => void // Kept for compatibility but unused
}

export default function ReviewConfirm({
  wizardState,
  onRemoveTemplate,
  onRemoveCustomCategory,
}: ReviewConfirmProps) {
  // NEW - Use TanStack Query for fetching templates 🚀
  const { data: allTemplates = [], isLoading: loading } =
    useTemplatesByCuisineQuery(
      wizardState.selectedCuisine,
      wizardState.source === 'templates' && !!wizardState.selectedCuisine,
    )

  const [templates, setTemplates] = useState<CategoryTemplate[]>([])

  useEffect(() => {
    if (wizardState.source === 'templates' && allTemplates.length > 0) {
      // Filter the selected templates
      const selected = allTemplates.filter((t: any) =>
        wizardState.selectedTemplates.has(t.id),
      )
      setTemplates(selected)
    }
  }, [allTemplates, wizardState.selectedTemplates, wizardState.source])

  const totalItems =
    wizardState.source === 'templates'
      ? wizardState.selectedTemplates.size
      : wizardState.source === 'custom'
        ? wizardState.customCategories.length
        : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Confirm
        </h2>
        <p className="text-gray-600">
          Adding {totalItems} categor{totalItems === 1 ? 'y' : 'ies'} to your
          menu
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Template Categories */}
        {wizardState.source === 'templates' && templates.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                From Templates
              </h3>
              <Badge className="bg-orange-100 text-orange-700">
                {templates.length} selected
              </Badge>
            </div>

            <div className="border rounded-lg p-4">
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={template.img || ''}
                        alt={template.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f3f4f6' width='80' height='80'/%3E%3C/svg%3E"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {template.cuisine_type}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveTemplate(template.id)}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Categories */}
        {wizardState.source === 'custom' &&
          wizardState.customCategories.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Custom Categor
                  {wizardState.customCategories.length === 1 ? 'y' : 'ies'} (
                  {wizardState.customCategories.length})
                </h3>
              </div>

              <div>
                <div className="space-y-4">
                  {wizardState.customCategories.map((category, index) => {
                    // Convert base64 to proper data URL if needed
                    const imageUrl = category.image.startsWith('data:')
                      ? category.image
                      : `data:image/jpeg;base64,${category.image}`

                    return (
                      <Card key={category.id} className="p-4">
                        <div className="flex items-start gap-4">
                          {category.image && (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-20 h-20 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {index + 1}. {category.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {category.description || 'No description'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  wizardState.source === 'custom' &&
                                  onRemoveCustomCategory(category.id!)
                                }
                                className="text-gray-400 hover:text-red-500 shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {category.cuisine_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {category.cuisine_type}
                                </Badge>
                              )}
                              {category.saveAsTemplate && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  Save as template
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
