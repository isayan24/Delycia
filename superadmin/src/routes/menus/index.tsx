import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { MenuList } from '@/components/menus/MenuList'

export const Route = createFileRoute('/menus/')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: MenusPage,
})

function MenusPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Menu Management</h2>
            <p className="text-muted-foreground">
              View and manage menu items across all restaurants
            </p>
          </div>
        </div>

        <MenuList />
      </div>
    </ProtectedLayout>
  )
}
