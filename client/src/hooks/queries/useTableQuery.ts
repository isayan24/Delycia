import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import axiosInstance from '@/lib/axios'

// Helper to determine if we're running on server-side
const isServer = typeof window === 'undefined'

// Get the appropriate axios instance based on environment
const getAxiosInstance = () => {
  if (isServer) return axiosInstance
  return axios
}

export interface Table {
  id: number
  table_number: string
  zone: string
  status: 'available' | 'occupied' | 'reserved' | 'pending'
  capacity: number
  party_size?: number
}

// export interface TablesResponse {
//   statusCode: number
//   message: string
//   tables: Table[]
// }

export function useTableQuery(
  rid: string | number | null,
  tableId: string | null,
) {
  const {
    data: table,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tables', rid, tableId],
    queryFn: async () => {
      if (!rid || !tableId) return null

      const axiosClient = getAxiosInstance()

      const paramName = 'tableId'
      const url = isServer
        ? `/tables/details?rid=${rid}&${paramName}=${tableId}`
        : `/api/tables?rid=${rid}&${paramName}=${tableId}`

      const response = await axiosClient.get<{ table: Table | null }>(url)
      return response.data?.table || null
    },
    enabled: !!rid && !!tableId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    table,
    isLoading,
    error,
  }
}
