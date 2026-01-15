import { useGlobalOrderPopupStore } from '@/store/useGlobalOrderPopupStore'

// Simple hook to access the global order popup store
// This provides a clean interface for components that need popup functionality
export const useGlobalOrderPopup = () => {
  const store = useGlobalOrderPopupStore()
  
  return {
    // State
    isPopupVisible: store.isPopupVisible,
    popupsEnabled: store.popupsEnabled,
    currentOrder: store.currentOrder,
    isTransitioning: store.isTransitioning,
    
    // Actions
    showPopup: store.showPopup,
    hidePopup: store.hidePopup,
    togglePopups: store.togglePopups,
    enablePopups: store.enablePopups,
    disablePopups: store.disablePopups
  }
}