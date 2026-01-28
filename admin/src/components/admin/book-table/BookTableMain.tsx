import { useState } from 'react'
import ShowTables from './ShowTables'
import SelectOrder from './SelectOrder'
import PreviewOrder from './PreviewOrder'
import { useTableStore } from '@/store/useTableStore'
import AddCustomerDetails from './AddCustomerDetails'
import AddTablesComponent from './add-delete/AddTablesComponent'
import DeleteTablesComponent from './add-delete/DeleteTablesComponent'
import { useFetchTable } from './hooks/useFetchTable'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import LoadingScreen from '@/components/common/LoadingScreen'

export default function BookTableMain() {
  const { changeState, currentState, setTable } = useTableStore()
  const [showAddTables, setShowAddTables] = useState(false)
  const [showDeleteTables, setShowDeleteTables] = useState(false)

  const { user } = useAdminAuthQuery()
  const { loading } = useFetchTable(user?.selected_rid)

  const selectTable = (table: any) => {
    setTable(table)
    changeState(1)
  }

  const handleBackToTables = () => {
    changeState(0)
    setShowAddTables(false)
    setShowDeleteTables(false)
  }

  const handleShowAddTables = () => {
    setShowAddTables(true)
    setShowDeleteTables(false)
  }

  const handleShowDeleteTables = () => {
    setShowDeleteTables(true)
    setShowAddTables(false)
  }

  const handleTablesUpdated = async () => {
    window.location.reload()
  }

  if (loading) {
    return <LoadingScreen message="Loading tables" />
  }

  return (
    <div className="relative max-[500px]:h-[calc(100vh-3rem)] h-[calc(100vh-7rem)] overflow-hidden">
      {/* Add Tables View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          showAddTables ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <AddTablesComponent
          clickedBackToTables={handleBackToTables}
          onTablesAdded={handleTablesUpdated}
        />
      </div>

      {/* Delete Tables View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          showDeleteTables ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <DeleteTablesComponent
          clickedBackToTables={handleBackToTables}
          onTablesDeleted={handleTablesUpdated}
        />
      </div>

      {/* Main Tables View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          currentState === 0 && !showAddTables && !showDeleteTables
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <ShowTables
          selectTable={selectTable}
          handleShowAddTables={handleShowAddTables}
          handleShowDeleteTables={handleShowDeleteTables}
        />
      </div>

      {/* Select Order View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out
          ${currentState === 1 ? 'translate-x-0' : currentState === 0 ? 'translate-x-full' : '-translate-x-full'}`}
      >
        <SelectOrder />
      </div>

      {/* Preview Order View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out 
          ${currentState === 2 ? 'translate-x-0' : currentState === 3 ? '-translate-x-full' : 'translate-x-full'}
          `}
      >
        <PreviewOrder />
      </div>

      {/* Add Customer Details View */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          currentState === 3 ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <AddCustomerDetails />
      </div>
    </div>
  )
}
