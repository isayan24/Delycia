// types/variant.types.ts
export interface Variant {
  id: string | number; // Changed to support both string and number
  name: string;
  price: string;
}

export type VariantStep = 'variants' | 'review' | 'final';

export interface VariantManagerState {
  currentStep: VariantStep;
  variants: Variant[];
  nextId: number;
}

export interface VariantManagerActions {
  setCurrentStep: (step: VariantStep) => void;
  addVariant: () => void;
  removeVariant: (variantId: string | number) => void;
  updateVariantName: (variantId: string | number, name: string) => void;
  updateVariantPrice: (variantId: string | number, price: string) => void;
  resetToVariants: () => void;
  setVariants?: (variants: Variant[]) => void; // Add this
}

export interface VariantInputProps {
  variant: Variant;
  index: number;
  onNameChange: (id: string | number, name: string) => void;
  onPriceChange: (id: string | number, price: string) => void;
  onRemove: (id: string | number) => void;
  canRemove: boolean;
  isLoading?: boolean;
}

export interface ProgressStepsProps {
  currentStep: VariantStep;
}

export interface ReviewSectionProps {
  variants: Variant[];
}

export interface NavigationButtonsProps {
  currentStep: VariantStep;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  canProceed: boolean;
}

export interface VariantManagerContentProps {
  onSave: (variants: Variant[]) => void;
  initialVariants: Variant[];
  isVariantDeleting: boolean;
  onVariantDeleting: (variantId: string | number, onSuccess?: () => void) => void; // Updated
}

export interface VariantManagerProps {
  defaultExpanded?: boolean;
  onSave?: (variants: Variant[]) => void;
}