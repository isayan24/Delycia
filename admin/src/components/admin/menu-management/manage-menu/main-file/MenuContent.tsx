import React from 'react'
import { Dialog } from '@/components/ui/dialog'
import { CategoryList } from '../menu-category/CategoryList'
import { ItemList } from '../menu-Items/ItemList'
import EditCategory from '../menu-category/EditCategory'
import DeleteCategory from '../menu-category/DeleteCategory'
import { useMenuStore } from '@/store/useMenuStore'
import LoadingScreen from '@/components/common/LoadingScreen'
import { useMediaQuery } from '@/hooks/use-media-query'

export const MenuContent = React.memo(() => {
  const {
    // State
    isEditCategoryDialogOpen,
    currentCategory,
    isDeleteCategoryDialogOpen,
    // Actions
    closeEditCategoryDialog,
    isLoading,
  } = useMenuStore()

  const isDesktop = useMediaQuery('(min-width: 768px)')

  // ✅ No need to manually refresh! Mutations handle cache invalidation automatically

  const handleEditCategorySuccess = async () => {
    closeEditCategoryDialog()
    // ✅ TanStack Query mutation already invalidated cache - UI auto-updates!
  }

  const handleDeleteCategorySuccess = async () => {
    // ✅ TanStack Query mutation already invalidated cache - UI auto-updates!
  }

  if (isLoading) {
    return <LoadingScreen message="Loading menu" />
  }

  return (
    <div className="rounded-md h-full w-full flex overflow-hidden">
      {isDesktop ? (
        // Desktop: Vertical Split
        <>
          <section className="w-[40%] h-full border rounded-l-md flex flex-col">
            <CategoryList />
          </section>

          <section className="w-[60%] h-full border rounded-r-md flex flex-col">
            <ItemList />
          </section>
        </>
      ) : (
        // Mobile: Horizontal Scroll Top + List Bottom
        <div className="w-full h-full flex flex-col bg-gray-50 ">
          <section className="w-full shrink-0">
            <CategoryList orientation="horizontal" />
          </section>

          <section className="flex-1 min-h-0">
            <ItemList />
          </section>
        </div>
      )}

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
