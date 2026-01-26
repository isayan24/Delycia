import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => (
  <div className="flex gap-2">
    {Array.from({ length: totalSteps }, (_, step) => (
      <div
        key={step}
        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
          step <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
        }`}
      />
    ))}
  </div>
);