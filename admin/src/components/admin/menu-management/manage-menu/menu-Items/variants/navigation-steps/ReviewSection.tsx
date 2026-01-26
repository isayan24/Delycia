// components/ReviewSection.tsx
import React from 'react'

const ReviewSection = ({ variants }: { variants: any[] }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium mb-4">Review Your Variants</h3>
    <div className="border rounded-lg">
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-2 gap-4 font-medium text-base">
          <span>Variant Name</span>
          <span>Price</span>
        </div>
      </div>
      <div className="divide-y">
        {variants.map((variant) => (
          <div key={variant.id} className="p-4 grid grid-cols-2 gap-4">
            <span className="text-base">
              {variant.name || 'Unnamed Variant'}
            </span>
            <span className="text-base">₹{variant.price || '0.00'}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default ReviewSection
