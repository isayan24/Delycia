import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useSubscriptionPlansQuery, type SubscriptionPlan } from '@/hooks/queries/useSubscriptionPlansQuery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Edit, Power } from 'lucide-react'

export function SubscriptionPlanList() {
  const { data, isLoading, isError, error } = useSubscriptionPlansQuery()

  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.getValue('description') || 'No description'}
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => {
        const price = parseFloat(row.getValue('price'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: 'billing_cycle',
      header: 'Billing Period',
      cell: ({ row }: any) => {
        const cycle = row.getValue('billing_cycle') as string
        return (
          <Badge variant="outline" className="capitalize">
            {cycle}
          </Badge>
        )
      },
    },
    {
      id: 'features',
      header: 'Features',
      cell: ({ row }: any) => {
        const plan = row.original
        return (
          <div className="text-sm space-y-1">
            <div>Menu Items: {plan.max_menu_items}</div>
            <div>Staff: {plan.max_staff_count}</div>
            <div>Orders/mo: {plan.max_monthly_orders}</div>
          </div>
        )
      },
    },
    {
      id: 'additional_features',
      header: 'Additional',
      cell: ({ row }: any) => {
        const plan = row.original
        const features = []
        if (plan.custom_branding) features.push('Branding')
        if (plan.analytics_access) features.push('Analytics')
        if (plan.api_access) features.push('API')
        if (plan.priority_support) features.push('Support')
        
        return (
          <div className="flex flex-wrap gap-1">
            {features.length > 0 ? (
              features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">None</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => {
        const isActive = row.getValue('is_active')
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const plan = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewStats(plan.id)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(plan.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeactivate(plan.id)}
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

  const handleViewStats = (id: number) => {
    // TODO: Implement view stats
    console.log('View stats for plan:', id)
  }

  const handleEdit = (id: number) => {
    // TODO: Implement edit
    console.log('Edit plan:', id)
  }

  const handleDeactivate = (id: number) => {
    // TODO: Implement deactivate
    console.log('Deactivate plan:', id)
  }

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
    <div className="space-y-4">
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
  )
}
