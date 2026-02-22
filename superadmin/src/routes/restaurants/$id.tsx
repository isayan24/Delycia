import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import {
  useRestaurantQuery,
  type RestaurantDetail,
} from '@/hooks/queries/useRestaurantQuery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Edit,
  Ban,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  UtensilsCrossed,
  ShoppingCart,
} from 'lucide-react'

export const Route = createFileRoute('/restaurants/$id')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: RestaurantDetailPage,
})

function RestaurantDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useRestaurantQuery(id)

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit restaurant:', id)
  }

  const handleDeactivate = () => {
    // TODO: Implement deactivate mutation
    console.log('Deactivate restaurant:', id)
  }

  if (isError) {
    return (
      <ProtectedLayout>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive text-lg font-semibold">
                {error instanceof Error && error.message.includes('404')
                  ? 'Restaurant not found'
                  : 'Error loading restaurant'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate({ to: '/restaurants' })}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Restaurants
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const restaurant: RestaurantDetail | undefined = data?.data

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/restaurants' })}
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
                  <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
                  <p className="text-muted-foreground">
                    Restaurant ID: {restaurant?.id}
                  </p>
                </>
              )}
            </div>
          </div>

          {!isLoading && restaurant && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={!restaurant.is_active}
              >
                <Ban className="h-4 w-4" />
                Deactivate
              </Button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {!isLoading && restaurant && (
          <div>
            <Badge variant={restaurant.is_active ? 'success' : 'destructive'}>
              {restaurant.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Restaurant details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : restaurant ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <strong>Name:</strong>
                    </div>
                    <div className="flex-1">{restaurant.name}</div>
                  </div>

                  {restaurant.username && (
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground mt-0.5">
                        <strong>Username:</strong>
                      </div>
                      <div className="flex-1">{restaurant.username}</div>
                    </div>
                  )}

                  {restaurant.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <a
                          href={`mailto:${restaurant.email}`}
                          className="text-primary hover:underline"
                        >
                          {restaurant.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <a
                          href={`tel:${restaurant.phone_number}`}
                          className="text-primary hover:underline"
                        >
                          {restaurant.phone_number}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <strong>Created:</strong>{' '}
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last updated:{' '}
                        {new Date(restaurant.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Location information</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : restaurant ? (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    {restaurant.address && <div>{restaurant.address}</div>}
                    <div>
                      {[restaurant.city, restaurant.state, restaurant.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Current subscription plan and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : restaurant ? (
                <>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      {restaurant.subscription_plan_name ? (
                        <>
                          <div className="font-medium">
                            {restaurant.subscription_plan_name}
                          </div>
                          {restaurant.subscription_price &&
                            restaurant.subscription_billing_period && (
                              <div className="text-sm text-muted-foreground">
                                ${restaurant.subscription_price} /{' '}
                                {restaurant.subscription_billing_period}
                              </div>
                            )}
                          {restaurant.subscription_status && (
                            <Badge
                              variant={
                                restaurant.subscription_status === 'active'
                                  ? 'success'
                                  : 'secondary'
                              }
                              className="mt-1"
                            >
                              {restaurant.subscription_status}
                            </Badge>
                          )}
                          {restaurant.subscription_start_date && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Started:{' '}
                              {new Date(
                                restaurant.subscription_start_date,
                              ).toLocaleDateString()}
                              {restaurant.subscription_end_date && (
                                <>
                                  {' '}
                                  • Ends:{' '}
                                  {new Date(
                                    restaurant.subscription_end_date,
                                  ).toLocaleDateString()}
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          No active subscription
                        </div>
                      )}
                    </div>
                  </div>

                  {restaurant.subscription_plan_name && (
                    <div>
                      <Link
                        to="/subscriptions/assignments"
                        search={{ restaurantId: restaurant.id }}
                        className="text-sm text-primary hover:underline"
                      >
                        View subscription details →
                      </Link>
                    </div>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
              <CardDescription>
                Restaurant statistics and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : restaurant ? (
                <>
                  {restaurant.menu_item_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Menu Items</span>
                      </div>
                      <span className="font-semibold">
                        {restaurant.menu_item_count}
                      </span>
                    </div>
                  )}

                  {restaurant.user_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Users</span>
                      </div>
                      <span className="font-semibold">
                        {restaurant.user_count}
                      </span>
                    </div>
                  )}

                  {restaurant.orders_today !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Orders Today</span>
                      </div>
                      <span className="font-semibold">
                        {restaurant.orders_today}
                      </span>
                    </div>
                  )}

                  {!restaurant.menu_item_count &&
                    !restaurant.user_count &&
                    !restaurant.orders_today && (
                      <div className="text-sm text-muted-foreground">
                        No metrics available
                      </div>
                    )}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
