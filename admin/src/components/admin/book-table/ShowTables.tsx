import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Menu, User, Users, Trash2, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFetchTable } from './hooks/useFetchTable'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ShowTablesProps } from './types/table.types'
import { useTableStore } from '@/store/useTableStore'
import LoadingScreen from '@/components/common/LoadingScreen'

export default function ShowTables({
  selectTable,
  handleShowAddTables,
  handleShowDeleteTables,
}: ShowTablesProps) {
  const { user } = useAuth()
  const [activeZone, setActiveZone] = useState<string>('')

  const { setRefetchTablesFunction } = useTableStore()
  const { zones, tables, loading, error, fetchTables } = useFetchTable(
    user?.selected_rid,
  )

  // pass the refetch function to the store
  useEffect(() => {
    if (user?.selected_rid) {
      const refetchTables = async () => {
        await fetchTables(user.selected_rid)
      }
      setRefetchTablesFunction(refetchTables)
    }
    // Cleanup function to remove the refetch function when component unmounts
    return () => {
      setRefetchTablesFunction(null)
    }
  }, [user?.selected_rid, setRefetchTablesFunction])

  // Extract unique zones for tabs with error handling
  const uniqueZones = useMemo(() => {
    try {
      if (!zones || !Array.isArray(zones)) {
        return []
      }
      return zones
        .filter((zone) => zone && typeof zone.zone === 'string')
        .map((zone) => zone.zone)
        .filter(Boolean)
    } catch (error) {
      console.error('Error processing zones:', error)
      return []
    }
  }, [zones])

  // Update activeZone when uniqueZones changes
  useEffect(() => {
    if (uniqueZones.length > 0 && !activeZone) {
      setActiveZone(uniqueZones[0])
    }
  }, [uniqueZones, activeZone])

  // Memoized filtered tables based on selected zone
  const filteredTables = useMemo(() => {
    return tables.filter((table: any) => table.zone === activeZone)
  }, [tables, activeZone])

  // Handle zone tab change with validation
  const handleZoneChange = (zone: string) => {
    if (uniqueZones.includes(zone)) {
      setActiveZone(zone)
    }
  }

  // Safe table data with fallback values
  const safeFilteredTables = useMemo(() => {
    try {
      if (!filteredTables || !Array.isArray(filteredTables)) {
        return []
      }
      return filteredTables.filter(
        (table) =>
          table &&
          typeof table.id !== 'undefined' &&
          typeof table.table_number === 'string' &&
          typeof table.status === 'string',
      )
    } catch (error) {
      console.error('Error processing filtered tables:', error)
      return []
    }
  }, [filteredTables])

  const getTableIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return '🍽️'
      case 'reserved':
        return '🍽️'
      case 'available':
        return '🍽️'
      default:
        return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'reserved':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'available':
        return 'border-green-400/50 bg-green-50/20 dark:bg-green-950/20'
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'reserved':
        return 'Reserved'
      case 'available':
        return 'Available'
      default:
        return 'Empty'
    }
  }

  return (
    <div className="dark:bg-gray-900 p-4 md:p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          TABLES
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="">
              <Menu className="h-6 w-6" />
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

            {/* Delete Tables Option */}
            <DropdownMenuItem
              onClick={handleShowDeleteTables}
              className="cursor-pointer text-red-600 hover:!text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              <span>Delete Tables</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading State */}

      {loading && user?.selected_rid && (
        <div className="space-y-4">
          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <Skeleton className="h-4 w-32 mb-4" />
          {/* Tables Grid Skeleton */}
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

      {/* Error State */}
      {error && !loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500 dark:text-red-400">
            Error loading tables. Please try again.
          </div>
        </div>
      )}

      {/* Content when data is loaded */}
      {!loading && !error && user?.restaurant_rids?.[0] && (
        <>
          {/* Dynamic Zone Tabs */}
          <Tabs
            defaultValue={uniqueZones[0]}
            value={activeZone}
            onValueChange={handleZoneChange}
            className="mb-4"
          >
            <TabsList>
              {uniqueZones.map((zone) => (
                <TabsTrigger key={zone} value={zone}>
                  {zone}
                </TabsTrigger>
              ))}
            </TabsList>

            {uniqueZones.map((zone) => (
              <TabsContent key={zone} value={zone}>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {zone === 'all' ? 'All Tables' : `${zone} Tables`}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Empty State */}
          {safeFilteredTables.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                {activeZone === 'all'
                  ? 'No tables available.'
                  : `No tables in ${activeZone} zone.`}
              </div>
            </div>
          )}

          {/* Tables Grid */}
          {safeFilteredTables.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {safeFilteredTables.map((table) => (
                <Card
                  key={table.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(table.status)} ${
                    table.status !== 'available' ? 'border-dashed border-2' : ''
                  }`}
                  onClick={() => selectTable(table)}
                >
                  <CardContent className="p-4 text-center">
                    {/* Table Number */}
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {table.table_number}
                    </div>

                    {/* Table Icon and Status */}
                    {table.status && (
                      <div className="space-y-2">
                        <div className="text-2xl">
                          {getTableIcon(table.status)}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                        </div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {getStatusText(table.status)}
                        </div>
                      </div>
                    )}

                    {/* Status Indicator for pending tables */}
                    {table.status === 'pending' && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
