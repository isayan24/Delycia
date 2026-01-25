import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CategoryWizard from './wizard/CategoryWizard'

interface AddCategoryProps {
  trigger?: React.ReactNode
}

export default function AddCategory({ trigger }: AddCategoryProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          className="bg-green-500 hover:bg-green-600 hover:text-white text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      )}

      <CategoryWizard isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
