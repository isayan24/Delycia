import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Menu, Plus, Trash2, Users } from 'lucide-react'
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
import { motion, AnimatePresence } from 'motion/react'
import { Badge } from '@/components/ui/badge'

export default function ShowTables({
  selectTable,
  handleShowAddTables,
  handleShowDeleteTables,
}: ShowTablesProps) {
  const { user } = useAdminAuthQuery()
  const [activeZone, setActiveZone] = useState<string>('all')

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

  // Pass the refetch function to the store
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

  // Process zones for tabs
  const safeZones = useMemo(() => {
    if (!zones || !Array.isArray(zones)) return []
    return zones
      .filter((z) => z && z.zone)
      .sort((a, b) => a.zone.localeCompare(b.zone))
  }, [zones])

  const handleTableLongPress = (table: any) => {
    setSelectedPopupTable(table)
    setIsPopupOpen(true)
  }

  if (loading && user?.selected_rid) {
    return (
      <div className="flex flex-col p-4 sm:p-6 bg-[#fcfcfd] dark:bg-gray-950 min-h-full">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-2 mb-8 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-24 rounded-2xl shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className="aspect-3/4 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full mb-4">
          <Trash2 className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Failed to load tables
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs mb-6">
          Something went wrong while fetching the table data.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-xl"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar bg-[#fcfcfd] dark:bg-gray-950 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl shadow-inner">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Tables
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold"
              >
                {tables.filter((t) => t.status === 'available').length}{' '}
                AVAILABLE
              </Badge>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50 text-[10px] font-bold"
              >
                {tables.filter((t) => t.status === 'occupied').length} OCCUPIED
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-10 w-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:translate-y-[-2px] transition-all"
            onClick={handleShowAddTables}
          >
            <Plus className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:translate-y-[-2px] transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 p-1 rounded-xl shadow-2xl border-gray-200 dark:border-gray-800 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90"
            >
              <DropdownMenuItem
                onClick={handleShowAddTables}
                className="rounded-lg py-2.5 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Tables
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleShowDeleteTables}
                className="focus:bg-red-50 dark:focus:bg-red-950 text-red-700! rounded-lg py-2.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modern Tabs Section */}
      <Tabs value={activeZone} onValueChange={setActiveZone} className="w-full">
        <div className="mb-10 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-11 p-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl gap-1 w-max sm:w-auto inline-flex shadow-sm flex-shrink-0">
            <TabsTrigger
              value="all"
              className="px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-sm font-semibold"
            >
              All
            </TabsTrigger>
            {safeZones.map((zone) => (
              <TabsTrigger
                key={zone.zone}
                value={zone.zone}
                className="px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-sm font-semibold"
              >
                {zone.zone}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="all" className="outline-none mt-0">
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {safeZones.length === 0 && tables.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-medium italic">
                  No tables found
                </div>
              ) : (
                safeZones.map((zone, zoneIdx) => {
                  const zoneTables = tables.filter((t) => t.zone === zone.zone)
                  if (zoneTables.length === 0) return null

                  return (
                    <motion.div
                      key={zone.zone}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: zoneIdx * 0.1, duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                          {zone.zone}
                        </h2>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800/50" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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
                    </motion.div>
                  )
                })
              )}

              {/* Handle tables without a zone if any */}
              {tables.filter((t) => !t.zone).length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                      Unassigned
                    </h2>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800/50" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                    {tables
                      .filter((t) => !t.zone)
                      .map((table) => (
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
              )}
            </motion.div>
          </TabsContent>

          {safeZones.map((zone) => {
            const zoneTables = tables.filter((t) => t.zone === zone.zone)
            return (
              <TabsContent
                key={zone.zone}
                value={zone.zone}
                className="outline-none mt-0"
              >
                <motion.div
                  key={zone.zone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6"
                >
                  {zoneTables.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium italic">
                      No tables found in {zone.zone}
                    </div>
                  ) : (
                    zoneTables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onSelect={selectTable}
                        onLongPress={handleTableLongPress}
                        onEdit={setEditingTable}
                        onDelete={setDeletingTable}
                      />
                    ))
                  )}
                </motion.div>
              </TabsContent>
            )
          })}
        </AnimatePresence>
      </Tabs>

      {/* Overlays & Dialogs */}
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
