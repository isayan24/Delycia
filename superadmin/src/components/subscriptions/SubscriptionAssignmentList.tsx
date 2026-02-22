import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  useRestaurantsQuery,
  type Restaurant,
} from '@/hooks/queries/useRestaurantsQuery'
import { useAssignSubscriptionMutation } from '@/hooks/mutations/useSubscriptionMutations'
import { SubscriptionAssignmentForm } from './SubscriptionAssignmentForm'
import type { SubscriptionAssignmentFormData } from '@/schemas/subscriptionSchema'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Store } from 'lucide-react'

export function SubscriptionAssignmentList() {
  const { data, isLoading, isError, error } = useRestaurantsQuery({
    limit: 500,
  })
  const assignMutation = useAssignSubscriptionMutation()
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleAssign = async (formData: SubscriptionAssignmentFormData) => {
    try {
      const result = await assignMutation.mutateAsync(formData)
      if (result?.statusCode === 201) {
        toast({
          title: 'Subscription assigned',
          description: 'Plan has been assigned to the restaurant.',
        })
        setSheetOpen(false)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result?.error || 'Failed to assign subscription',
        })
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'Failed to assign subscription',
      })
    }
  }

  const columns: ColumnDef<Restaurant>[] = [
    {
      accessorKey: 'name',
      header: 'Restaurant',
      cell: ({ row }: any) => {
        const r = row.original as Restaurant
        return (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="font-medium">{r.name}</div>
              {r.username && (
                <div className="text-xs text-muted-foreground">
                  @{r.username}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'subscription_plan_name',
      header: 'Plan',
      cell: ({ row }: any) => {
        const r = row.original as Restaurant
        return r.subscription_plan_name ? (
          <Badge variant="outline">{r.subscription_plan_name}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No plan</span>
        )
      },
    },
    {
      accessorKey: 'subscription_status',
      header: 'Status',
      cell: ({ row }: any) => {
        const r = row.original as Restaurant
        if (!r.subscription_status) {
          return <Badge variant="secondary">Unsubscribed</Badge>
        }
        const statusVariant =
          r.subscription_status === 'active'
            ? 'default'
            : r.subscription_status === 'expired'
              ? 'secondary'
              : 'destructive'
        return (
          <Badge variant={statusVariant as any} className="capitalize">
            {r.subscription_status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Restaurant Status',
      cell: ({ row }: any) => {
        const active = row.original.is_active
        return (
          <Badge variant={active ? 'default' : 'secondary'}>
            {active ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
  ]

  const restaurants = data?.data || []

  const table = useReactTable({
    data: restaurants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">Error loading restaurant data</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Subscription Assignments</h2>
            <p className="text-sm text-muted-foreground">
              View and assign subscription plans to restaurants
            </p>
          </div>
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Plan
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, ci) => (
                      <TableCell key={ci}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No restaurants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Assign Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign Subscription Plan</SheetTitle>
            <SheetDescription>
              Assign a plan to a restaurant that doesn't have an active
              subscription
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SubscriptionAssignmentForm
              onSubmit={handleAssign}
              onCancel={() => setSheetOpen(false)}
              isSubmitting={assignMutation.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
