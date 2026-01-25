import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  label: string
  description?: string
}

interface WizardStepperProps {
  steps: Step[]
  currentStep: number
}

export default function WizardStepper({
  steps,
  currentStep,
}: WizardStepperProps) {
  return (
    <div className="w-full py-2 md:py-4">
      <div className="flex items-center justify-between px-2 md:px-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-1 z-10">
                <div
                  className={cn(
                    'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-200 text-[10px] md:text-xs',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent &&
                      'bg-orange-500 text-white ring-2 md:ring-3 ring-orange-200',
                    isUpcoming && 'bg-gray-200 text-gray-500',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 md:w-4 md:h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-1 md:mt-1.5 text-center">
                  <p
                    className={cn(
                      'text-[9px] md:text-xs font-medium transition-colors leading-tight',
                      isCurrent && 'text-orange-600',
                      isCompleted && 'text-green-600',
                      isUpcoming && 'text-gray-500',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="hidden md:block text-[10px] text-gray-400 mt-0.5 max-w-[100px] leading-tight">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 md:mx-2 -mt-4 md:-mt-6 bg-gray-100 relative">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200',
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
