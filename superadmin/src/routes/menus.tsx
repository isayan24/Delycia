import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/menus')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: MenusPage,
})

function MenusPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Menus</h2>
        <p className="text-muted-foreground">Menu management coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
