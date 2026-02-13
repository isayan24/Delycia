import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Menu, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTablesAndZones } from '@/hooks/queries/useTablesQuery'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShowTablesProps } from './types/table.types'
import { useTableStore } from '@/store/useTableStore'
import TableCard from './TableCard'
import TableOrdersPopup from './TableOrdersPopup'
import EditTableDialog from './EditTableDialog'
import DeleteTableDialog from './DeleteTableDialog'

export default function ShowTables({
  selectTable,
  handleShowAddTables,
  handleShowDeleteTables,
}: ShowTablesProps) {
  const { user } = useAdminAuthQuery()
  const [activeZone, setActiveZone] = useState<string>('All')

  // Popup state
  const [selectedPopupTable, setSelectedPopupTable] = useState<any>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Edit / Delete dialog state
  const [editingTable, setEditingTable] = useState<any>(null)
  const [deletingTable, setDeletingTable] = useState<any>(null)

  const { setRefetchTablesFunction } = useTableStore()
  const {
    zones,
    tables,
    isLoading: loading,
    error,
    refetch,
  } = useTablesAndZones(user?.selected_rid)

  // pass the refetch function to the store
  useEffect(() => {
    if (user?.selected_rid) {
      const refetchAsync = async () => {
        await refetch()
      }
      setRefetchTablesFunction(refetchAsync)
    }
    return () => {
      setRefetchTablesFunction(null)
    }
  }, [user?.selected_rid, setRefetchTablesFunction, refetch])

  // Extract unique zones for tabs
  const uniqueZones = useMemo(() => {
    try {
      if (!zones || !Array.isArray(zones)) {
        return ['All']
      }
      const zoneNames = zones
        .filter((zone) => zone && typeof zone.zone === 'string')
        .map((zone) => zone.zone)
        .filter(Boolean)
      return ['All', ...zoneNames]
    } catch (error) {
      console.error('Error processing zones:', error)
      return ['All']
    }
  }, [zones])

  // Ensure activeZone is valid
  useEffect(() => {
    if (uniqueZones.length > 0 && !uniqueZones.includes(activeZone)) {
      setActiveZone('All')
    }
  }, [uniqueZones, activeZone])

  // Filter tables based on activeZone
  const filteredTables = useMemo(() => {
    if (activeZone === 'All') {
      return tables
    }
    return tables.filter((table: any) => table.zone === activeZone)
  }, [tables, activeZone])

  // Safe table data with fallback values
  const safeFilteredTables = useMemo(() => {
    try {
      if (!filteredTables || !Array.isArray(filteredTables)) {
        return []
      }
      return filteredTables
        .filter(
          (table) =>
            table &&
            typeof table.id !== 'undefined' &&
            typeof table.table_number === 'string' &&
            typeof table.status === 'string',
        )
        .sort((a, b) => parseInt(a.table_number) - parseInt(b.table_number))
    } catch (error) {
      console.error('Error processing filtered tables:', error)
      return []
    }
  }, [filteredTables])

  const handleTableLongPress = (table: any) => {
    setSelectedPopupTable(table)
    setIsPopupOpen(true)
  }

  // Helper to render tables for a specific zone
  const renderTablesForZone = (zoneName: string) => {
    const zoneTables = safeFilteredTables.filter(
      (table) => table.zone === zoneName,
    )

    if (zoneTables.length === 0) return null

    return (
      <div key={zoneName} className="mb-8 last:mb-0">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 px-1">
          {zoneName}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {zoneTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onSelect={selectTable}
              onLongPress={handleTableLongPress}
              onEdit={setEditingTable}
              onDelete={setDeletingTable}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dark:bg-gray-900 p-4 md:p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🍽️</span> Tables
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end" forceMount>
            <DropdownMenuItem
              onClick={handleShowAddTables}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Tables</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleShowDeleteTables}
              className="cursor-pointer text-red-600 hover:!text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Delete Tables</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading && user?.selected_rid && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500 dark:text-red-400">
            Error loading tables. Please try again.
          </div>
        </div>
      )}

      {!loading && !error && user?.restaurant_rids?.[0] && (
        <>
          <Tabs
            value={activeZone}
            onValueChange={setActiveZone}
            className="mb-6"
          >
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 justify-start">
              {uniqueZones.map((zone) => (
                <TabsTrigger
                  key={zone}
                  value={zone}
                  className="rounded-full px-4 py-2 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:bg-gray-800"
                >
                  {zone}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="All" className="mt-4">
              {safeFilteredTables.length === 0 ? (
                <div className="flex justify-center items-center py-12 text-gray-500">
                  No tables available.
                </div>
              ) : (
                uniqueZones
                  .filter((z) => z !== 'All')
                  .map((zone) => renderTablesForZone(zone))
              )}
            </TabsContent>

            {uniqueZones
              .filter((z) => z !== 'All')
              .map((zone) => (
                <TabsContent key={zone} value={zone} className="mt-4">
                  {safeFilteredTables.length === 0 ? (
                    <div className="flex justify-center items-center py-12 text-gray-500">
                      No tables in {zone}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                      {safeFilteredTables.map((table) => (
                        <TableCard
                          key={table.id}
                          table={table}
                          onSelect={selectTable}
                          onLongPress={handleTableLongPress}
                          onEdit={setEditingTable}
                          onDelete={setDeletingTable}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
          </Tabs>
        </>
      )}

      <TableOrdersPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onRefresh={refetch}
        tableData={selectedPopupTable}
      />

      <EditTableDialog
        isOpen={!!editingTable}
        onClose={() => setEditingTable(null)}
        table={editingTable}
        zones={zones}
      />

      <DeleteTableDialog
        isOpen={!!deletingTable}
        onClose={() => setDeletingTable(null)}
        table={deletingTable}
      />
    </div>
  )
}
