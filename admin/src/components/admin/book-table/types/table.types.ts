// API Response Types
export interface ApiTableResponse {
  id: number
  table_number: string
  zone: string
  status: 'available' | 'occupied' | 'reserved' | 'pending'
  capacity?: number
  created_at?: string
  updated_at?: string
}

export interface ApiZoneResponse {
  zone: string
  table_count?: number
}

// Internal Component Types
export interface TableData {
  id: number
  table_number: string
  zone: string
  status: 'available' | 'occupied' | 'reserved' | 'pending'
  capacity: number
}

export interface ZoneData {
  zone: string
}

// Delete Table Types
export interface TableToDelete {
  id: string
  table_number: string
  capacity: number
  zone: string
  status: string
}

export interface DeleteTableRequest {
  id: string
}

export interface DeleteTableResponse {
  message: string
  deleted_table_id: string
}

export interface DeleteTableError {
  error: string
  details?: string
}

// Component Props
export interface ShowTablesProps {
  selectTable: (table: any) => void
  handleShowAddTables: () => void
  handleShowDeleteTables?: () => void
}

export interface DeleteTablesComponentProps {
  onTablesDeleted?: () => void
  clickedBackToTables?: () => void
}

// Hook Return Type
export interface UseFetchTableReturn {
  tables: ApiTableResponse[]
  zones: ApiZoneResponse[]
  loading: boolean
  error: any
  fetchTables: (rid: string) => void
}
