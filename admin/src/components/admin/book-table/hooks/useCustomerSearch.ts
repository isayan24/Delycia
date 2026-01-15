import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";

export interface UserSearchResult {
  uid: string;
  name: string;
  phone_number: string;
  username: string;
  email?: string;
  profile_pic?: string;
}

export function useCustomerSearch(searchTerm: string) {
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { getValidAccessToken } = useAuth();

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const searchUsers = async () => {
      // Only search if there's a search term with at least 2 characters
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const accessToken = await getValidAccessToken();
        const response = await axiosInstance.get(`/users/search`, {
          params: { name: debouncedSearchTerm },
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });

        if (response.data.status) {
          setSearchResults(response.data.users || []);
        } else {
          setSearchResults([]);
        }
      } catch (error: any) {
        console.error("Error searching users:", error);
        setSearchError("Failed to search users");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm, getValidAccessToken]);

  const clearResults = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    searchResults,
    isSearching,
    searchError,
    clearResults,
  };
}
