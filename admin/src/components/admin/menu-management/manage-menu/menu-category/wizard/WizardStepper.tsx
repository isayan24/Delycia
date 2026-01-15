import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function WizardStepper({
  steps,
  currentStep,
}: WizardStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent &&
                      "bg-orange-500 text-white ring-4 ring-orange-200",
                    isUpcoming && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-orange-600",
                      isCompleted && "text-green-600",
                      isUpcoming && "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[120px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -mt-10">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
