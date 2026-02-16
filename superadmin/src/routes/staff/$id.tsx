import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { useStaffMemberQuery } from '@/hooks/queries/useStaffMemberQuery'
import { useStaffActivityQuery } from '@/hooks/queries/useStaffActivityQuery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Edit, 
  Ban, 
  Mail, 
  Phone, 
  Calendar,
  User as UserIcon,
  Shield,
  Building2,
  Activity
} from 'lucide-react'

export const Route = createFileRoute('/staff/$id')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: StaffDetailPage,
})

function StaffDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useStaffMemberQuery(id)
  const { data: activityData, isLoading: isActivityLoading } = useStaffActivityQuery(id, { page: 1, limit: 10 })

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit staff:', id)
  }

  const handleDeactivate = () => {
    // TODO: Implement deactivate mutation
    console.log('Deactivate staff:', id)
  }

  if (isError) {
    return (
      <ProtectedLayout>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive text-lg font-semibold">
                {error instanceof Error && error.message.includes('404') 
                  ? 'Staff member not found' 
                  : 'Error loading staff member'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate({ to: '/staff' })}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Staff
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const staff = data?.data

  const getRoleName = (role: number) => {
    const roleMap: Record<number, string> = {
      10: 'Staff',
      50: 'Manager',
      100: 'Admin',
    }
    return roleMap[role] || `Role ${role}`
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/staff' })}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{staff?.name}</h2>
                  <p className="text-muted-foreground">
                    Staff ID: {staff?.id}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {!isLoading && staff && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={!staff.is_active}
              >
                <Ban className="h-4 w-4" />
                Deactivate
              </Button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {!isLoading && staff && (
          <div>
            <Badge variant={staff.is_active ? 'success' : 'destructive'}>
              {staff.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Staff member details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : staff ? (
                <>
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{staff.name}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <a 
                        href={`mailto:${staff.email}`}
                        className="text-primary hover:underline"
                      >
                        {staff.email}
                      </a>
                    </div>
                  </div>

                  {staff.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <a 
                          href={`tel:${staff.phone_number}`}
                          className="text-primary hover:underline"
                        >
                          {staff.phone_number}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <strong>Created:</strong> {new Date(staff.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(staff.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Role and Restaurant Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role and Assignment</CardTitle>
              <CardDescription>Staff role and restaurant assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : staff ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{getRoleName(staff.role)}</div>
                      <div className="text-sm text-muted-foreground">Role Level: {staff.role}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{staff.restaurant_name}</div>
                      <div className="text-sm text-muted-foreground">Restaurant Assignment</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Activity Log Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Staff member activity logs and actions</CardDescription>
            </CardHeader>
            <CardContent>
              {isActivityLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : activityData?.data && activityData.data.length > 0 ? (
                <div className="space-y-3">
                  {activityData.data.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm">{activity.action || activity.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp || activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No activity logs available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
