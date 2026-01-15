/* eslint-disable react-hooks/rules-of-hooks */

import React, { useEffect } from 'react'
import { useOrdersWebSocket } from './hooks/useOrdersWebSocket'
import { OrderPopup } from './order-states/OrderPopup'
import { WebSocketOrder } from '@/types/WebSocketOrder'
import { useGlobalOrderPopupStore } from '@/store/useGlobalOrderPopupStore'
import UseGlobalPopupSound from './hooks/useGlobalPopupSound'
import { useAuth } from '@/hooks/useAuth'
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

  // WebSocket connection for real-time orders
  const { isConnected } = useOrdersWebSocket({
    autoConnect: true,
    onOrdersUpdate: (newOrders) => {
      // Process orders through Zustand store
      const webSocketOrders = newOrders as unknown as WebSocketOrder[]
      handleWebSocketOrders(webSocketOrders)
    },
    onError: (error) => {
      console.error('❌ GlobalOrderPopup - WebSocket error:', error)
    },
  })

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
