/**
 * TableSelector Component
 * 
 * Production-ready multi-select control for choosing tables for QR code generation.
 * Supports creating new tables with zones on-the-fly.
 * 
 * Features:
 * - Fetches and displays existing tables grouped by zone
 * - Allows manual table number entry with auto-creation
 * - Zone selection with ability to create new zones
 * - Duplicate prevention and validation
 * - Batch selection with "Select All" option
 * - Visual feedback for new vs existing tables
 */

import { useState, useMemo } from 'react'
import { Plus, X, Check, MapPin } from 'lucide-react'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTablesQuery, useZonesQuery } from '@/hooks/queries/useTablesQuery'

interface TableSelectorProps {
  restaurantId: number
  selectedTables: string[]
  onTablesChange: (tables: string[]) => void
  onTableZoneMapChange?: (zoneMap: Map<string, string>) => void
  onTableIdMapChange?: (idMap: Map<string, number>) => void
}

export function TableSelector({
  restaurantId,
  selectedTables,
  onTablesChange,
  onTableZoneMapChange,
  onTableIdMapChange,
}: TableSelectorProps) {
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newTableZone, setNewTableZone] = useState('')
  const [customZoneName, setCustomZoneName] = useState('')
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track zone assignments for new tables
  const [tableZoneMap, setTableZoneMap] = useState<Map<string, string>>(new Map())
  // Track table IDs for existing tables
  const [tableIdMap, setTableIdMap] = useState<Map<string, number>>(new Map())

  // Fetch tables and zones using separate hooks
  const { data: tablesData, isLoading: tablesLoading } = useTablesQuery(restaurantId, !!restaurantId)
  const { data: zonesData, isLoading: zonesLoading } = useZonesQuery(restaurantId, !!restaurantId)
  
  const tables = tablesData?.tables || []
  const zones = zonesData?.zones || []
  const isLoading = tablesLoading || zonesLoading

  // Extract unique zone names
  const zoneNames = useMemo(() => {
    return [...new Set(zones.map((z) => z.zone))].sort()
  }, [zones])

  // Group tables by zone
  const tablesByZone = useMemo(() => {
    const grouped: Record<string, typeof tables> = {}
    tables.forEach((table) => {
      if (!grouped[table.zone]) {
        grouped[table.zone] = []
      }
      grouped[table.zone].push(table)
    })
    return grouped
  }, [tables])

  // Get existing table numbers for validation
  const existingTableNumbers = useMemo(() => {
    return tables.map((t) => t.table_number)
  }, [tables])

  // Handle adding a table
  const handleAddTable = () => {
    setError(null)

    // Validate table number
    if (!newTableNumber.trim()) {
      setError('Please enter a table number')
      return
    }

    const tableNum = newTableNumber.trim()

    // Check if table already exists in database
    if (existingTableNumbers.includes(tableNum)) {
      setError(`Table ${tableNum} already exists in the database. Please select it from the dropdown or use a different table number.`)
      return
    }

    // Check for duplicates in selection
    if (selectedTables.includes(tableNum)) {
      setError(`Table ${tableNum} is already selected`)
      return
    }

    // Validate zone selection
    const finalZone = isCreatingZone ? customZoneName.trim() : newTableZone
    if (!finalZone) {
      setError('Please select or create a zone')
      return
    }

    if (isCreatingZone && !customZoneName.trim()) {
      setError('Please enter a zone name')
      return
    }
    
    // Store zone mapping for this new table
    setTableZoneMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(tableNum, finalZone)
      // Notify parent component of the updated map
      onTableZoneMapChange?.(newMap)
      return newMap
    })

    // Add table to selection
    onTablesChange([...selectedTables, tableNum])
    
    // Reset only the table number input
    setNewTableNumber('')
    // Keep zone selection for next table
  }

  // Handle removing a table
  const handleRemoveTable = (tableNumber: string) => {
    onTablesChange(selectedTables.filter((t) => t !== tableNumber))
    // Also remove from zone map
    setTableZoneMap((prev) => {
      const newMap = new Map(prev)
      newMap.delete(tableNumber)
      onTableZoneMapChange?.(newMap)
      return newMap
    })
    // Also remove from ID map
    setTableIdMap((prev) => {
      const newMap = new Map(prev)
      newMap.delete(tableNumber)
      onTableIdMapChange?.(newMap)
      return newMap
    })
    setError(null)
  }

  // Handle selecting from dropdown
  const handleSelectTable = (tableNumber: string) => {
    if (selectedTables.includes(tableNumber)) {
      setError(`Table ${tableNumber} is already selected`)
      return
    }
    
    // Find the table to get its ID
    const table = tables.find((t) => t.table_number === tableNumber)
    if (table) {
      setTableIdMap((prev) => {
        const newMap = new Map(prev)
        newMap.set(tableNumber, table.id)
        onTableIdMapChange?.(newMap)
        return newMap
      })
    }
    
    onTablesChange([...selectedTables, tableNumber])
    setError(null)
  }

  // Handle zone selection for bulk operations
  const handleSelectAllInZone = (zone: string) => {
    const zoneTables = tablesByZone[zone] || []
    const zoneTableNumbers = zoneTables.map((t) => t.table_number)
    const newSelections = zoneTableNumbers.filter((tn) => !selectedTables.includes(tn))
    
    if (newSelections.length > 0) {
      // Update table ID map for all new selections
      setTableIdMap((prev) => {
        const newMap = new Map(prev)
        zoneTables.forEach((table) => {
          if (newSelections.includes(table.table_number)) {
            newMap.set(table.table_number, table.id)
          }
        })
        onTableIdMapChange?.(newMap)
        return newMap
      })
      
      onTablesChange([...selectedTables, ...newSelections])
    }
  }

  // Check if all tables in a zone are selected
  const isZoneFullySelected = (zone: string) => {
    const zoneTables = tablesByZone[zone] || []
    return zoneTables.length > 0 && zoneTables.every((t) => selectedTables.includes(t.table_number))
  }

  // Get table info (existing or new)
  const getTableInfo = (tableNumber: string) => {
    const existing = tables.find((t) => t.table_number === tableNumber)
    if (existing) return existing
    
    // For new tables, use the stored zone mapping
    const zone = tableZoneMap.get(tableNumber) || 'Unknown'
    return { table_number: tableNumber, zone, isNew: true }
  }

  return (
    <div className="space-y-6">
      {/* Add Table Form */}
      <div className="space-y-4">
        <Label>Add Tables</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing Tables Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Select from existing tables</Label>
            <Select onValueChange={handleSelectTable} value="">
              <SelectTrigger>
                <SelectValue placeholder="Choose a table" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading tables...
                  </SelectItem>
                ) : Object.keys(tablesByZone).length === 0 ? (
                  <SelectItem value="no-tables" disabled>
                    No tables found - create new ones below
                  </SelectItem>
                ) : (
                  Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                    <div key={zone}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {zone}
                      </div>
                      {zoneTables.map((table) => (
                        <SelectItem
                          key={table.id}
                          value={table.table_number}
                          disabled={selectedTables.includes(table.table_number)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Table {table.table_number}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              (Cap: {table.capacity})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Entry */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Or create new table</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Table number (e.g., 25)"
                value={newTableNumber}
                onChange={(e) => {
                  setNewTableNumber(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTable()
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTable}
                size="icon"
                variant="outline"
                className="min-w-[44px] min-h-[44px]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Zone Selection for New Tables */}
        {newTableNumber && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <Label>Zone for new table</Label>
            {!isCreatingZone ? (
              <div className="flex gap-2">
                <Select value={newTableZone} onValueChange={setNewTableZone}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneNames.length === 0 ? (
                      <SelectItem value="Main" disabled>
                        No zones - create one
                      </SelectItem>
                    ) : (
                      zoneNames.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingZone(true)}
                >
                  New Zone
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter zone name (e.g., Patio)"
                  value={customZoneName}
                  onChange={(e) => setCustomZoneName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsCreatingZone(false)
                    setCustomZoneName('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              New tables will be created automatically with default capacity of 4
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Select existing tables or enter new table numbers. New tables will be created automatically.
        </p>
      </div>

      {/* Bulk Selection by Zone */}
      {Object.keys(tablesByZone).length > 0 && (
        <div className="space-y-2">
          <Label>Quick select by zone</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tablesByZone).map(([zone, zoneTables]) => {
              const isFullySelected = isZoneFullySelected(zone)
              return (
                <Button
                  key={zone}
                  type="button"
                  variant={isFullySelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectAllInZone(zone)}
                  className="gap-2"
                >
                  {isFullySelected && <Check className="h-3 w-3" />}
                  <MapPin className="h-3 w-3" />
                  {zone} ({zoneTables.length})
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Tables List */}
      {selectedTables.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Selected Tables ({selectedTables.length})</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onTablesChange([])}
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {selectedTables.map((tableNumber) => {
              const tableInfo = getTableInfo(tableNumber)
              const isNew = !existingTableNumbers.includes(tableNumber)
              
              return (
                <Card key={tableNumber} className={`p-3 ${isNew ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium truncate">Table {tableNumber}</p>
                        {isNew && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tableInfo.zone}
                      </p>
                      {!isNew && 'capacity' in tableInfo && (
                        <p className="text-xs text-muted-foreground">
                          Capacity: {tableInfo.capacity}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTable(tableNumber)}
                      className="h-6 w-6 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
