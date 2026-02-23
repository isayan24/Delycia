import { useState } from 'react'
import { useStaffQuery } from '@/hooks/queries/useStaffQuery'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
import { useCreateStaffMutation } from '@/hooks/mutations/useCreateStaffMutation'
import { useUpdateStaffMutation } from '@/hooks/mutations/useUpdateStaffMutation'
import { useDeactivateStaffMutation } from '@/hooks/mutations/useDeactivateStaffMutation'
import { useDeleteStaffMutation } from '@/hooks/mutations/useDeleteStaffMutation'
import { useToast } from '@/hooks/use-toast'
import { StaffForm } from './StaffForm'
import type { StaffFormData } from '@/schemas/staffSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Search, Edit, Ban, Eye, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Label } from '@/components/ui/label'

export function StaffList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [restaurantId, setRestaurantId] = useState<string>('all')
  const [role, setRole] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')

  // Sheet dialog state for create/edit
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any | null>(null)

  // AlertDialog state for deactivation
  const [deactivateTarget, setDeactivateTarget] = useState<any | null>(null)
  // AlertDialog state for deletion
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('')

  const { data, isLoading, isError, error } = useStaffQuery({
    page,
    limit,
    search: search || undefined,
    restaurant_id: restaurantId === 'all' ? undefined : restaurantId,
    role: role === 'all' ? undefined : role,
    status: status === 'all' ? undefined : status,
  })

  // Fetch restaurants for filter dropdown and form
  const { data: restaurantsData, isLoading: isLoadingRestaurants } =
    useRestaurantsQuery()

  const createStaffMutation = useCreateStaffMutation()
  const updateStaffMutation = useUpdateStaffMutation()
  const deactivateStaffMutation = useDeactivateStaffMutation()
  const deleteStaffMutation = useDeleteStaffMutation()

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleView = (id: number) => {
    navigate({ to: '/staff/$id', params: { id: id.toString() } })
  }

  const handleCreate = () => {
    setEditingStaff(null)
    setSheetOpen(true)
  }

  const handleEdit = (member: any) => {
    setEditingStaff(member)
    setSheetOpen(true)
  }

  const handleDeactivate = (member: any) => {
    setDeactivateTarget(member)
  }

  const handleDelete = (staff: any) => {
    setDeleteTarget(staff)
    setDeleteConfirmationName('')
  }

  const handleFormSubmit = async (formData: StaffFormData) => {
    try {
      if (editingStaff) {
        // Update staff member
        const updates: any = { id: editingStaff.id }

        // Only include fields that have values
        if (formData.name) updates.name = formData.name
        if (formData.phone_number) updates.phone_number = formData.phone_number
        if (formData.role) updates.role = formData.role
        if (formData.restaurant_id)
          updates.restaurant_id = formData.restaurant_id

        await updateStaffMutation.mutateAsync(updates)

        toast({
          title: 'Success',
          description: 'Staff member updated successfully',
        })

        setSheetOpen(false)
        setEditingStaff(null)
      } else {
        // Create new staff member
        await createStaffMutation.mutateAsync(formData)

        toast({
          title: 'Success',
          description: 'Staff member created successfully',
        })

        setSheetOpen(false)
        setEditingStaff(null)
      }
    } catch (err: any) {
      console.error('Form submission error:', err)

      // Extract error message from response
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        'An error occurred. Please try again.'

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const getRoleName = (roleValue: number) => {
    const roleMap: Record<number, string> = {
      10: 'Staff',
      50: 'Manager',
      100: 'Admin',
    }
    return roleMap[roleValue] || `Role ${roleValue}`
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold">
            Error loading staff
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  const staff = (data as any)?.data || []
  const pagination = (data as any)?.pagination
  const restaurants = (restaurantsData as any)?.data || []

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={restaurantId} onValueChange={setRestaurantId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Restaurant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants</SelectItem>
                {isLoadingRestaurants ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  restaurants.map((restaurant: any) => (
                    <SelectItem
                      key={restaurant.id}
                      value={restaurant.id.toString()}
                    >
                      {restaurant.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="10">Staff</SelectItem>
                <SelectItem value="50">Manager</SelectItem>
                <SelectItem value="100">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.restaurant_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleName(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'active' ? 'success' : 'secondary'
                        }
                      >
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(member.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(member)}
                          disabled={member.status !== 'active'}
                        >
                          <Ban className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, pagination.total)} of {pagination.total}{' '}
              results
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingStaff ? 'Edit Staff Member' : 'Create Staff Member'}
            </SheetTitle>
            <SheetDescription>
              {editingStaff
                ? `Editing "${editingStaff.name}"`
                : 'Add a new staff member to the system'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <StaffForm
              staff={editingStaff}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setSheetOpen(false)
                setEditingStaff(null)
              }}
              isSubmitting={
                createStaffMutation.isPending || updateStaffMutation.isPending
              }
              restaurants={restaurants}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{deactivateTarget?.name}"?
              This will remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deactivateStaffMutation.mutateAsync(
                    deactivateTarget?.id,
                  )

                  toast({
                    title: 'Success',
                    description: 'Staff member deactivated successfully',
                  })

                  setDeactivateTarget(null)
                } catch (err: any) {
                  console.error('Deactivation error:', err)

                  const errorMessage =
                    err?.message ||
                    err?.response?.data?.message ||
                    'Failed to deactivate staff member. Please try again.'

                  toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                  })

                  setDeactivateTarget(null)
                }
              }}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Permanently Delete Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to <strong>permanently delete</strong> "
                {deleteTarget?.name}"? This action cannot be undone and will
                remove all their access immediately.
              </p>
              <div className="space-y-2 mt-4">
                <Label htmlFor="confirm-delete" className="font-semibold">
                  Please type{' '}
                  <span className="text-foreground border px-1.5 py-0.5 rounded-sm select-all">
                    {deleteTarget?.name}
                  </span>{' '}
                  to confirm.
                </Label>
                <Input
                  id="confirm-delete"
                  value={deleteConfirmationName}
                  onChange={(e) => setDeleteConfirmationName(e.target.value)}
                  placeholder={deleteTarget?.name || ''}
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmationName('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                deleteConfirmationName !== deleteTarget?.name ||
                deleteStaffMutation.isPending
              }
              onClick={async () => {
                try {
                  await deleteStaffMutation.mutateAsync(deleteTarget?.id)

                  toast({
                    title: 'Success',
                    description: 'Staff member permanently deleted',
                  })

                  setDeleteTarget(null)
                  setDeleteConfirmationName('')
                } catch (err: any) {
                  console.error('Delete error:', err)

                  const errorMessage =
                    err?.message ||
                    err?.response?.data?.message ||
                    'Failed to delete staff member. Please try again.'

                  toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                  })

                  setDeleteTarget(null)
                  setDeleteConfirmationName('')
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStaffMutation.isPending
                ? 'Deleting...'
                : 'Permanently Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
