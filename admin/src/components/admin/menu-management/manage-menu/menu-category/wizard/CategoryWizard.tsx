import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Trash2, Loader2, Check } from 'lucide-react'
import WizardStepper from './WizardStepper'
import SourceSelector from './SourceSelector'
import CuisineSelector from './CuisineSelector'
import TemplateGallery from './TemplateGallery'
import CustomCategoryForm from './CustomCategoryForm'
import ReviewConfirm from './ReviewConfirm'
import {
  WizardState,
  SourceType,
  CustomCategoryData,
} from './types/wizardTypes'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import {
  useCreateCategoryMutation,
  useCreateCategoryAsTemplateMutation,
  useCreateCategoriesFromTemplatesMutation,
} from '@/hooks/queries'

interface CategoryWizardProps {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  { id: 1, label: 'Choose Source', description: 'Template or Custom' },
  { id: 2, label: 'Select', description: 'Browse or Create' },
  { id: 3, label: 'Review', description: 'Confirm & Add' },
]

export default function CategoryWizard({
  isOpen,
  onClose,
}: CategoryWizardProps) {
  const { selectedRid } = useRestaurantSelector()
  const { showSuccess, showError } = useToast()

  // Mutations
  const createCategoryMutation = useCreateCategoryMutation()
  const createCategoryAsTemplateMutation = useCreateCategoryAsTemplateMutation()
  const createFromTemplatesMutation = useCreateCategoriesFromTemplatesMutation()

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    source: null,
    selectedCuisine: undefined,
    selectedTemplates: new Set(),
    customCategories: [],
    currentCustomCategory: {
      name: '',
      description: '',
      image: '',
      cuisine_type: '',
      saveAsTemplate: false,
    },
  })

  const [submitting, setSubmitting] = useState(false)

  // Helper to check form validity
  const isCustomFormValid =
    !!wizardState.currentCustomCategory.name &&
    !!wizardState.currentCustomCategory.description &&
    !!wizardState.currentCustomCategory.image

  const handleSubmit = async () => {
    if (!selectedRid) {
      showError('Error', 'No restaurant selected')
      return
    }
    setSubmitting(true)
    try {
      if (wizardState.source === 'templates') {
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
          handleClose()
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

        if (successCount > 0) {
          showSuccess(
            'Success!',
            `${successCount} categor${successCount === 1 ? 'y' : 'ies'} created successfully!` +
              (failCount > 0 ? ` ${failCount} failed.` : ''),
          )
          handleClose()
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

  const goToNextStep = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3),
    }))
  }

  const handleNextWithAdd = () => {
    if (wizardState.source === 'custom' && isCustomFormValid) {
      setWizardState((prev) => ({
        ...prev,
        customCategories: [
          ...prev.customCategories,
          { ...prev.currentCustomCategory, id: Date.now().toString() },
        ],
        currentCustomCategory: {
          name: '',
          description: '',
          image: '',
          cuisine_type: '',
          saveAsTemplate: false,
        },
        currentStep: 3,
      }))
    } else {
      goToNextStep()
    }
  }

  const goToPrevStep = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }))
  }

  const handleSourceSelect = (source: SourceType) => {
    setWizardState((prev) => ({
      ...prev,
      source,
      currentStep: 2,
    }))
  }

  const handleCuisineSelect = (cuisine: string) => {
    setWizardState((prev) => ({
      ...prev,
      selectedCuisine: cuisine,
    }))
  }

  const handleTemplateToggle = (templateId: number) => {
    setWizardState((prev) => {
      const newSet = new Set(prev.selectedTemplates)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return { ...prev, selectedTemplates: newSet }
    })
  }

  const handleTemplateSelectAll = (templateIds: number[]) => {
    setWizardState((prev) => ({
      ...prev,
      selectedTemplates: new Set(templateIds),
    }))
  }

  const handleTemplateDeselectAll = () => {
    setWizardState((prev) => ({
      ...prev,
      selectedTemplates: new Set(),
    }))
  }

  const handleCustomCategoryChange = (data: Partial<CustomCategoryData>) => {
    setWizardState((prev) => ({
      ...prev,
      currentCustomCategory: { ...prev.currentCustomCategory, ...data },
    }))
  }

  const handleAddCustomCategory = () => {
    const newCategory = {
      ...wizardState.currentCustomCategory,
      id: Date.now().toString(),
    }

    setWizardState((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, newCategory],
      currentCustomCategory: {
        name: '',
        description: '',
        image: '',
        cuisine_type: '',
        saveAsTemplate: false,
      },
    }))
  }

  const handleRemoveCustomCategory = (id: string) => {
    setWizardState((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((cat) => cat.id !== id),
    }))
  }

  const handleRemoveTemplate = (templateId: number) => {
    setWizardState((prev) => {
      const newSet = new Set(prev.selectedTemplates)
      newSet.delete(templateId)
      return { ...prev, selectedTemplates: newSet }
    })
  }

  const handleClose = () => {
    setWizardState({
      currentStep: 1,
      source: null,
      selectedCuisine: undefined,
      selectedTemplates: new Set(),
      customCategories: [],
      currentCustomCategory: {
        name: '',
        description: '',
        image: '',
        cuisine_type: '',
        saveAsTemplate: false,
      },
    })
    onClose()
  }

  const canProceedToReview = () => {
    if (wizardState.source === 'templates') {
      return wizardState.selectedTemplates.size > 0
    } else if (wizardState.source === 'custom') {
      return wizardState.customCategories.length > 0
    }
    return false
  }

  const renderStepContent = () => {
    const { currentStep, source, selectedCuisine } = wizardState

    if (currentStep === 1) {
      return <SourceSelector onSelect={handleSourceSelect} />
    }

    if (currentStep === 2) {
      if (source === 'templates') {
        if (!selectedCuisine) {
          return <CuisineSelector onSelect={handleCuisineSelect} />
        }
        return (
          <TemplateGallery
            cuisine={selectedCuisine}
            selectedTemplates={wizardState.selectedTemplates}
            onToggle={handleTemplateToggle}
            onSelectAll={handleTemplateSelectAll}
            onDeselectAll={handleTemplateDeselectAll}
            onBack={() => handleCuisineSelect(undefined as any)}
          />
        )
      } else if (source === 'custom') {
        return (
          <CustomCategoryForm
            data={wizardState.currentCustomCategory}
            onChange={handleCustomCategoryChange}
            onAddAnother={handleAddCustomCategory}
            addedCount={wizardState.customCategories.length}
          />
        )
      }
    }

    if (currentStep === 3) {
      return (
        <ReviewConfirm
          wizardState={wizardState}
          onRemoveTemplate={handleRemoveTemplate}
          onRemoveCustomCategory={handleRemoveCustomCategory}
          onComplete={handleClose}
        />
      )
    }

    return null
  }

  const showBackButton = wizardState.currentStep > 1
  const showNextButton =
    wizardState.currentStep < 3 &&
    (wizardState.source === 'custom' || wizardState.selectedCuisine)

  const isNextDisabled =
    !canProceedToReview() &&
    !(wizardState.source === 'custom' && isCustomFormValid)

  const totalItems =
    wizardState.source === 'templates'
      ? wizardState.selectedTemplates.size
      : wizardState.source === 'custom'
        ? wizardState.customCategories.length
        : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 md:rounded-lg rounded-none">
        <DialogHeader className="p-4 border-b shrink-0 bg-white">
          <DialogTitle className="text-lg md:text-xl font-bold">
            Add Categories
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="shrink-0 bg-gray-50/50 border-b ">
          <WizardStepper steps={STEPS} currentStep={wizardState.currentStep} />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50/30">
          {renderStepContent()}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-white shrink-0 mt-auto gap-3">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevStep}
                className="h-10 w-10 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar ">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>

            {wizardState.currentStep === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || totalItems === 0}
                className="bg-green-500 hover:bg-green-600 text-white shrink-0 whitespace-nowrap"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm & Add {totalItems > 0 && `(${totalItems})`}
                  </>
                )}
              </Button>
            ) : (
              showNextButton && (
                <>
                  {wizardState.source === 'custom' && (
                    <Button
                      onClick={() => {
                        handleAddCustomCategory()
                      }}
                      disabled={!isCustomFormValid}
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 shrink-0 whitespace-nowrap"
                    >
                      Add Another
                    </Button>
                  )}
                  <Button
                    onClick={handleNextWithAdd}
                    disabled={isNextDisabled}
                    className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 whitespace-nowrap"
                  >
                    {wizardState.source === 'custom' &&
                    wizardState.customCategories.length === 0
                      ? 'Add & Review'
                      : 'Next: Review'}
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
