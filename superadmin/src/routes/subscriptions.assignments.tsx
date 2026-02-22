import { createFileRoute, Link } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { SubscriptionAssignmentList } from '@/components/subscriptions/SubscriptionAssignmentList'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/subscriptions/assignments')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SubscriptionAssignmentsPage,
})

const tabs = [
  { label: 'Plans', href: '/subscriptions/plans' },
  { label: 'Assignments', href: '/subscriptions/assignments' },
] as const

function SubscriptionAssignmentsPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-6">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  tab.href === '/subscriptions/assignments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <SubscriptionAssignmentList />
      </div>
    </ProtectedLayout>
  )
}
