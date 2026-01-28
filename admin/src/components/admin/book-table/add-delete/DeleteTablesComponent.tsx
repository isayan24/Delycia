import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Trash2,
  Search,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  ArrowLeft,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { SelectAll } from '@mui/icons-material'
import {
  DeleteTableRequest,
  DeleteTableResponse,
  DeleteTablesComponentProps,
  TableToDelete,
} from '../types/table.types'
import { useFetchTable } from '../hooks/useFetchTable'

const DeleteTablesComponent = ({
  onTablesDeleted,
  clickedBackToTables,
}: DeleteTablesComponentProps) => {
  const { user } = useAdminAuthQuery()
  const {
    zones,
    tables,
    loading: dataLoading,
    error: dataError,
  } = useFetchTable(user?.selected_rid)

  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set())
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [localZones, setLocalZones] = useState<any[]>([])
  const [filteredTables, setFilteredTables] = useState<TableToDelete[]>([])

  const { showError, showSuccess } = useToast()

  // Update zones from API data
  useEffect(() => {
    if (zones && zones.length > 0) {
      const uniqueZones = [...new Set(zones.map((zone: any) => zone.zone))]
      setLocalZones(uniqueZones)
    }
  }, [zones])

  // Convert API tables to local format and apply filters
  const processedTables = useMemo(() => {
    if (!tables || !Array.isArray(tables)) return []

    return tables
      .filter((table) => table && table.id && table.table_number)
      .map((table) => ({
        id: table.id.toString(), // Convert to string for consistency
        table_number: table.table_number,
        capacity: table.capacity || 4,
        zone: table.zone || 'Unknown',
        status: table.status || 'available',
      }))
  }, [tables])

  // Apply zone and search filters
  useEffect(() => {
    let filtered = processedTables

    // Zone filter
    if (selectedZone !== 'all') {
      filtered = filtered.filter((table) => table.zone === selectedZone)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (table) =>
          table.table_number.toLowerCase().includes(query) ||
          table.zone.toLowerCase().includes(query) ||
          table.status.toLowerCase().includes(query),
      )
    }

    setFilteredTables(filtered)
  }, [processedTables, selectedZone, searchQuery])

  // Group tables by zone for display
  const groupedTables = useMemo(() => {
    return filteredTables.reduce(
      (acc, table) => {
        if (!acc[table.zone]) {
          acc[table.zone] = []
        }
        acc[table.zone].push(table)
        return acc
      },
      {} as Record<string, TableToDelete[]>,
    )
  }, [filteredTables])

  // Handle individual table selection
  const toggleTableSelection = (tableId: string) => {
    const newSelection = new Set(selectedTables)
    if (newSelection.has(tableId)) {
      newSelection.delete(tableId)
    } else {
      newSelection.add(tableId)
    }
    setSelectedTables(newSelection)
  }

  // Handle select all in current view
  const toggleSelectAll = () => {
    const currentTableIds = filteredTables.map((table) => table.id)
    const allSelected = currentTableIds.every((id) => selectedTables.has(id))

    if (allSelected) {
      // Deselect all current tables
      const newSelection = new Set(selectedTables)
      currentTableIds.forEach((id) => newSelection.delete(id))
      setSelectedTables(newSelection)
    } else {
      // Select all current tables
      const newSelection = new Set(selectedTables)
      currentTableIds.forEach((id) => newSelection.add(id))
      setSelectedTables(newSelection)
    }
  }

  // Handle zone-based selection
  const selectAllInZone = (zone: string) => {
    const zoneTableIds = groupedTables[zone]?.map((table) => table.id) || []
    const newSelection = new Set(selectedTables)
    zoneTableIds.forEach((id) => newSelection.add(id))
    setSelectedTables(newSelection)
  }

  const deselectAllInZone = (zone: string) => {
    const zoneTableIds = groupedTables[zone]?.map((table) => table.id) || []
    const newSelection = new Set(selectedTables)
    zoneTableIds.forEach((id) => newSelection.delete(id))
    setSelectedTables(newSelection)
  }

  // Quick selection functions
  const selectOccupiedTables = () => {
    const occupiedTableIds = filteredTables
      .filter((table) => table.status !== 'available')
      .map((table) => table.id)
    const newSelection = new Set(selectedTables)
    occupiedTableIds.forEach((id) => newSelection.add(id))
    setSelectedTables(newSelection)
  }

  const selectAvailableTables = () => {
    const availableTableIds = filteredTables
      .filter((table) => table.status === 'available')
      .map((table) => table.id)
    const newSelection = new Set(selectedTables)
    availableTableIds.forEach((id) => newSelection.add(id))
    setSelectedTables(newSelection)
  }

  const clearAllSelections = () => {
    setSelectedTables(new Set())
  }

  // Get selected table details
  const selectedTableDetails = useMemo(() => {
    return processedTables.filter((table) => selectedTables.has(table.id))
  }, [processedTables, selectedTables])

  // Delete single table - Fixed to use /api/table with id and in body
  const deleteTable = async (tableId: string): Promise<DeleteTableResponse> => {
    const payload: DeleteTableRequest = {
      id: tableId,
    }

    const response = await axios.delete(`/api/table`, {
      data: payload,
    })

    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Failed to delete table')
    }

    return response.data
  }

  // Delete multiple tables
  const deleteSelectedTables = async () => {
    if (selectedTables.size === 0) return

    setIsDeleting(true)
    const errors: string[] = []
    let successCount = 0
    const totalTables = selectedTables.size

    try {
      for (const tableId of Array.from(selectedTables)) {
        try {
          await deleteTable(tableId)
          successCount++
        } catch (err: any) {
          const table = processedTables.find((t) => t.id === tableId)
          const errorMsg =
            err.response?.data?.error || err.message || 'Unknown error'
          errors.push(`Table ${table?.table_number || tableId}: ${errorMsg}`)
        }
      }

      if (errors.length === 0) {
        showSuccess(
          'Success',
          `Successfully deleted ${successCount} table${successCount !== 1 ? 's' : ''}`,
        )
        setSelectedTables(new Set())
        onTablesDeleted?.()
      } else {
        const message = `${successCount}/${totalTables} tables deleted successfully.${
          errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''
        }`

        if (successCount > 0) {
          showSuccess('Partial Success', message)
          // Remove successfully deleted tables from selection
          const failedTableIds = new Set(
            errors
              .map((error) => {
                const tableNumber = error.split(':')[0].replace('Table ', '')
                const table = processedTables.find(
                  (t) => t.table_number === tableNumber,
                )
                return table?.id
              })
              .filter(Boolean),
          )
          setSelectedTables(failedTableIds as Set<string>)
          onTablesDeleted?.() // Refresh data even on partial success
        } else {
          showError('Error', message)
        }
      }
    } catch (error) {
      console.error('Error deleting tables:', error)
      showError('Error', 'Failed to delete tables. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'reserved':
        return 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
      case 'pending':
        return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return '🍽️'
      case 'reserved':
        return '📅'
      case 'pending':
        return '⏳'
      default:
        return '✅'
    }
  }

  const currentViewStats = useMemo(() => {
    const total = filteredTables.length
    const selected = filteredTables.filter((table) =>
      selectedTables.has(table.id),
    ).length
    const occupied = filteredTables.filter(
      (table) => table.status !== 'available',
    ).length
    const available = total - occupied

    return { total, selected, occupied, available }
  }, [filteredTables, selectedTables])
  return (
    <div className="p-3 max-w-7xl mx-auto h-full space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Delete Tables
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select and delete tables from your restaurant
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={dataLoading}
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={clickedBackToTables} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tables
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading tables data...</AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {dataError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load tables: {dataError.message}
          </AlertDescription>
        </Alert>
      )}

      {!dataLoading && !dataError && (
        <>
          {/* Filters and Search */}
          <Card>
            <CardHeader className="pb-2 !text-xl">
              <CardTitle className="flex items-center gap-2 !text-xl">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zone Filter */}
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      {localZones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Tables</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by table number, zone, or status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Selection Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2"
                >
                  <SelectAll className="h-4 w-4" />
                  {currentViewStats.selected === currentViewStats.total
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAvailableTables}
                  disabled={currentViewStats.available === 0}
                >
                  Select Available ({currentViewStats.available})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectOccupiedTables}
                  disabled={currentViewStats.occupied === 0}
                >
                  Select Occupied ({currentViewStats.occupied})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllSelections}
                  disabled={selectedTables.size === 0}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentViewStats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tables
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentViewStats.selected}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Selected
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentViewStats.occupied}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Occupied/Reserved
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {currentViewStats.available}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables Display */}
          {filteredTables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedZone !== 'all'
                    ? 'No tables match your current filters.'
                    : 'No tables found.'}
                </div>
                {(searchQuery || selectedZone !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedZone('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTables).map(([zone, zoneTables]) => (
                <Card key={zone}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{zone}</CardTitle>
                        <Badge variant="secondary">
                          {zoneTables.length} table
                          {zoneTables.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInZone(zone)}
                          disabled={zoneTables.every((table) =>
                            selectedTables.has(table.id),
                          )}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deselectAllInZone(zone)}
                          disabled={
                            !zoneTables.some((table) =>
                              selectedTables.has(table.id),
                            )
                          }
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {zoneTables.map((table) => (
                        <div
                          key={table.id}
                          className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedTables.has(table.id)
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                              : getStatusColor(table.status)
                          }`}
                          onClick={() => toggleTableSelection(table.id)}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-2 right-2">
                            <Checkbox
                              checked={selectedTables.has(table.id)}
                              onChange={() => toggleTableSelection(table.id)}
                              className={
                                selectedTables.has(table.id)
                                  ? 'border-red-500 bg-red-500'
                                  : ''
                              }
                            />
                          </div>

                          {/* Table Content */}
                          <div className="text-center space-y-2">
                            <div className="text-lg font-bold">
                              {table.table_number}
                            </div>
                            <div className="text-2xl">
                              {getStatusIcon(table.status)}
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <Users className="h-3 w-3" />
                              <span>{table.capacity}</span>
                            </div>
                            <div className="text-xs font-medium capitalize">
                              {table.status}
                            </div>
                          </div>

                          {/* Selection Overlay */}
                          {selectedTables.has(table.id) && (
                            <div className="absolute inset-0 bg-red-500/10 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-red-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selection Summary and Delete Button */}
          {selectedTables.size > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                      Delete Selected Tables
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedTables.size} table
                      {selectedTables.size !== 1 ? 's' : ''} selected for
                      deletion
                    </p>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Zones:{' '}
                      {[
                        ...new Set(selectedTableDetails.map((t) => t.zone)),
                      ].join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearAllSelections}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Selection
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                      className="min-w-32"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>

                {/* Selected Tables Preview */}
                <div className="mt-4 p-3 bg-white dark:bg-red-900/20 rounded border">
                  <div className="text-xs font-medium text-red-900 dark:text-red-100 mb-2">
                    Tables to be deleted:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTableDetails.slice(0, 20).map((table) => (
                      <Badge
                        key={table.id}
                        variant="destructive"
                        className="text-xs text-white"
                      >
                        {table.table_number}
                      </Badge>
                    ))}
                    {selectedTableDetails.length > 20 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedTableDetails.length - 20} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting tables is permanent and cannot
              be undone. Make sure you want to permanently remove the selected
              tables from your restaurant.
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Occupied tables should be cleared before deletion</li>
                <li>• All associated reservations will be lost</li>
                <li>• Table numbers can be reused after deletion</li>
              </ul>
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Table Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{' '}
              <strong>{selectedTables.size}</strong> table
              {selectedTables.size !== 1 ? 's' : ''}. This action cannot be
              undone.
              {selectedTableDetails.some(
                (table) => table.status !== 'available',
              ) && (
                <span className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-900">
                  <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                    ⚠️ Warning: Some selected tables are currently occupied or
                    reserved.
                  </span>
                </span>
              )}
              <div className="mt-3 max-h-32 overflow-y-auto text-sm">
                <strong>Tables to delete:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedTableDetails.map((table) => (
                    <Badge
                      key={table.id}
                      variant={'destructive'}
                      className="text-xs text-white"
                    >
                      {table.table_number} ({table.status})
                    </Badge>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelectedTables}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedTables.size} Table
                  {selectedTables.size !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DeleteTablesComponent
