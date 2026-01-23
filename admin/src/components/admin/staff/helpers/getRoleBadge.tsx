import { Badge } from '@/components/ui/badge'

export const getRoleBadge = (role: number | string | undefined) => {
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
      return <Badge className="bg-yellow-500">Kitchen Staff</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}
