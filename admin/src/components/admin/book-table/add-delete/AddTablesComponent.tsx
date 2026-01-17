import React, { useState, useEffect } from 'react'
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
import {
  Trash2,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useFetchTable } from '../hooks/useFetchTable'

interface PendingTable {
  id: string
  table_number: string
  capacity: number
  zone: string
}

interface AddTablesComponentProps {
  onTablesAdded?: () => void
  clickedBackToTables?: () => void
}

const AddTablesComponent = ({
  onTablesAdded,
  clickedBackToTables,
}: AddTablesComponentProps) => {
  const { user } = useAuth()
  const {
    zones,
    tables,
    loading: dataLoading,
    error: dataError,
  } = useFetchTable(user?.selected_rid)

  const [pendingTables, setPendingTables] = useState<PendingTable[]>([])
  const [existingTables, setExistingTables] = useState<string[]>([])

  // Form states
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [newZoneName, setNewZoneName] = useState<string>('')
  const [isCreatingNewZone, setIsCreatingNewZone] = useState<boolean>(false)
  const [tableNumber, setTableNumber] = useState<string>('')
  const [capacity, setCapacity] = useState<number>(4)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localZones, setLocalZones] = useState<string[]>([])

  const { showError, showSuccess } = useToast()

  // Update existing tables and zones from API data
  useEffect(() => {
    if (tables && tables.length > 0) {
      const tableNumbers = tables.map((table: any) => table.table_number)
      setExistingTables(tableNumbers)
    }
  }, [tables])

  useEffect(() => {
    if (zones && zones.length > 0) {
      const uniqueZones = [...new Set(zones.map((zone: any) => zone.zone))]
      setLocalZones(uniqueZones)
      // Set first zone as default if none selected
      if (!selectedZone && !isCreatingNewZone && uniqueZones.length > 0) {
        setSelectedZone(uniqueZones[0])
      }
    }
  }, [zones])

  // Get next available table number
  const getNextTableNumber = () => {
    const allTableNumbers = [
      ...existingTables,
      ...pendingTables.map((t) => t.table_number),
    ]
    const numericTables = allTableNumbers
      .map((num) => parseInt(num))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b)

    if (numericTables.length === 0) return '1'

    // Find first gap in sequence
    for (let i = 1; i <= numericTables[numericTables.length - 1]; i++) {
      if (!numericTables.includes(i)) {
        return i.toString()
      }
    }

    // If no gaps, return next number
    return (numericTables[numericTables.length - 1] + 1).toString()
  }

  // Auto-suggest next table number when form is empty
  useEffect(() => {
    if (!tableNumber) {
      setTableNumber(getNextTableNumber())
    }
  }, [pendingTables, existingTables])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required'
    } else if (
      existingTables.includes(tableNumber.trim()) ||
      pendingTables.some((t) => t.table_number === tableNumber.trim())
    ) {
      newErrors.tableNumber = 'Table number already exists'
    }

    if (capacity < 1 || capacity > 50) {
      newErrors.capacity = 'Capacity must be between 1 and 50'
    }

    if (!isCreatingNewZone && !selectedZone) {
      newErrors.zone = 'Please select a zone'
    }

    if (isCreatingNewZone && !newZoneName.trim()) {
      newErrors.newZone = 'Zone name is required'
    } else if (isCreatingNewZone && localZones.includes(newZoneName.trim())) {
      newErrors.newZone = 'Zone already exists'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addTableToPending = () => {
    if (!validateForm()) return

    const finalZone = isCreatingNewZone ? newZoneName.trim() : selectedZone

    // Add new zone to local zones if it doesn't exist
    if (isCreatingNewZone && !localZones.includes(finalZone)) {
      setLocalZones((prev) => [...prev, finalZone])
    }

    const newTable: PendingTable = {
      id: `pending-${Date.now()}-${Math.random()}`,
      table_number: tableNumber.trim(),
      capacity,
      zone: finalZone,
    }

    setPendingTables((prev) => [...prev, newTable])

    // Reset form for next table
    setTableNumber('')
    setCapacity(4)
    if (isCreatingNewZone) {
      setSelectedZone(finalZone)
      setNewZoneName('')
      setIsCreatingNewZone(false)
    }
    setErrors({})
  }

  const removeTableFromPending = (id: string) => {
    setPendingTables((prev) => prev.filter((table) => table.id !== id))
  }
  // todo create table
  const createTable = async (tableData: PendingTable) => {
    if (!user?.selected_rid) {
      throw new Error('Restaurant ID not found')
    }
    const payload = {
      rid: user.selected_rid,
      table_number: tableData.table_number,
      capacity: tableData.capacity,
      zone: tableData.zone,
    }

    const response = await axios.post('/api/table', payload)
    if (response.status === 201) {
      setPendingTables([])
    }
    if (response.status !== 201 && response.status !== 200) {
      showError('Error', 'Failed to create table, please try again')
      throw new Error('Failed to create table')
    }
    return response.data
  }

  const submitAllTables = async () => {
    if (pendingTables.length === 0) return

    setIsSubmitting(true)
    const errors: string[] = []
    let successCount = 0

    try {
      for (const table of pendingTables) {
        try {
          await createTable(table)
          successCount++
        } catch (err: any) {
          const errorMsg =
            err.response?.data?.message || err.message || 'Unknown error'
          errors.push(`Table ${table.table_number}: ${errorMsg}`)
        }
      }

      if (errors.length === 0) {
        setExistingTables((prev) => [
          ...prev,
          ...pendingTables.map((t) => t.table_number),
        ])
        setPendingTables([])
        onTablesAdded?.()
      } else {
        const message = `${successCount}/${pendingTables.length} tables created successfully.\n\nErrors:\n${errors.join('\n')}`
        showError('Error', message)

        if (successCount > 0) {
          const successfulTableNumbers = pendingTables
            .filter(
              (table) =>
                !errors.some((err) => err.includes(table.table_number)),
            )
            .map((table) => table.table_number)

          setExistingTables((prev) => [...prev, ...successfulTableNumbers])
          setPendingTables((prev) =>
            prev.filter((table) =>
              errors.some((err) => err.includes(table.table_number)),
            ),
          )
        }
      }
    } catch (error) {
      console.error('Error creating tables:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearAllPending = () => {
    setPendingTables([])
  }

  const groupedPendingTables = pendingTables.reduce(
    (acc, table) => {
      if (!acc[table.zone]) {
        acc[table.zone] = []
      }
      acc[table.zone].push(table)
      return acc
    },
    {} as Record<string, PendingTable[]>,
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={dataLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`}
          />
          Refresh Data
        </Button>
        <Button
          variant="outline"
          onClick={clickedBackToTables}
          disabled={dataLoading}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tables
        </Button>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading existing tables and zones...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {dataError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data: {dataError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Table Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Table
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table Number */}
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder={getNextTableNumber()}
                className={errors.tableNumber ? 'border-red-500' : ''}
              />
              {errors.tableNumber && (
                <p className="text-sm text-red-500">{errors.tableNumber}</p>
              )}
              <p className="text-xs text-gray-500">
                Suggested next: {getNextTableNumber()}
              </p>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className={`w-24 ${errors.capacity ? 'border-red-500' : ''}`}
                />
                <span className="text-sm text-gray-500">people</span>
              </div>
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity}</p>
              )}
            </div>

            {/* Zone Selection */}
            <div className="space-y-2">
              <Label>Zone</Label>
              <div className="space-y-2">
                {!isCreatingNewZone ? (
                  <div className="flex gap-2">
                    <Select
                      value={selectedZone}
                      onValueChange={setSelectedZone}
                    >
                      <SelectTrigger
                        className={errors.zone ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select a zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {localZones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingNewZone(true)}
                    >
                      New Zone
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Enter new zone name"
                      className={errors.newZone ? 'border-red-500' : ''}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreatingNewZone(false)
                        setNewZoneName('')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {errors.zone && (
                  <p className="text-sm text-red-500">{errors.zone}</p>
                )}
                {errors.newZone && (
                  <p className="text-sm text-red-500">{errors.newZone}</p>
                )}
              </div>
            </div>

            <Button
              onClick={addTableToPending}
              className="w-full"
              size="lg"
              disabled={dataLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Queue
            </Button>
          </CardContent>
        </Card>

        {/* Pending Tables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Tables ({pendingTables.length})
              </CardTitle>
              {pendingTables.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllPending}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pendingTables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tables in queue. Add tables to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPendingTables).map(([zone, tables]) => (
                  <div key={zone} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{zone}</Badge>
                      <span className="text-sm text-gray-500">
                        ({tables.length} tables)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {tables.map((table) => (
                        <div
                          key={table.id}
                          className="flex items-center justify-between p-2 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              T{table.table_number}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({table.capacity}p)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTableFromPending(table.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Section */}
      {pendingTables.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Ready to Create Tables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pendingTables.length} table
                  {pendingTables.length !== 1 ? 's' : ''} will be created across{' '}
                  {Object.keys(groupedPendingTables).length} zone
                  {Object.keys(groupedPendingTables).length !== 1 ? 's' : ''}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Zones: {Object.keys(groupedPendingTables).join(', ')}
                </div>
              </div>
              <Button
                onClick={submitAllTables}
                disabled={isSubmitting}
                size="lg"
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create All Tables
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            label: 'Tables',
            count: existingTables.length,
            icon: CheckCircle2,
            color: 'green',
          },
          {
            label: 'Pending',
            count: pendingTables.length,
            icon: AlertCircle,
            color: 'orange',
          },
          {
            label: 'Zones',
            count: localZones.length,
            icon: Users,
            color: 'blue',
          },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className="p-2 sm:p-4">
            <div className="text-center sm:flex sm:items-center sm:justify-between">
              <div className="sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {label}
                </p>
                <p className="text-lg sm:text-2xl font-bold">{count}</p>
              </div>
              <div
                className={`mx-auto mt-1 sm:mt-0 sm:mx-0 h-6 w-6 sm:h-8 sm:w-8 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center`}
              >
                <Icon
                  className={`h-3 w-3 sm:h-4 sm:w-4 text-${color}-600 dark:text-${color}-400`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Add Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Multiple Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const startNum = parseInt(getNextTableNumber())
                for (let i = 0; i < 5; i++) {
                  const tableNum = (startNum + i).toString()
                  if (
                    !existingTables.includes(tableNum) &&
                    !pendingTables.some((t) => t.table_number === tableNum)
                  ) {
                    const newTable: PendingTable = {
                      id: `quick-${Date.now()}-${i}`,
                      table_number: tableNum,
                      capacity: 4,
                      zone: selectedZone || localZones[0] || 'Main Hall',
                    }
                    setPendingTables((prev) => [...prev, newTable])
                  }
                }
              }}
              disabled={
                dataLoading || (!selectedZone && localZones.length === 0)
              }
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add 5 Tables
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const startNum = parseInt(getNextTableNumber())
                for (let i = 0; i < 10; i++) {
                  const tableNum = (startNum + i).toString()
                  if (
                    !existingTables.includes(tableNum) &&
                    !pendingTables.some((t) => t.table_number === tableNum)
                  ) {
                    const newTable: PendingTable = {
                      id: `quick-${Date.now()}-${i}`,
                      table_number: tableNum,
                      capacity: 4,
                      zone: selectedZone || localZones[0] || 'Main Hall',
                    }
                    setPendingTables((prev) => [...prev, newTable])
                  }
                }
              }}
              disabled={
                dataLoading || (!selectedZone && localZones.length === 0)
              }
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add 10 Tables
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Add VIP tables (capacity 6-8)
                const startNum = parseInt(getNextTableNumber())
                for (let i = 0; i < 3; i++) {
                  const tableNum = `VIP${startNum + i}`
                  if (
                    !existingTables.includes(tableNum) &&
                    !pendingTables.some((t) => t.table_number === tableNum)
                  ) {
                    const newTable: PendingTable = {
                      id: `vip-${Date.now()}-${i}`,
                      table_number: tableNum,
                      capacity: 6 + (i % 3),
                      zone: 'VIP Section',
                    }
                    setPendingTables((prev) => [...prev, newTable])
                  }
                }
                // Add VIP Section to zones if not exists
                if (!localZones.includes('VIP Section')) {
                  setLocalZones((prev) => [...prev, 'VIP Section'])
                }
              }}
              disabled={dataLoading}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Add VIP Tables
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Add outdoor tables
                const startNum = parseInt(getNextTableNumber())
                for (let i = 0; i < 4; i++) {
                  const tableNum = `OUT${startNum + i}`
                  if (
                    !existingTables.includes(tableNum) &&
                    !pendingTables.some((t) => t.table_number === tableNum)
                  ) {
                    const newTable: PendingTable = {
                      id: `outdoor-${Date.now()}-${i}`,
                      table_number: tableNum,
                      capacity: 4,
                      zone: 'Outdoor',
                    }
                    setPendingTables((prev) => [...prev, newTable])
                  }
                }
                // Add Outdoor to zones if not exists
                if (!localZones.includes('Outdoor')) {
                  setLocalZones((prev) => [...prev, 'Outdoor'])
                }
              }}
              disabled={dataLoading}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Outdoor
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Quick add buttons will create tables in the selected zone or create
            new zones as needed.
          </p>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips for adding tables:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Table numbers must be unique across all zones</li>
            <li>• Tables are suggested in sequential order automatically</li>
            <li>• You can create multiple tables at once before submitting</li>
            <li>
              • New zones will be created automatically if they do not exist
            </li>
            <li>• Each table can accommodate 1-50 people</li>
          </ul>
          {existingTables.length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              <strong>Existing tables:</strong>{' '}
              {existingTables.slice(0, 20).join(', ')}
              {existingTables.length > 20
                ? `... and ${existingTables.length - 20} more`
                : ''}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default AddTablesComponent
