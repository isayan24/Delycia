import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, X } from 'lucide-react'

export default function SpecialInstructionArea({ form }: any) {
  const [showInstructions, setShowInstructions] = useState(false)
  const specialInstruction = form.watch('special_instruction')

  // Show instructions if there's already a value
  useEffect(() => {
    if (specialInstruction && specialInstruction.trim() !== '') {
      setShowInstructions(true)
    }
  }, [specialInstruction])

  return (
    <div className="w-full">
      {!showInstructions ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInstructions(true)}
          className="flex items-center gap-2 bg-yellow-50 w-full border-yellow-200"
        >
          <MessageSquare className="h-4 w-4" />
          {specialInstruction && specialInstruction.trim() !== ''
            ? 'Edit Special Instructions'
            : 'Add Special Instructions'}
        </Button>
      ) : (
        <div className="space-y-3 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Special Instructions</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowInstructions(false)
                form.setValue('special_instruction', '')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name="special_instruction"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  Any special requests or dietary requirements?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., No onions, extra spicy, gluten-free..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
