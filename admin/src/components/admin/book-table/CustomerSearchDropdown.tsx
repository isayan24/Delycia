import React from "react";
import { User } from "lucide-react";
import { UserSearchResult } from "./hooks/useCustomerSearch";

interface CustomerSearchDropdownProps {
  isSearching: boolean;
  searchError: string | null;
  searchResults: UserSearchResult[];
  onUserSelect: (user: UserSearchResult) => void;
}

export function CustomerSearchDropdown({
  isSearching,
  searchError,
  searchResults,
  onUserSelect,
}: CustomerSearchDropdownProps) {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {isSearching ? (
        <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Searching...</span>
        </div>
      ) : searchError ? (
        <div className="p-4 text-sm text-red-600 text-center">
          <p>{searchError}</p>
        </div>
      ) : searchResults.length > 0 ? (
        <ul className="py-1">
          {searchResults.map((user, index) => (
            <li
              key={user.uid || index}
              onClick={() => onUserSelect(user)}
              className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">
                    +91 {user.phone_number}
                  </p>
                </div>
                <User className="h-4 w-4 text-orange-400" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-sm text-gray-500 text-center">
          <p>No customers found</p>
          <p className="text-xs mt-1">
            Continue typing or enter new customer details
          </p>
        </div>
      )}
    </div>
  );
}
