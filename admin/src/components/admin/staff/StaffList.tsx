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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      <div className="text-center py-20 border border-[#ead9cd] dark:border-primary/10 rounded-2xl bg-white dark:bg-[#2d1e14] shadow-sm">
        <div className="bg-orange-50 dark:bg-orange-900/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100 dark:border-orange-900/20">
          <User className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
          No staff members detected
        </h3>
        <p className="text-[#a16b45] text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
          Click the add button to onboard your team
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Desktop View */}
        <div className="hidden md:block bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-[#3a291d]/20">
              <TableRow className="border-b border-[#ead9cd] dark:border-primary/5 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                  Staff Member
                </TableHead>
                <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                  Role & Credentials
                </TableHead>
                <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                  Contact Info
                </TableHead>
                <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow
                  key={member.id}
                  className="group cursor-pointer hover:bg-slate-50/30 dark:hover:bg-[#3a291d]/20 border-b border-slate-50 dark:border-primary/5 transition-colors"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-[#3a291d] group-hover:border-orange-200 transition-colors shadow-sm">
                        <AvatarImage src={member.profile_pic || undefined} />
                        <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-medium text-xs uppercase">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs lg:text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-orange-600 transition-colors">
                          {member.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#a16b45] opacity-60 truncate">
                          UID: {member.uid.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="scale-90 origin-left">
                        {getRoleBadge(member.role)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <UserCircle className="h-3 w-3" />
                        {member.username}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-[#a16b45]/40" />
                      {member.phone_number || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-primary/10"
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
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-10 transition-colors"
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
                          <TooltipContent side="right">
                            {member.role === 2
                              ? 'Admin Restricted'
                              : 'Delete Access'}
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
                className="bg-white dark:bg-[#2d1e14] p-4 rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-[#3a291d] shadow-sm">
                      <AvatarImage src={member.profile_pic || undefined} />
                      <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-medium text-sm uppercase">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-tight">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 scale-90 origin-left">
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#a16b45] font-black opacity-60">
                      Username
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <UserCircle className="h-3.5 w-3.5 text-[#a16b45]/40" />
                      <span className="font-bold">{member.username}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#a16b45] font-black opacity-60">
                      Phone
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-[#a16b45]/40" />
                      <span className="font-bold">{member.phone_number}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[#ead9cd]/30 dark:border-primary/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 gap-2 text-slate-500 bg-slate-50 dark:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    onClick={() =>
                      setViewPassword(member.password || 'No password set')
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pass
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 gap-2 text-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    onClick={() => setSelectedStaff(member)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl disabled:opacity-20"
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
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase tracking-tight">
              <AlertTriangle className="h-5 w-5" />
              Revoke Access
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest opacity-60 leading-relaxed">
              This action is permanent. Enter{' '}
              <span className="text-red-600 font-black">
                {staffToDelete?.name}
              </span>{' '}
              to confirm deletion.
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

          <DialogFooter className="gap-3 pt-6 border-t border-slate-50 dark:border-primary/5">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Keep Access
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-red-500/10"
              disabled={
                deleteMutation.isPending ||
                deleteConfirmation !== staffToDelete?.name
              }
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Revoke Access'
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
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl border-[#ead9cd] dark:border-primary/10">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Security Check
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest opacity-60">
            Current access credentials for this staff account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Eye className="h-4 w-4 text-[#a16b45]/40" />
            </div>
            <Input
              id="link"
              defaultValue={password || ''}
              readOnly
              className="rounded-xl bg-slate-50 dark:bg-primary/5 border-[#ead9cd] dark:border-primary/5 pl-10 font-black text-xs text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-[#a16b45]"
          >
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
