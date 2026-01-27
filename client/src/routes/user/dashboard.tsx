import { createFileRoute } from '@tanstack/react-router'
// Note: Metadata export is not directly supported in TanStack Router client-side routes the same way as Next.js app dir.

export const Route = createFileRoute('/user/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 text-white">
      {/* Layout content from old-client dashboard/layout.tsx */}
      <div>
        {/* Page content from old-client dashboard/page.tsx */}
        User dashboard
      </div>
    </div>
  )
}
