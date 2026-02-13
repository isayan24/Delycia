import { User, Phone, Search, Loader2 } from 'lucide-react'
import { UserSearchResult } from './hooks/useCustomerSearch'

interface CustomerSearchDropdownProps {
  isSearching: boolean
  searchError: string | null
  searchResults: UserSearchResult[]
  onUserSelect: (user: UserSearchResult) => void
}

export function CustomerSearchDropdown({
  isSearching,
  searchError,
  searchResults,
  onUserSelect,
}: CustomerSearchDropdownProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-[100] mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl shadow-black/10 max-h-64 overflow-y-auto">
      {isSearching ? (
        <div className="p-5 flex items-center justify-center gap-2.5 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Searching customers...</span>
        </div>
      ) : searchError ? (
        <div className="p-5 text-sm text-red-500 text-center font-medium">
          <p>{searchError}</p>
        </div>
      ) : searchResults.length > 0 ? (
        <ul className="py-1">
          {searchResults.map((user, index) => (
            <li
              key={user.uid || index}
              onClick={() => onUserSelect(user)}
              className="px-3 py-2.5 mx-1 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    +91 {user.phone_number}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-5 text-center">
          <Search className="h-5 w-5 text-gray-300 mx-auto mb-1.5" />
          <p className="text-sm text-gray-400 font-medium">
            No customers found
          </p>
          <p className="text-[11px] text-gray-300 mt-0.5">
            Enter new customer details below
          </p>
        </div>
      )}
    </div>
  )
}
