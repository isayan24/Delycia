import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema } from '@/schemas/categorySchema'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'sonner'
import { Form, FormField, FormLabel } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import useToast from '@/hooks/UseToast'
import FormFieldEasy from '@/components/smallComponents/FormFieldEasy'
import AddImage from '@/components/smallComponents/AddImage'
import DeleteCategory from './DeleteCategory'

import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'
import { useUpdateCategoryMutation } from '@/hooks/queries' // NEW - TanStack Query

export default function EditCategory({
  category,
  onSuccess,
  formSubmitted,
}: any) {
  const [base64, setBase64] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const { showError, showSuccess } = useToast()

  // ✅ Call mutation hook at component level
  const updateMutation = useUpdateCategoryMutation()

  // Initialize form with category values
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      img: category.img, // Add img field to form
    },
  })

  // Initialize form when component mounts
  useEffect(() => {
    if (category?.img) {
      form.setValue('img', 'valid-image-marker')
    }
  }, [category, form])

  // Reset form when category changes
  useEffect(() => {
    form.reset({
      name: category.name,
      description: category.description,
      img: category.img ? 'valid-image-marker' : '', // Set valid marker for existing image
    })
  }, [category, form])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      // Default to existing image
      let imageUrl = category.img

      // Only upload new image if base64 has value (a new image was selected)
      if (base64) {
        // Upload new image
        const uploadResponse = await axios.post('/api/imagekit', {
          base64Image: base64,
          fileName: `category_${Date.now()}.jpg`,
          folder: 'categories',
        })

        if (uploadResponse.status === 200 && uploadResponse.data?.url) {
          imageUrl = uploadResponse.data.url // URL with fileId in hash

          // Delete old image if it exists
          if (category.img) {
            try {
              const oldFileId = extractFileIdFromUrl(category.img)

              if (oldFileId) {
                await axios.delete('/api/imagekit', {
                  data: { img_id: oldFileId },
                })
              }
            } catch (deleteError) {
              console.error('Failed to delete old image:', deleteError)
              // Don't fail the update if old image deletion fails
            }
          }
        }
      }

      // ✅ Use the mutation hook (already declared at component level)
      await updateMutation.mutateAsync({
        id: category.id,
        rid: category.rid,
        name: data.name,
        description: data.description,
        img: imageUrl || undefined, // Handle null/undefined properly
      })

      showSuccess('Successfully!', 'Category updated successfully')
      form.reset()
      setBase64('')
      setImageError(null)
      formSubmitted()
      onSuccess()
    } catch (error) {
      console.error('Error during form submission:', error)
      showError('Error', 'An error occurred while updating the category.')
    } finally {
      setIsLoading(false)
    }
  }

  const onImageUpload = async (values: unknown) => {
    try {
      // Handle VALID_IMAGE marker from AddImage component
      if (values === 'VALID_IMAGE' || values === true) {
        form.setValue('img', 'valid-image-marker')
        setImageError(null)
        return
      }

      // Handle string values (base64)
      if (typeof values === 'string') {
        // Special case for existing image markers
        if (values === 'KEEP_EXISTING') {
          form.setValue('img', 'valid-image-marker')
          setImageError(null)
          return
        }

        // Normal case for new image upload
        setBase64(values)
        form.setValue('img', values)
        setImageError(null)
      }
      // Handle null (image removed)
      else if (values === null) {
        setBase64('')
        form.setValue('img', '')
      }
    } catch (error) {
      console.error('Error during upload:', error)
      toast.error('An error occurred while uploading')
    }
  }

  return (
    <DialogContent className="max-w-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Edit {category?.name}</DialogTitle>
            <DialogDescription>
              Make changes to your category here. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="items-center gap-4 ">
              <FormLabel
                id="name"
                className="!text-[1.1rem] !font-[200] text-black px-1 py-2 block"
              >
                Category Name
              </FormLabel>
              <FormFieldEasy
                form={form}
                name="name"
                placeholder="Enter category name"
                placeholderApply={false}
                className="!text-[1rem] "
              />
            </div>
            <div className="items-center gap-4">
              <FormLabel
                id="name"
                className="!text-[1.1rem] !font-[200] text-black px-1 py-2 block"
              >
                Category Description
              </FormLabel>
              <FormFieldEasy
                form={form}
                name="description"
                placeholder="Enter description"
                className="!text-[1rem] "
                placeholderApply={false}
              />
            </div>
            <div>
              <AddImage
                OldImage={category?.img}
                onImageUpload={onImageUpload}
                required={true}
              />
            </div>
          </div>
          <DialogFooter className="flex !justify-between flex-row ">
            <DeleteCategory
              categoryId={category?.id}
              img={category?.img}
              template_id={category?.template_id}
              onSuccess={onSuccess}
            />
            <Button
              type="submit"
              variant="outline"
              className="border border-btnColor text-btnColor hover:text-btnColor hover:bg-[#c771003a]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
