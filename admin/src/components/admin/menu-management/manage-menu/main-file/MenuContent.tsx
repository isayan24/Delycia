import React from 'react'
import { Dialog } from '@/components/ui/dialog'
import { CategoryList } from '../menu-category/CategoryList'
import { ItemList } from '../menu-Items/ItemList'
import EditCategory from '../menu-category/EditCategory'
import DeleteCategory from '../menu-category/DeleteCategory'
import { useMenuStore } from '@/store/useMenuStore'

export const MenuContent = React.memo(() => {
  const {
    // State
    isEditCategoryDialogOpen,
    currentCategory,
    isDeleteCategoryDialogOpen,
    // Actions
    closeEditCategoryDialog,
  } = useMenuStore()

  // ✅ No need to manually refresh! Mutations handle cache invalidation automatically

  const handleEditCategorySuccess = async () => {
    closeEditCategoryDialog()
    // ✅ TanStack Query mutation already invalidated cache - UI auto-updates!
  }

  const handleDeleteCategorySuccess = async () => {
    // ✅ TanStack Query mutation already invalidated cache - UI auto-updates!
  }

  return (
    <div className="rounded-md h-full w-full flex overflow-hidden">
      <section className="w-[40%] h-full border flex flex-col">
        <CategoryList />
      </section>

      <section className="w-[60%] h-full border flex flex-col">
        <ItemList />
      </section>

      {/* Edit Category Dialog */}
      {isEditCategoryDialogOpen && currentCategory && (
        <Dialog
          open={isEditCategoryDialogOpen}
          onOpenChange={closeEditCategoryDialog}
        >
          <EditCategory
            category={currentCategory}
            onSuccess={handleEditCategorySuccess}
            formSubmitted={handleEditCategorySuccess}
          />
        </Dialog>
      )}

      {/* Delete Category Dialog */}
      {isDeleteCategoryDialogOpen && currentCategory && (
        <DeleteCategory
          categoryId={currentCategory.id}
          img={currentCategory.img}
          template_id={currentCategory.template_id}
          onSuccess={handleDeleteCategorySuccess}
        />
      )}
    </div>
  )
})

MenuContent.displayName = 'MenuContent'
