import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  useSubscriptionPlansQuery,
  type SubscriptionPlan,
} from '@/hooks/queries/useSubscriptionPlansQuery'
import {
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeactivatePlanMutation,
} from '@/hooks/mutations/useSubscriptionMutations'
import { SubscriptionPlanForm } from './SubscriptionPlanForm'
import type { SubscriptionPlanFormData } from '@/schemas/subscriptionSchema'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Edit, Power, Plus, Star, Crown } from 'lucide-react'

/** Parse the JSON `features` column into an array */
function parseFeatures(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const BILLING_LABEL: Record<string, string> = {
  month: 'Monthly',
  year: 'Yearly',
  trial: 'Trial',
}

export function SubscriptionPlanList() {
  const { data, isLoading, isError, error } = useSubscriptionPlansQuery()
  const createPlan = useCreatePlanMutation()
  const updatePlan = useUpdatePlanMutation()
  const deactivatePlan = useDeactivatePlanMutation()
  const { toast } = useToast()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [deactivateTarget, setDeactivateTarget] =
    useState<SubscriptionPlan | null>(null)

  // ── Handlers ────────────────────────────────────────────
  const handleCreate = () => {
    setEditingPlan(null)
    setSheetOpen(true)
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setSheetOpen(true)
  }

  const handleFormSubmit = async (formData: SubscriptionPlanFormData) => {
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...formData })
        toast({
          title: 'Plan updated',
          description: `"${formData.plan_name}" has been updated.`,
        })
      } else {
        await createPlan.mutateAsync(formData)
        toast({
          title: 'Plan created',
          description: `"${formData.plan_name}" has been created.`,
        })
      }
      setSheetOpen(false)
      setEditingPlan(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'Something went wrong',
      })
    }
  }

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    try {
      await deactivatePlan.mutateAsync(deactivateTarget.id)
      toast({
        title: 'Plan deactivated',
        description: `"${deactivateTarget.plan_name}" has been deactivated.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'Failed to deactivate plan',
      })
    } finally {
      setDeactivateTarget(null)
    }
  }

  // ── Column Definitions ──────────────────────────────────
  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: 'plan_name',
      header: 'Plan',
      cell: ({ row }: any) => {
        const plan = row.original as SubscriptionPlan
        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium flex items-center gap-1.5">
                {plan.plan_name}
                {!!plan.is_popular && (
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {plan.plan_code}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => {
        const plan = row.original as SubscriptionPlan
        return (
          <div>
            <div className="font-semibold">
              ₹{Number(plan.price).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground">
              /{BILLING_LABEL[plan.billing_period] || plan.billing_period} (
              {plan.billing_days}d)
            </div>
          </div>
        )
      },
    },
    {
      id: 'features',
      header: 'Features',
      cell: ({ row }: any) => {
        const plan = row.original as SubscriptionPlan
        const features = parseFeatures(plan.features)
        const display = features.slice(0, 3)
        const remaining = features.length - 3
        return (
          <div className="flex flex-wrap gap-1 max-w-[300px]">
            {display.map((f) => (
              <Badge
                key={f}
                variant="secondary"
                className="text-xs font-normal"
              >
                {f}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remaining} more
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'usage',
      header: 'Usage',
      cell: ({ row }: any) => {
        const plan = row.original as SubscriptionPlan
        return (
          <div className="text-sm">
            <div>{plan.active_subscriptions || 0} active</div>
            <div className="text-xs text-muted-foreground">
              {plan.total_restaurants || 0} restaurants
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'max_restaurants',
      header: 'Max Rest.',
      cell: ({ row }: any) => {
        const val = row.original.max_restaurants
        return (
          <div className="flex items-center gap-1">
            <Crown className="h-3.5 w-3.5 text-muted-foreground" />
            {val >= 999 ? '∞' : val}
          </div>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => {
        const active = !!row.original.is_active
        return (
          <Badge variant={active ? 'default' : 'secondary'}>
            {active ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => {
        const plan = row.original as SubscriptionPlan
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEdit(plan)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeactivateTarget(plan)}
              disabled={!plan.is_active}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // ── Error State ─────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">Error loading subscription plans</p>
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
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
            <p className="text-sm text-muted-foreground">
              Manage pricing plans for restaurants
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
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
                Array.from({ length: 4 }).map((_, i) => (
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
                    No subscription plans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</SheetTitle>
            <SheetDescription>
              {editingPlan
                ? `Editing "${editingPlan.plan_name}"`
                : 'Add a new subscription plan'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SubscriptionPlanForm
              plan={editingPlan}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setSheetOpen(false)
                setEditingPlan(null)
              }}
              isSubmitting={createPlan.isPending || updatePlan.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Deactivate Confirm */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{deactivateTarget?.plan_name}
              "? Existing subscriptions will continue until their end date, but
              no new assignments can be made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivatePlan.isPending ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
