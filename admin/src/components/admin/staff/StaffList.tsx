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
import { Edit2, Loader2, Shield, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useStaffQuery, StaffMember } from '@/hooks/queries/useStaffQueries'
import { EditStaffSheet } from './EditStaffSheet'

export function StaffList() {
  const { data: staff, isLoading } = useStaffQuery()
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)

  const getRoleBadge = (role: number) => {
    switch (role) {
      case 2:
        return <Badge className="bg-purple-500">Admin</Badge>
      case 3:
        return <Badge className="bg-indigo-500">Restaurant Owner</Badge>
      case 4:
        return <Badge className="bg-green-500">Restaurant Manager</Badge>
      case 5:
        return <Badge className="bg-blue-500">Waiter</Badge>
      case 6:
        return <Badge className="bg-yellow-500">Delivery</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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
                    onClick={() => setSelectedStaff(member)}
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
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
    </>
  )
}
