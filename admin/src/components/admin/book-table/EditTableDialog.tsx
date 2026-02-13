import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Save, X, Loader2 } from 'lucide-react'
import {
  useUpdateTableMutation,
  type Zone,
} from '@/hooks/queries/useTablesQuery'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import useToast from '@/hooks/UseToast'

interface EditTableDialogProps {
  isOpen: boolean
  onClose: () => void
  table: {
    id: number
    table_number: string
    capacity?: number
    zone: string
    status: string
  } | null
  zones: Zone[]
}

export default function EditTableDialog({
  isOpen,
  onClose,
  table,
  zones,
}: EditTableDialogProps) {
  const { user } = useAdminAuthQuery()
  const { showSuccess, showError } = useToast()
  const updateMutation = useUpdateTableMutation()

  // Form state
  const [tableNumber, setTableNumber] = useState('')
  const [capacity, setCapacity] = useState(4)
  const [selectedZone, setSelectedZone] = useState('')
  const [isCreatingNewZone, setIsCreatingNewZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync form state whenever the dialog opens or the table prop changes
  useEffect(() => {
    if (table && isOpen) {
      setTableNumber(table.table_number)
      setCapacity(table.capacity ?? 4)
      setSelectedZone(table.zone)
      setIsCreatingNewZone(false)
      setNewZoneName('')
      setErrors({})
    }
  }, [table, isOpen])

  const zoneNames = zones.map((z) => z.zone).filter(Boolean)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required'
    }

    if (capacity < 1 || capacity > 50) {
      newErrors.capacity = 'Capacity must be between 1 and 50'
    }

    const finalZone = isCreatingNewZone ? newZoneName.trim() : selectedZone
    if (!finalZone) {
      newErrors.zone = 'Zone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!table || !user?.selected_rid) return
    if (!validate()) return

    const finalZone = isCreatingNewZone ? newZoneName.trim() : selectedZone

    updateMutation.mutate(
      {
        id: table.id,
        rid: user.selected_rid,
        table_number: tableNumber.trim(),
        capacity,
        zone: finalZone,
      },
      {
        onSuccess: () => {
          showSuccess('Success', 'Table updated successfully')
          onClose()
        },
        onError: (error: any) => {
          showError(
            'Error',
            error.response?.data?.message || 'Failed to update table',
          )
        },
      },
    )
  }

  if (!table) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✏️ Edit Table {table.table_number}
          </DialogTitle>
          <DialogDescription>
            Update the table details. You can also move this table to a
            different zone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Table Number */}
          <div className="space-y-2">
            <Label htmlFor="edit-table-number">Table Number</Label>
            <Input
              id="edit-table-number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 1, VIP1"
              className={errors.tableNumber ? 'border-red-500' : ''}
            />
            {errors.tableNumber && (
              <p className="text-sm text-red-500">{errors.tableNumber}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="edit-capacity">Capacity</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Input
                id="edit-capacity"
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className={`w-24 ${errors.capacity ? 'border-red-500' : ''}`}
              />
              <span className="text-sm text-gray-500">people</span>
            </div>
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          {/* Zone */}
          <div className="space-y-2">
            <Label>Zone</Label>
            {!isCreatingNewZone ? (
              <div className="flex gap-2">
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger
                    className={errors.zone ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneNames.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewZone(true)}
                  type="button"
                >
                  New
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter new zone name"
                  className={errors.zone ? 'border-red-500' : ''}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsCreatingNewZone(false)
                    setNewZoneName('')
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.zone && (
              <p className="text-sm text-red-500">{errors.zone}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            type="button"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
