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
import { Loader2 } from 'lucide-react'
import { useDeleteTableMutation } from '@/hooks/queries/useTablesQuery'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import useToast from '@/hooks/UseToast'

interface DeleteTableDialogProps {
  isOpen: boolean
  onClose: () => void
  table: {
    id: number
    table_number: string
    zone: string
  } | null
}

export default function DeleteTableDialog({
  isOpen,
  onClose,
  table,
}: DeleteTableDialogProps) {
  const { user } = useAdminAuthQuery()
  const { showSuccess, showError } = useToast()
  const deleteMutation = useDeleteTableMutation()

  const handleConfirmDelete = () => {
    if (!table || !user?.selected_rid) return

    deleteMutation.mutate(
      {
        id: table.id,
        rid: user.selected_rid,
      },
      {
        onSuccess: () => {
          showSuccess('Deleted', `Table ${table.table_number} has been removed`)
          onClose()
        },
        onError: (error: any) => {
          showError(
            'Error',
            error.response?.data?.message || 'Failed to delete table',
          )
        },
      },
    )
  }

  if (!table) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Table {table.table_number}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Table {table.table_number}
            </span>{' '}
            from the <span className="font-medium">{table.zone}</span> zone.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete Table'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
