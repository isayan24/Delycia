import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { useUserQuery } from '@/hooks/queries/useUserQuery'
import { useUserActivityQuery } from '@/hooks/queries/useUserActivityQuery'
import { useResetPasswordMutation } from '@/hooks/mutations/useResetPasswordMutation'
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
  KeyRound,
  Activity
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/users/$id')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: UserDetailPage,
})

function UserDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data, isLoading, isError, error } = useUserQuery(id)
  const { data: activityData, isLoading: isActivityLoading } = useUserActivityQuery(id, { page: 1, limit: 10 })
  const resetPasswordMutation = useResetPasswordMutation()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit user:', id)
  }

  const handleDeactivate = () => {
    // TODO: Implement deactivate mutation
    console.log('Deactivate user:', id)
  }

  const handleResetPassword = async () => {
    try {
      await resetPasswordMutation.mutateAsync({ id: parseInt(id) })
      toast({
        title: 'Password Reset',
        description: 'A new password has been sent to the user.',
      })
      setIsResetDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      })
    }
  }

  if (isError) {
    return (
      <ProtectedLayout>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive text-lg font-semibold">
                {error instanceof Error && error.message.includes('404') 
                  ? 'User not found' 
                  : 'Error loading user'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate({ to: '/users' })}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const user = data?.data

  const getRoleName = (role: number) => {
    const roleMap: Record<number, string> = {
      0: 'Customer',
      10: 'Staff',
      50: 'Manager',
      100: 'Admin',
      1000: 'Superadmin',
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
              onClick={() => navigate({ to: '/users' })}
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
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">
                    User ID: {user?.id}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {!isLoading && user && (
            <div className="flex items-center gap-2">
              <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <KeyRound className="h-4 w-4" />
                    Reset Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reset the password for {user.name}? 
                      A new password will be generated and sent to the user.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
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
                disabled={user.status === 'inactive'}
              >
                <Ban className="h-4 w-4" />
                Deactivate
              </Button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {!isLoading && user && (
          <div>
            <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : user ? (
                <>
                  {user.profile_pic && (
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.profile_pic} 
                        alt={user.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      {user.username && (
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      )}
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <a 
                          href={`mailto:${user.email}`}
                          className="text-primary hover:underline"
                        >
                          {user.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <a 
                        href={`tel:${user.country_code}${user.phone_number}`}
                        className="text-primary hover:underline"
                      >
                        {user.country_code} {user.phone_number}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <strong>Registered:</strong> {new Date(user.register_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Role and Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role and Permissions</CardTitle>
              <CardDescription>User role and access level</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : user ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{getRoleName(user.role)}</div>
                      <div className="text-sm text-muted-foreground">Role Level: {user.role}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Restaurant Assignments Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Restaurant Assignments</CardTitle>
              <CardDescription>Restaurants this user has access to</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : user ? (
                <div className="space-y-2">
                  {user.restaurant_names && user.restaurant_names.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.restaurant_names.map((name: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No restaurant assignments
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Activity Log Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User activity logs and actions</CardDescription>
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
