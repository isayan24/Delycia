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
    <div className="w-full py-2 md:py-3">
      <div className="flex items-center justify-between px-3 md:px-4 max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center min-w-0 z-10">
                <div
                  className={cn(
                    'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-200 text-[10px] md:text-xs shrink-0',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent &&
                      'bg-orange-500 text-white ring-2 md:ring-3 ring-orange-200',
                    isUpcoming && 'bg-gray-200 text-gray-500',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-2.5 h-2.5 md:w-4 md:h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-0.5 md:mt-1.5 text-center px-1">
                  <p
                    className={cn(
                      'text-[8px] md:text-xs font-medium transition-colors leading-tight whitespace-nowrap',
                      isCurrent && 'text-orange-600',
                      isCompleted && 'text-green-600',
                      isUpcoming && 'text-gray-500',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="hidden md:block text-[10px] text-gray-400 mt-0.5 leading-tight whitespace-nowrap">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[1.5px] md:h-[2px] mx-1 md:mx-2 -mt-3 md:-mt-5 bg-gray-100 relative min-w-[20px]">
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
