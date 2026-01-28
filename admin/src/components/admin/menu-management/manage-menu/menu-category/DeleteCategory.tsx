import { Button } from '@/components/ui/button'
import { Loader2, Trash2, TriangleAlert } from 'lucide-react'
import React from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useToast from '@/hooks/UseToast'
import { useMenuStore } from '@/store/useMenuStore'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

import { useDeleteCategoryMutation } from '@/hooks/queries' // NEW - TanStack Query

interface DeleteCategoryProps {
  categoryId: string
  img?: string // Image URL (fileId will be extracted from it)
  template_id?: number | null // Template ID if category is from template
  onSuccess: () => void
}

export default function DeleteCategory({
  categoryId,
  img,
  template_id,
  onSuccess,
}: DeleteCategoryProps) {
  const { showError, showSuccess } = useToast()
  const { selectedRid } = useRestaurantSelector()
  const { isDeleteCategoryDialogOpen, closeDeleteCategoryDialog } =
    useMenuStore()

  // ✅ Use TanStack Query mutation hook
  const deleteMutation = useDeleteCategoryMutation()

  const handleDelete = async () => {
    if (!selectedRid) {
      showError('Error', 'Restaurant ID is missing')
      return
    }
    try {
      // ✅ Use mutation - cache will be invalidated automatically!
      await deleteMutation.mutateAsync({
        id: categoryId,
        rid: selectedRid,
        img,
        template_id: template_id?.toString(),
      })

      showSuccess('Success', 'Category deleted successfully')
      closeDeleteCategoryDialog()
      // onSuccess()
    } catch (error) {
      console.error('Error deleting category', error)
      showError('Error', 'Error deleting category')
    }
  }

  return (
    <Dialog
      open={isDeleteCategoryDialogOpen}
      onOpenChange={closeDeleteCategoryDialog}
    >
      <DialogContent className="max-w-[20rem]">
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category?
            <TriangleAlert className="h-8 text-red-600 text-center w-full mt-3" />
            <span className="mt-4 border border-red-500 bg-red-200 p-4 px-2 rounded-md text-red-600 flex gap-1 flex-col justify-center items-center">
              <span>
                Note: All items in this category will be deleted as well.
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            type="button"
            variant="outline"
            className="border border-red-300 text-red-500 hover:text-red-500 bg-[#c7000027] hover:bg-[#c700003b]"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Delete</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
