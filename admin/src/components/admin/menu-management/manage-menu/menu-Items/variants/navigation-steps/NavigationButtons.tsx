// components/NavigationButtons.tsx
import React from "react";
import { NavigationButtonsProps } from "../types/variant.types";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  onNext,
  onBack,
  onSave,
  canProceed,
}) => (
  <div className="mt-8">
    {currentStep === "variants" ? (
      <button
        onClick={onNext}
        className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!canProceed}
        type="button"
      >
        Review Variants
      </button>
    ) : (
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium text-base"
          type="button"
        >
          Back to Variants
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 transition-colors font-medium text-base"
          type="button"
        >
          Save Variants
        </button>
      </div>
    )}
  </div>
);

export default NavigationButtons;
