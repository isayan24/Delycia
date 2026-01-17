/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, X, Package, Sparkles, Check } from 'lucide-react'
import { WizardState, CategoryTemplate } from './types/wizardTypes'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import {
  useTemplatesByCuisineQuery,
  useCreateCategoryMutation,
  useCreateCategoryAsTemplateMutation,
  useCreateCategoriesFromTemplatesMutation,
} from '@/hooks/queries' // NEW - TanStack Query
import axios from 'axios'
import useToast from '@/hooks/UseToast'

interface ReviewConfirmProps {
  wizardState: WizardState
  onRemoveTemplate: (templateId: number) => void
  onRemoveCustomCategory: (id: string) => void
  onComplete: () => void
}

export default function ReviewConfirm({
  wizardState,
  onRemoveTemplate,
  onRemoveCustomCategory,
  onComplete,
}: ReviewConfirmProps) {
  const { selectedRid } = useRestaurantSelector()
  const { showSuccess, showError } = useToast()

  // NEW - Use TanStack Query for fetching templates 🚀
  const { data: allTemplates = [], isLoading: loading } =
    useTemplatesByCuisineQuery(
      wizardState.selectedCuisine,
      wizardState.source === 'templates' && !!wizardState.selectedCuisine,
    )

  // ✅ Use TanStack Query mutations
  const createCategoryMutation = useCreateCategoryMutation()
  const createCategoryAsTemplateMutation = useCreateCategoryAsTemplateMutation()
  const createFromTemplatesMutation = useCreateCategoriesFromTemplatesMutation()

  const [templates, setTemplates] = useState<CategoryTemplate[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (wizardState.source === 'templates' && allTemplates.length > 0) {
      // Filter the selected templates
      const selected = allTemplates.filter((t: any) =>
        wizardState.selectedTemplates.has(t.id),
      )
      setTemplates(selected)
    }
  }, [allTemplates, wizardState.selectedTemplates, wizardState.source])

  const handleSubmit = async () => {
    if (!selectedRid) {
      showError('Error', 'No restaurant selected')
      return
    }
    setSubmitting(true)
    try {
      if (wizardState.source === 'templates') {
        // NEW - Use mutation instead of direct API call 🚀
        const templateIds = Array.from(wizardState.selectedTemplates)

        const result = await createFromTemplatesMutation.mutateAsync({
          rid: selectedRid,
          template_ids: templateIds as any[],
        })

        const created = result.details?.created || []
        const skipped = result.details?.skipped || []

        if (created.length > 0) {
          showSuccess(
            'Success!',
            `${created.length} categor${created.length === 1 ? 'y' : 'ies'} added successfully!` +
              (skipped.length > 0
                ? ` ${skipped.length} skipped (already exist).`
                : ''),
          )
          onComplete()
        } else if (skipped.length > 0) {
          showError(
            'Info',
            'All selected categories already exist for this restaurant.',
          )
        }
      } else if (wizardState.source === 'custom') {
        const { customCategories } = wizardState

        let successCount = 0
        let failCount = 0

        // Loop through all custom categories
        for (const customCategory of customCategories) {
          try {
            // Upload image to ImageKit
            const uploadResponse = await axios.post('/api/imagekit', {
              base64Image: customCategory.image,
              fileName: `category_${Date.now()}.jpg`,
              folder: '/categories',
            })

            if (uploadResponse.status === 200 && uploadResponse.data?.url) {
              const imageUrl = uploadResponse.data.url

              // Create category (with or without template)
              if (customCategory.saveAsTemplate) {
                await createCategoryAsTemplateMutation.mutateAsync({
                  name: customCategory.name,
                  description: customCategory.description,
                  img: imageUrl,
                  rid: selectedRid,
                  cuisine_type: customCategory.cuisine_type,
                  saveAsTemplate: customCategory.saveAsTemplate,
                })
              } else {
                await createCategoryMutation.mutateAsync({
                  name: customCategory.name,
                  description: customCategory.description,
                  img: imageUrl,
                  rid: selectedRid,
                })
              }

              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            console.error(
              `Failed to create category ${customCategory.name}:`,
              error,
            )
            failCount++
          }
        }

        // Show result summary
        if (successCount > 0) {
          showSuccess(
            'Success!',
            `${successCount} categor${successCount === 1 ? 'y' : 'ies'} created successfully!` +
              (failCount > 0 ? ` ${failCount} failed.` : ''),
          )
          onComplete()
        } else {
          showError(
            'Error',
            'Failed to create custom categories. Please try again.',
          )
        }
      }
    } catch (error: any) {
      console.error('Failed to create categories:', error)
      showError(
        'Error',
        error?.response?.data?.message ||
          'Failed to create categories. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const totalItems =
    wizardState.source === 'templates'
      ? wizardState.selectedTemplates.size
      : wizardState.source === 'custom'
        ? wizardState.customCategories.length
        : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
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

            <ScrollArea className="h-[300px] border rounded-lg p-4">
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
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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

              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
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
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
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
                                className="text-gray-400 hover:text-red-500 flex-shrink-0"
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
              </ScrollArea>
            </div>
          )}

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSubmit}
            disabled={submitting || totalItems === 0}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Add {totalItems} Categor{totalItems === 1 ? 'y' : 'ies'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
