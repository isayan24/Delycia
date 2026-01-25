import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FormFieldEasy from '@/components/smallComponents/FormFieldEasy'
import AddImage from '@/components/smallComponents/AddImage'
import { CustomCategoryData } from './types/wizardTypes'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import * as z from 'zod'

const customCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
  cuisine_type: z.string().optional(), // Only required when saveAsTemplate is true
})

interface CustomCategoryFormProps {
  data: CustomCategoryData
  onChange: (data: Partial<CustomCategoryData>) => void
  onAddAnother: () => void
  addedCount: number
}

const CUISINE_OPTIONS = [
  'Indian',
  'Italian',
  'Chinese',
  'Continental',
  'Dessert',
  'Fast Food',
  'Mexican',
  'Japanese',
  'Thai',
  'Korean',
  'Mediterranean',
  'American',
  'French',
  'Vietnamese',
  'Spanish',
  'Greek',
  'Other',
]

export default function CustomCategoryForm({
  data,
  onChange,
  onAddAnother,
  addedCount,
}: CustomCategoryFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  // Key to force AddImage component to reset
  const [resetKey, setResetKey] = useState(0)

  const form = useForm({
    resolver: zodResolver(customCategorySchema),
    values: {
      name: data.name,
      description: data.description,
      cuisine_type: data.cuisine_type,
    },
  })

  // Update parent state when form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange({
        name: value.name || '',
        description: value.description || '',
        cuisine_type: value.cuisine_type || '',
      })
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  // Reset AddImage when addedCount changes (new category added)
  useEffect(() => {
    if (addedCount > 0) {
      setResetKey((prev) => prev + 1)
    }
  }, [addedCount])

  const handleImageUpload = (base64: string) => {
    onChange({ image: base64 })
    setValidationError(null)
  }

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
    setValidationError(null)
  }

  return (
    <div className="py-4">
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Create Custom Category
        </h2>
        <p className="text-xs md:text-sm text-gray-600">
          Design a unique category with your own details
        </p>
      </div>

      {/* Added Categories Counter */}
      {addedCount > 0 && (
        <Alert className="mb-4 max-w-2xl mx-auto bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            ✓ {addedCount} categor{addedCount === 1 ? 'y' : 'ies'} added. Add
            another or proceed to review.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form className="space-y-4">
            {/* Category Name */}
            <div>
              <FormLabel className="text-sm font-medium text-gray-700 mb-1.5 block">
                Category Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormFieldEasy
                form={form}
                name="name"
                placeholder="e.g., Signature Desserts, Premium Pizzas"
                placeholderApply={false}
                className="text-sm"
              />
            </div>

            {/* Category Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this category..."
                      className="resize-none text-sm"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div>
              <FormLabel className="text-sm font-medium text-gray-700 mb-1.5 block">
                Category Image <span className="text-red-500">*</span>
              </FormLabel>
              <AddImage
                key={resetKey}
                onImageUpload={handleImageUpload}
                required={true}
              />
              {!data.image && validationError && (
                <p className="text-sm text-red-500 mt-2">{validationError}</p>
              )}
            </div>

            {/* Save as Template */}
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="saveAsTemplate"
                  checked={data.saveAsTemplate}
                  required={false}
                  onCheckedChange={(checked) =>
                    handleFieldChange('saveAsTemplate', checked)
                  }
                  className="mt-0.5"
                />
                <label
                  htmlFor="saveAsTemplate"
                  className="text-sm font-medium leading-snug cursor-pointer"
                >
                  Save as template for future use
                  <p className="text-xs text-gray-600 mt-0.5 font-normal">
                    Make this category available as a template for other
                    restaurants
                  </p>
                </label>
              </div>
            </div>

            {/* Cuisine Type - Only show if saveAsTemplate is true */}
            {data.saveAsTemplate && (
              <div className="pt-2">
                <FormLabel className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Cuisine Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={data.cuisine_type}
                  onValueChange={(value) =>
                    handleFieldChange('cuisine_type', value)
                  }
                  required={false}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
