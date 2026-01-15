import { useEffect, useMemo, useState, useCallback } from 'react'
import OrderHistoryInfoList from './order-info/OrderInfoList'
import OrderHistoryDetailsList from './order-details/OrderDetailsList'
import MobileOrderHistory from './mobile/MobileOrderHistory'
import ErrorBoundary from './ErrorBoundary'
import { UseAdminOrderHistory } from './hooks/UseAdminOrderHistory'
import OrderHistoryHeader from './OrderHistoryHeader'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrderHistoryTable from './OrderHistoryTable'

export default function OrderHistoryMain() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const { user } = useAuth()

  const rid = user?.selected_rid || ''

  const { orderHistory, refreshHistory, loading, error } = UseAdminOrderHistory(
    { rid },
  )

  // Get the selected order object
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId || !orderHistory.length) return null
    return orderHistory.find((order) => order.id === selectedOrderId) || null
  }, [selectedOrderId, orderHistory])

  // Memoize the order selection handler to prevent child re-renders
  const handleOrderSelect = useCallback((orderId: string) => {
    setSelectedOrderId(orderId)
  }, [])

  // Auto-select first order when orders load (only when no order is selected)
  useEffect(() => {
    if (orderHistory.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orderHistory[0].id)
    }
  }, [orderHistory, orderHistory.length, selectedOrderId]) // Only depend on length to avoid unnecessary triggers

  // Reset selection when orders change significantly
  useEffect(() => {
    if (selectedOrderId && orderHistory.length > 0) {
      const orderExists = orderHistory.some(
        (order) => order.id === selectedOrderId,
      )
      if (!orderExists) {
        setSelectedOrderId(orderHistory[0]?.id || null)
      }
    }
  }, [orderHistory, selectedOrderId])

  // Handle session-related errors
  const sessionError = !user?.restaurant_rids?.[0]

  if (sessionError) {
    return (
      <div className="w-full h-[calc(100vh-9rem)] rounded-2xl">
        <section className="border p-5 h-[calc(100vh-7.8rem)]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-lg font-medium mb-2">
                Authentication Required
              </h3>
              <p className="text-sm text-gray-600">
                Please log in to view order history.
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Tabs
        defaultValue="table"
        className="w-full h-[calc(100vh-9rem)] rounded-2xl"
      >
        <div className="flex px-4 py-2 bg-white z-[50] sticky top-0 border">
          <section className="flex items-center gap-3">
            {/* <Tabs defaultValue="grid"> */}
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            {/* </Tabs> */}
          </section>

          <OrderHistoryHeader
            refreshHistory={refreshHistory}
            loading={loading}
          />
        </div>
        {/* mark grid view */}
        <TabsContent value="grid" className="p-5s h-[calc(100vh-9.3rem)]">
          {/* Desktop Layout (md and above) */}
          <div className="hidden md:block rounded-md h-full w-full !border-none">
            <div className="h-full w-full flex overflow-hidden">
              <ErrorBoundary
                fallback={
                  <div className="w-[40%] h-full border flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚠️</div>
                      <p className="text-sm text-gray-600">
                        Error loading order list
                      </p>
                      <button
                        onClick={refreshHistory}
                        className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                }
              >
                <OrderHistoryInfoList
                  orders={orderHistory}
                  selectedOrderId={selectedOrderId}
                  onOrderSelect={handleOrderSelect}
                  loading={loading}
                  error={error}
                  onRetry={refreshHistory}
                />
              </ErrorBoundary>
              <div className="h-full border-l border-gray-300" />

              <ErrorBoundary
                fallback={
                  <div className="w-[60%] h-full border flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚠️</div>
                      <p className="text-sm text-gray-600">
                        Error loading order details
                      </p>
                    </div>
                  </div>
                }
              >
                <OrderHistoryDetailsList
                  selectedOrder={selectedOrder}
                  loading={loading}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Mobile Layout (below md) */}
          <div className="block md:hidden h-full overflow-y-auto">
            <ErrorBoundary
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="text-sm text-gray-600">
                      Error loading orders
                    </p>
                    <button
                      onClick={refreshHistory}
                      className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              }
            >
              <MobileOrderHistory
                orders={orderHistory}
                loading={loading}
                error={error}
                onRetry={refreshHistory}
              />
            </ErrorBoundary>
          </div>
        </TabsContent>
        <TabsContent value="table">
          <section className="borderd p-5 h-[calc(100vh-9.3rem)]">
            <OrderHistoryTable
              items={orderHistory}
              loading={loading}
              error={error}
              refreshHistory={refreshHistory}
            />
          </section>
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  )
}
