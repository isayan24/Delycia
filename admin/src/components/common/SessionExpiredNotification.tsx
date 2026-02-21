import React, { useEffect, useState } from 'react'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { LogOut, Building2 } from 'lucide-react'

export const SessionExpiredNotification: React.FC = () => {
  const { logout, user, isAuthenticated } = useAdminAuthQuery()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [noRidWarning, setNoRidWarning] = useState(false)

  // Detect when user is authenticated but has no restaurant_rids
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      (!user.restaurant_rids || user.restaurant_rids.length === 0)
    ) {
      setNoRidWarning(true)
    } else {
      setNoRidWarning(false)
    }
  }, [isAuthenticated, user])

  const handleReLogin = async () => {
    await logout()
  }

  // ─── No restaurant_rids warning ───
  if (noRidWarning) {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-9999 transition-all duration-300 ease-in-out translate-y-0 opacity-100 w-[calc(100%-2rem)] max-w-md sm:w-auto">
        <div className="bg-white border border-amber-200 rounded-2xl sm:rounded-full shadow-lg px-5 py-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-amber-600">
            <Building2 className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">
              No restaurants assigned to your account
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-gray-200" />

          <button
            onClick={handleReLogin}
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Try Login Again</span>
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default SessionExpiredNotification
