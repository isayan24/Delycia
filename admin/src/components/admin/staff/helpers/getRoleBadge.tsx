import { Badge } from '@/components/ui/badge'

export const getRoleBadge = (role: number | string | undefined) => {
  const baseClasses =
    'border-none text-[10px] font-black uppercase tracking-tight px-2 py-0.5'

  switch (role) {
    case 1:
      return (
        <Badge className={`${baseClasses} bg-purple-50 text-purple-600`}>
          Super Admin
        </Badge>
      )
    case 2:
      return (
        <Badge className={`${baseClasses} bg-orange-50 text-orange-600`}>
          Admin
        </Badge>
      )
    case 3:
      return (
        <Badge className={`${baseClasses} bg-indigo-50 text-indigo-600`}>
          Restaurant Owner
        </Badge>
      )
    case 4:
      return (
        <Badge className={`${baseClasses} bg-emerald-50 text-emerald-600`}>
          Restaurant Manager
        </Badge>
      )
    case 5:
      return (
        <Badge className={`${baseClasses} bg-blue-50 text-blue-600`}>
          Waiter
        </Badge>
      )
    case 6:
      return (
        <Badge className={`${baseClasses} bg-amber-50 text-amber-600`}>
          Kitchen Staff
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className={baseClasses}>
          Unknown
        </Badge>
      )
  }
}
