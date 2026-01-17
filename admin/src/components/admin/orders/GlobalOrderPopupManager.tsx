/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect } from 'react'
import { useWebSocketManager } from '@/hooks/useWebSocketManager'
import { OrderPopup } from './order-states/OrderPopup'
import { WebSocketOrder } from '@/types/WebSocketOrder'
import { useGlobalOrderPopupStore } from '@/store/useGlobalOrderPopupStore'
import UseGlobalPopupSound from './hooks/useGlobalPopupSound'
import { useRoleBasedUI } from '@/components/user-roles/useRoleBasedUI'

export function GlobalOrderPopupManager() {
  const { getOrderPopup } = useRoleBasedUI()

  // Zustand store
  const {
    isPopupVisible,
    currentOrder,
    isTransitioning,
    handleWebSocketOrders,
    acceptOrder,
    rejectOrder,
    hidePopup,
    togglePopups,
  } = useGlobalOrderPopupStore()

  // Use singleton WebSocket manager (shares connection with OrdersMain)
  const { subscribe, unsubscribe } = useWebSocketManager()

  // Subscribe to order updates and process through Zustand store
  useEffect(() => {
    const handleOrdersUpdate = (data: any) => {
      const webSocketOrders = (data.orders || []) as unknown as WebSocketOrder[]
      handleWebSocketOrders(webSocketOrders)
    }

    subscribe('all_orders', handleOrdersUpdate)

    return () => {
      unsubscribe('all_orders', handleOrdersUpdate)
    }
  }, [subscribe, unsubscribe, handleWebSocketOrders])

  // Handle order acceptance
  const handleAcceptOrder = async (order: any, prepTime: number) => {
    await acceptOrder(order, prepTime)
  }

  // Handle order rejection
  const handleRejectOrder = async (order: any) => {
    await rejectOrder(order)
  }

  // Only show popups if user is authenticated
  // const shouldShowPopup = status === 'authenticated' && session?.user && isConnected

  return (
    <>
      {/* Sound Component for Global Order Popup */}
      {getOrderPopup !== 'none' && (
        <UseGlobalPopupSound hasNewOrder={!!currentOrder && isPopupVisible} />
      )}

      {/* Global Order Popup - only render if authenticated and has current order */}
      {isPopupVisible && currentOrder && getOrderPopup !== 'none' && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: isPopupVisible ? 'auto' : 'none' }}
        >
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${isPopupVisible ? 'opacity-50 backdrop-blur-sm' : 'opacity-0'}`}
            onClick={hidePopup}
          />
          <div className="fixed inset-0 flex items-center justify-center">
            <OrderPopup
              order={currentOrder}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              onClose={hidePopup}
              isVisible={isPopupVisible}
              onTogglePopups={togglePopups}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      )}
    </>
  )
}
