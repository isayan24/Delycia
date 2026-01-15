// components/ProgressSteps.tsx
import React from "react";
import { ChevronRight } from "lucide-react";
import { ProgressStepsProps } from "../types/variant.types";

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => (
  <div className="flex mb-8">
    <div className="flex items-center">
      <div
        className={`px-4 py-3 border-b-2 font-medium text-base ${
          currentStep === "variants"
            ? "text-blue-600 border-blue-600"
            : "text-gray-500 border-none"
        }`}
      >
        Add Variants
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
      <div
        className={`px-4 py-3 border-b-2 font-medium text-base ${
          currentStep === "review"
            ? "text-blue-600 border-blue-600"
            : "text-gray-500 border-none"
        }`}
      >
        Review & Save
      </div>
    </div>
  </div>
);

export default ProgressSteps;
