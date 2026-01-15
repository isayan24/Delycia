import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, X } from 'lucide-react'
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
import { useMenuStore } from '@/store/useMenuStore'

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
  // ✅ Removed refreshCategories - mutations handle cache invalidation automatically

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

  const goToNextStep = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3),
    }))
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
      id: Date.now().toString(), // Temporary ID for UI management
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

  const handleComplete = async () => {
    // ✅ Just close - mutation already invalidated cache!
    handleClose()
  }

  const handleClose = () => {
    // Reset state
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

    // Step 1: Choose Source
    if (currentStep === 1) {
      return <SourceSelector onSelect={handleSourceSelect} />
    }

    // Step 2: Template or Custom Flow
    if (currentStep === 2) {
      if (source === 'templates') {
        // If no cuisine selected yet, show cuisine selector
        if (!selectedCuisine) {
          return <CuisineSelector onSelect={handleCuisineSelect} />
        }
        // If cuisine selected, show template gallery
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

    // Step 3: Review
    if (currentStep === 3) {
      return (
        <ReviewConfirm
          wizardState={wizardState}
          onRemoveTemplate={handleRemoveTemplate}
          onRemoveCustomCategory={handleRemoveCustomCategory}
          onComplete={handleComplete}
        />
      )
    }

    return null
  }

  const showBackButton = wizardState.currentStep > 1
  const showNextButton =
    wizardState.currentStep < 3 &&
    (wizardState.source === 'custom' || wizardState.selectedCuisine)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Add Categories
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Stepper */}
        <WizardStepper steps={STEPS} currentStep={wizardState.currentStep} />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">{renderStepContent()}</div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {showBackButton && (
              <Button variant="outline" onClick={goToPrevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {showNextButton && (
              <>
                {wizardState.source === 'custom' && (
                  <Button
                    onClick={() => {
                      handleAddCustomCategory()
                      // Don't navigate, stay on same step
                    }}
                    disabled={
                      !wizardState.currentCustomCategory.name ||
                      !wizardState.currentCustomCategory.image ||
                      !wizardState.currentCustomCategory.description
                    }
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    Add Another Category
                  </Button>
                )}
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceedToReview()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {wizardState.source === 'custom' &&
                  wizardState.customCategories.length === 0
                    ? 'Add & Review'
                    : 'Next: Review'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
