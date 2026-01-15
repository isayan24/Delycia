export interface CuisineType {
  cuisine_type: string
  template_count: number
}

export interface CategoryTemplate {
  id: number
  name: string
  description: string
  img: string
  cuisine_type: string
  usage_count: number
}

export interface WizardStep {
  id: number
  label: string
  description: string
}

// Custom category data structure
export interface CustomCategoryData {
  name: string
  description: string
  image: string // base64
  cuisine_type: string
  saveAsTemplate: boolean
  id?: string // Temporary ID for UI management
}

export interface WizardState {
  currentStep: number
  source: 'templates' | 'custom' | null
  selectedCuisine: string | undefined
  selectedTemplates: Set<number>
  customCategories: CustomCategoryData[] // Changed to array
  currentCustomCategory: CustomCategoryData // Form data for current category being added
}

export type SourceType = 'templates' | 'custom' | null
