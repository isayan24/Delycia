// components/VariantManagerContent.tsx
import React from "react";
import { Plus, Edit2 } from "lucide-react";
import { useVariantManager } from "./hooks/UseVariantManager";
import { VariantManagerContentProps } from "./types/variant.types";
import VariantInput from "./navigation-steps/VariantInput";
import ReviewSection from "./navigation-steps/ReviewSection";
import NavigationButtons from "./navigation-steps/NavigationButtons";
import ProgressSteps from "./navigation-steps/ProgressSteps";

const VariantManagerContent: React.FC<VariantManagerContentProps> = ({
  onSave,
  initialVariants,
  isVariantDeleting,
  onVariantDeleting,
}) => {
  const {
    currentStep,
    setCurrentStep,
    variants,
    resetToVariants,
    addVariant,
    removeVariant,
    updateVariantName,
    updateVariantPrice,
    setVariants, // Add this to directly update variants
  } = useVariantManager(initialVariants);

  const handleNext = (): void => {
    if (currentStep === "variants") {
      setCurrentStep("review");
    }
  };

  const handleBack = (): void => {
    if (currentStep === "review") {
      setCurrentStep("variants");
    }
  };

  const handleSave = (): void => {
    setCurrentStep("final");

    if (onSave) {
      onSave(variants);
    }
  };

  const handleEdit = (): void => {
    resetToVariants();
  };

  const handleRemoveVariant = (variantId: string | number): void => {
    // Check if this variant exists in initialVariants (i.e., it's saved in the database)
    const isExistingVariant = initialVariants.some(
      (v) => v.id.toString() === variantId.toString()
    );

    if (isExistingVariant) {
      // This variant exists in the database, use the deletion handler with callback
      onVariantDeleting(variantId, () => {
        // After successful deletion from database, remove from local state
        removeVariant(variantId);
      });
    } else {
      // This is a newly added variant, just remove from local state
      removeVariant(variantId);
    }
  };

  const canProceed = variants.some(
    (variant) => variant.name.trim() && variant.price.trim()
  );

  // If variants are saved, show the saved variants view
  if (initialVariants.length > 0 && currentStep === "final") {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Saved Variants</h3>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 py-2 px-3 rounded-md transition-colors"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
              Edit Variants
            </button>
          </div>

          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-2 gap-4 font-medium text-base">
                <span>Variant Name</span>
                <span>Price</span>
              </div>
            </div>
            <div className="divide-y">
              {initialVariants.map((variant) => (
                <div key={variant.id} className="p-4 grid grid-cols-2 gap-4">
                  <span className="text-base">
                    {variant.name || "Unnamed Variant"}
                  </span>
                  <span className="text-base">₹{variant.price || "0"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white">
      <ProgressSteps currentStep={currentStep} />

      {/* Variants Step */}
      {currentStep === "variants" && (
        <div className="space-y-6">
          {variants.map((variant, index) => (
            <VariantInput
              key={variant.id}
              variant={variant}
              index={index}
              onNameChange={updateVariantName}
              onPriceChange={updateVariantPrice}
              onRemove={handleRemoveVariant}
              canRemove={variants.length > 0}
              isLoading={isVariantDeleting}
            />
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-0 text-center">
            <button
              onClick={addVariant}
              className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700 p-6 font-medium text-base hover:bg-blue-50 rounded-md transition-colors"
              type="button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Variant
            </button>
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === "review" && <ReviewSection variants={variants} />}

      <NavigationButtons
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onSave={handleSave}
        canProceed={canProceed}
      />
    </div>
  );
};

export default VariantManagerContent;
