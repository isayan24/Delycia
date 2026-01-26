// components/NavigationButtons.tsx
import React from 'react'
import { NavigationButtonsProps } from '../types/variant.types'

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onSave,
  canProceed,
}) => (
  <div className="mt-8">
    <button
      onClick={onSave}
      className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
      disabled={!canProceed}
      type="button"
    >
      Save Variants
    </button>
  </div>
)

export default NavigationButtons
