import { useState } from 'react'
import ShowTables from './ShowTables'
import SelectOrder from './SelectOrder'
import PreviewOrder from './PreviewOrder'
import { useTableStore } from '@/store/useTableStore'
import AddCustomerDetails from './AddCustomerDetails'
import AddTablesComponent from './add-delete/AddTablesComponent'
import DeleteTablesComponent from './add-delete/DeleteTablesComponent'
import { useTablesQuery } from '@/hooks/queries/useTablesQuery'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import LoadingScreen from '@/components/common/LoadingScreen'
import { motion, AnimatePresence } from 'motion/react'

export default function BookTableMain() {
  const { changeState, currentState, setTable } = useTableStore()
  const [showAddTables, setShowAddTables] = useState(false)
  const [showDeleteTables, setShowDeleteTables] = useState(false)

  const { user } = useAdminAuthQuery()
  const { isLoading: loading } = useTablesQuery(user?.selected_rid)

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

  // Determine if an overlay is active (add/delete tables)
  const isOverlayActive = showAddTables || showDeleteTables

  return (
    <div className="relative max-[900px]:-mb-24 max-[900px]:pb-[7rem] max-[500px]:h-[calc(100vh-4rem)] h-[calc(100vh-7.5rem)] overflow-hidden flex flex-col">
      {/* Main Step Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentState === 0 && !isOverlayActive && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <ShowTables
                selectTable={selectTable}
                handleShowAddTables={handleShowAddTables}
                handleShowDeleteTables={handleShowDeleteTables}
              />
            </motion.div>
          )}

          {currentState === 1 && !isOverlayActive && (
            <motion.div
              key="select-order"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <SelectOrder />
            </motion.div>
          )}

          {currentState === 2 && !isOverlayActive && (
            <motion.div
              key="preview-order"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <PreviewOrder />
            </motion.div>
          )}

          {currentState === 3 && !isOverlayActive && (
            <motion.div
              key="customer-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <AddCustomerDetails />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Delete Table Overlays */}
        <AnimatePresence>
          {showAddTables && (
            <motion.div
              key="add-tables"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-10"
            >
              <AddTablesComponent
                clickedBackToTables={handleBackToTables}
                onTablesAdded={handleTablesUpdated}
              />
            </motion.div>
          )}

          {showDeleteTables && (
            <motion.div
              key="delete-tables"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-10"
            >
              <DeleteTablesComponent
                clickedBackToTables={handleBackToTables}
                onTablesDeleted={handleTablesUpdated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
