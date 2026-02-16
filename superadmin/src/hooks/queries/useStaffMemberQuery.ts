import { useQuery } from '@tanstack/react-query'
import { getStaffMember } from '@/lib/api/staff'

export function useStaffMemberQuery(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => getStaffMember({ data: { id } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
