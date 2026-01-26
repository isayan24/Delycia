"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, Package, Triangle, Clock, TrendingUp } from "lucide-react";
import { Input } from "../ui/input";
import { useSearch } from "@/hooks/useSearch";
import { useItemHighlight } from "@/hooks/useItemHighlight";
import { SearchResult } from "@/helpers/fuzzySearch";
import { ImageLoader } from "../image-loader";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-haiku";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";

interface HeaderSearchProps {
  onItemSelect?: (
    itemId: string,
    categoryId?: string,
    categoryName?: string
  ) => void;
}

export default function HeaderSearch({
  onItemSelect,
}: HeaderSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { searchResults, isLoading, performSearch, clearSearch, isCacheReady } =
    useSearch();
  const { highlightItem } = useItemHighlight();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  const pathname = usePathname();
  const isSmallScreen = useMediaQuery("(max-width: 700px)", false);
  const home = pathname === "/";
  const isDeliciasPage = pathname === "/delycias";

  // Load search history from localStorage on mount
  useEffect(() => {
    // If on delycias page, clear everything and don't load from localStorage
    if (isDeliciasPage) {
      setSearchHistory([]);
      setRecentSearches([]);
      try {
        localStorage.removeItem("food-search-history");
        localStorage.removeItem("food-recent-searches");
      } catch (error) {
        console.warn("Failed to clear search history on delycias page:", error);
      }
      return;
    }

    try {
      const saved = localStorage.getItem("food-search-history");
      if (saved) {
        const history = JSON.parse(saved);
        setSearchHistory(history.slice(0, 2)); // Keep only last 10
      }

      const savedRecent = localStorage.getItem("food-recent-searches");
      if (savedRecent) {
        const recent = JSON.parse(savedRecent);
        setRecentSearches(recent.slice(0, 2)); // Keep only last 5
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    }
  }, [isDeliciasPage]);

  // Save to localStorage
  const saveToHistory = useCallback((query: string) => {
    // Don't save to history if on delycias page
    if (isDeliciasPage) return;

    try {
      const newHistory = [
        query,
        ...searchHistory.filter((h) => h !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("food-search-history", JSON.stringify(newHistory));

      const newRecent = [
        query,
        ...recentSearches.filter((r) => r !== query),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("food-recent-searches", JSON.stringify(newRecent));
    } catch (error) {
      console.warn("Failed to save search history:", error);
    }
  }, [isDeliciasPage, searchHistory, recentSearches]);

  // Close suggestions when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        showSuggestions
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showSuggestions) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    // Only add listeners when suggestions are shown
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("touchstart", handleClickOutside, true);
      document.addEventListener("keydown", handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showSuggestions]);

  // Optimized debounced search for local data
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(
      () => {
        const trimmedValue = searchValue.trim();

        if (trimmedValue.length >= 2) {
          try {
            performSearch(trimmedValue);
            setShowSuggestions(true);
          } catch (error) {
            console.error("Search failed:", error);
          }
        } else {
          clearSearch();
          setShowSuggestions(false);
        }
      },
      searchValue.length < 3 ? 500 : 300
    ); // Optimized delays: 500ms for short queries, 300ms for longer ones

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue, performSearch, clearSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Limit input length to prevent performance issues
    if (value.length > 100) {
      value = value.substring(0, 100);
    }
    
    setSearchValue(value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalSuggestions = showSuggestions
      ? searchResults.length +
        (searchValue.length < 2 ? recentSearches.length : 0)
      : 0;

    if (!showSuggestions || totalSuggestions === 0) {
      if (e.key === "Enter" && searchValue.trim()) {
        handleSearchSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (searchValue.length < 2 && selectedIndex < recentSearches.length) {
            // Recent search selected
            const recentQuery = recentSearches[selectedIndex];
            setSearchValue(recentQuery);
            performSearch(recentQuery);
          } else {
            // Search result selected
            const resultIndex =
              searchValue.length < 2
                ? selectedIndex - recentSearches.length
                : selectedIndex;
            if (resultIndex >= 0 && resultIndex < searchResults.length) {
              handleResultClick(searchResults[resultIndex]);
            }
          }
        } else if (searchValue.trim()) {
          handleSearchSubmit();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearchSubmit = () => {
    const trimmedValue = searchValue.trim();
    if (trimmedValue && trimmedValue.length >= 2) {
      saveToHistory(trimmedValue);
      performSearch(trimmedValue);
      
      // Close suggestions after search submit
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // Blur input to remove focus
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleResultClick = useCallback(async (result: SearchResult) => {
    // Immediately close suggestions and reset state
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Save successful search to history
    saveToHistory(searchValue.trim());

    // Blur the input to remove focus and prevent reopening suggestions
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // Highlight the item in its category
    try {
      await highlightItem(result.id, result.category_id, result.category_name);
    } catch (error) {
      console.error("Failed to highlight item:", error);
    }

    // Call optional callback
    onItemSelect?.(result.id, result.category_id, result.category_name);
  }, [searchValue, saveToHistory, highlightItem, onItemSelect]);

  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setSearchValue(recentQuery);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Blur the input to remove focus
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    performSearch(recentQuery);
  }, [performSearch]);

  const handleClearSearch = () => {
    setSearchValue("");
    clearSearch();
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearSearchHistory = () => {
    try {
      setSearchHistory([]);
      setRecentSearches([]);
      localStorage.removeItem("food-search-history");
      localStorage.removeItem("food-recent-searches");
    } catch (error) {
      console.warn("Failed to clear search history:", error);
    }
  };

  // Memoize filtered recent searches with better validation
  const filteredRecentSearches = useMemo(() => {
    if (searchValue.length >= 2 || isDeliciasPage) return [];
    
    // Only show recent searches if we have a valid, short query
    const trimmedValue = searchValue.trim();
    if (trimmedValue.length === 0) {
      return recentSearches.slice(0, 5); // Show all recent searches when empty
    }
    
    return recentSearches.filter((search) =>
      search.toLowerCase().includes(trimmedValue.toLowerCase())
    );
  }, [recentSearches, searchValue, isDeliciasPage]);

  // Show recent searches when input is focused and empty/short
  const shouldShowRecentSearches =
    showSuggestions &&
    searchValue.length < 2 &&
    filteredRecentSearches.length > 0 &&
    !isDeliciasPage;
  const shouldShowSearchResults =
    showSuggestions && searchResults.length > 0 && searchValue.length >= 2;

  return (
    <div className="relative max-w-2xl mx-auto pt-10 pb-5 px-4" ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[10px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white rounded-[10px] border border-gray-100 overflow-visible">
          <div className="flex items-center">
            <div className="pl-6 pr-4 py-2">
              <Search
                className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                size={14}
              />
            </div>

            <div className="flex-1 relative text-green-600">
              <Input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (
                    searchResults.length > 0 ||
                    filteredRecentSearches.length > 0 ||
                    searchValue.trim().length >= 2
                  ) {
                    setShowSuggestions(true);
                  }
                }}
                className={`w-full p-0  bg-transparent !border-none !outline-none focus:outline-none focus:!border-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none rounded-none ${home && !isSmallScreen ? "text-green-600 placeholder:text-green-600" : "text-orange-400 placeholder:text-gray-400"} ${isSmallScreen ? "!placeholder:text-sm" : "!placeholder:text-lg !text-lg"}`}
                placeholder={isCacheReady ? "Search your favorite food" : "Loading menu..."}
                disabled={!isCacheReady}
              />
            </div>

            <div className="pl-6 pr-4 py-2 relative">
              {searchValue && (
                <>
                  {isLoading ? (
                    <div className="animate-spin h-[14px] w-[14px] border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <X
                      onClick={handleClearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      size={14}
                    />
                  )}
                </>
              )}
              {!isCacheReady && !searchValue && (
                <div className="animate-pulse h-[14px] w-[14px] bg-gray-300 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Recent Searches */}
          {shouldShowRecentSearches && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[999]">
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Clock size={12} />
                    Recent Searches
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSearchHistory();
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {filteredRecentSearches.map((recentQuery, index) => (
                <div
                  key={`recent-${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRecentSearchClick(recentQuery);
                  }}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex
                      ? "bg-emerald-50 border-emerald-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-gray-700 text-sm">{recentQuery}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results Dropdown */}
          {shouldShowSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-[999]">
              {searchResults.map((result, index) => {
                const adjustedIndex = shouldShowRecentSearches
                  ? index + filteredRecentSearches.length
                  : index;
                return (
                  <div
                    key={result.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResultClick(result);
                    }}
                    className={`px-4 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      adjustedIndex === selectedIndex
                        ? "bg-emerald-50 border-emerald-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Food Item Image */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {result.images && result.images.length > 0 ? (
                          <UseOptimizeImage
                            src={result?.images[0]}
                            alt={result?.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`${isSmallScreen ? "!text-sm" : "!text-md"} font-medium text-gray-900 truncate`}>
                            {result.name}
                          </h4>

                          {/* Veg/Non-veg indicator */}
                          {result.is_veg ? (
                            <div className="border rounded-[2px] border-green-500 flex items-center justify-center p-0.5">
                              <span className="rounded-full bg-green-500 h-[0.4rem] w-[0.4rem]"></span>
                            </div>
                          ) : (
                            <div className="border rounded-[2px] border-red-500 flex items-center justify-center p-0.5">
                              <Triangle className="text-red-500 h-[0.4rem] w-[0.4rem] fill-current" />
                            </div>
                          )}
                        </div>

                        {result.description && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {result.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.category_name && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {result.category_name}
                              </span>
                            )}
                            {result.price && (
                              <span className="text-xs font-medium text-green-600">
                                ₹{result.price}
                              </span>
                            )}
                          </div>
                          {result.status === 'out_of_stock' && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results Message */}
          {showSuggestions &&
            searchResults.length === 0 &&
            !isLoading &&
            searchValue.trim().length >= 2 &&
            !shouldShowRecentSearches &&
            isCacheReady && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-6 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    No food items found for &quot;{searchValue.trim()}&quot;
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchValue.trim().length < 3 
                      ? "Try typing at least 3 characters for better results"
                      : "Try different keywords or check spelling"
                    }
                  </p>
                  {searchHistory.length > 0 && !isDeliciasPage && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">
                        Or try from your recent searches:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {searchHistory.slice(0, 3).map((historyItem, index) => (
                          <button
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRecentSearchClick(historyItem);
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                          >
                            {historyItem}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Loading State for Inventory */}
          {showSuggestions &&
            !isCacheReady &&
            searchValue.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-6 text-center text-gray-500">
                  <div className="animate-spin h-8 w-8 mx-auto mb-2 border-2 border-gray-300 border-t-emerald-500 rounded-full"></div>
                  <p className="text-sm">Loading menu items...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please wait while we prepare your search
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}