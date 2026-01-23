import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Loader2, Shield, User, Trash2 } from 'lucide-react'

import {
  useStaffQuery,
  StaffMember,
  useDeleteStaffMutation,
} from '@/hooks/queries/useStaffQueries'
import { EditStaffSheet } from './EditStaffSheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye } from 'lucide-react'
import { getRoleBadge } from './helpers/getRoleBadge'

export function StaffList() {
  const { data: staff, isLoading } = useStaffQuery()
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [viewPassword, setViewPassword] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteStaffMutation()

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!staff?.length) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50/50">
        <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">
          No staff members found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-1">
          Add your first staff member to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell>{member.username || '-'}</TableCell>
                <TableCell>{member.phone_number || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setViewPassword(member.password || 'No password set')
                    }
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStaff(member)}
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteId(member.uid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditStaffSheet
        staff={selectedStaff}
        open={!!selectedStaff}
        onOpenChange={(open) => !open && setSelectedStaff(null)}
      />

      <ViewPasswordDialog
        password={viewPassword}
        open={!!viewPassword}
        onOpenChange={(open) => !open && setViewPassword(null)}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              staff member and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ViewPasswordDialog({
  password,
  open,
  onOpenChange,
}: {
  password: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Staff Password</DialogTitle>
          <DialogDescription>
            Current password for the selected staff member.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={password || ''} readOnly />
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
