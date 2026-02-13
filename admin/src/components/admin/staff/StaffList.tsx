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
import { Edit2, Loader2, User, Trash2, Phone, UserCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

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
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, AlertTriangle } from 'lucide-react'
import { getRoleBadge } from './helpers/getRoleBadge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function StaffList() {
  const { data: staff, isLoading } = useStaffQuery()
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [viewPassword, setViewPassword] = useState<string | null>(null)
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const deleteMutation = useDeleteStaffMutation()

  const handleDelete = () => {
    if (staffToDelete && deleteConfirmation === staffToDelete.name) {
      deleteMutation.mutate(staffToDelete.uid, {
        onSuccess: () => {
          setStaffToDelete(null)
          setDeleteConfirmation('')
        },
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
      <div className="space-y-4">
        {/* Desktop View */}
        <div className="hidden md:block rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow
                  key={member.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-bold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-900">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="text-gray-600 font-mono text-xs">
                    {member.username || '-'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {member.phone_number || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/5"
                              onClick={() =>
                                setViewPassword(
                                  member.password || 'No password set',
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Password</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => setSelectedStaff(member)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Staff</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                                onClick={() => {
                                  setStaffToDelete(member)
                                  setDeleteConfirmation('')
                                }}
                                disabled={member.role === 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.role === 2
                              ? 'Cannot delete admin'
                              : 'Delete Staff'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence>
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 rounded-xl border shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-base font-bold text-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      Username
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <UserCircle className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-mono text-xs">
                        {member.username || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      Phone
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">
                        {member.phone_number || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 gap-2 text-gray-600"
                    onClick={() =>
                      setViewPassword(member.password || 'No password set')
                    }
                  >
                    <Eye className="h-4 w-4" />
                    Pass
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 gap-2 text-amber-600 border-amber-100 bg-amber-50/30"
                    onClick={() => setSelectedStaff(member)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 px-0 text-red-500 border-red-100 bg-red-50/30 disabled:opacity-30"
                    onClick={() => {
                      setStaffToDelete(member)
                      setDeleteConfirmation('')
                    }}
                    disabled={member.role === 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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

      <Dialog
        open={!!staffToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setStaffToDelete(null)
            setDeleteConfirmation('')
          }
        }}
      >
        <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Staff Member
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold text-gray-900">
                {staffToDelete?.name}
              </span>{' '}
              and remove their data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="confirmation-input"
                className="text-sm font-medium"
              >
                To confirm, type{' '}
                <span className="font-bold select-all">
                  {staffToDelete?.name}
                </span>{' '}
                below:
              </Label>
              <Input
                id="confirmation-input"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type staff name to confirm"
                className="border-red-200 focus-visible:ring-red-500 rounded-xl"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={
                deleteMutation.isPending ||
                deleteConfirmation !== staffToDelete?.name
              }
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Staff'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
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
            <Input
              id="link"
              defaultValue={password || ''}
              readOnly
              className="rounded-xl bg-gray-50 border-gray-100"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
