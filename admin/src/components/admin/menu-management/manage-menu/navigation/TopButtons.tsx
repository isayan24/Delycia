import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Tag, Package } from 'lucide-react'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import { Category } from '@/types/menu.types'

interface SearchResult {
  id: string
  name: string
  type: 'category' | 'inventory'
  description?: string
  price?: number
  category_id?: string
  score?: number
}

interface TopButtonsProps {
  onSearch?: (query: string) => void
  onSubmit?: () => void
  onHighlightItem?: (itemId: string, type: 'category' | 'inventory') => void
  onNavigateToItem?: (
    itemId: string,
    type: 'category' | 'inventory',
    categories?: Category[],
  ) => void
}

// Enhanced fuzzy search function for both categories and inventory items
const fuzzySearch = (
  query: string,
  categories: any[] = [],
  inventoryItems: any[] = [],
): SearchResult[] => {
  if (!query.trim()) return []

  const normalizedQuery = query.toLowerCase().trim()

  // Function to calculate match score
  const calculateScore = (text: string, query: string): number => {
    const normalizedText = text.toLowerCase()

    // Exact match gets highest score
    if (normalizedText === query) return 1000

    // Starts with query gets high score
    if (normalizedText.startsWith(query)) return 900

    // Contains query as whole word gets good score
    if (
      normalizedText.includes(` ${query} `) ||
      normalizedText.includes(` ${query}`)
    )
      return 800

    // Contains query gets medium score
    if (normalizedText.includes(query)) return 700

    // Character-by-character fuzzy matching
    let score = 0
    let queryIndex = 0
    let consecutiveMatches = 0

    for (
      let i = 0;
      i < normalizedText.length && queryIndex < query.length;
      i++
    ) {
      if (normalizedText[i] === query[queryIndex]) {
        score += 10
        queryIndex++
        consecutiveMatches++

        // Bonus for consecutive matches
        if (consecutiveMatches > 1) {
          score += consecutiveMatches * 5
        }
      } else {
        consecutiveMatches = 0
      }
    }

    // Penalty for incomplete matches
    if (queryIndex < query.length) {
      score = score * (queryIndex / query.length)
    }

    // Bonus for shorter strings (more relevant)
    score += Math.max(0, 50 - normalizedText.length)

    return score
  }

  const allResults: SearchResult[] = []

  // Search in categories
  categories.forEach((category) => {
    const score = calculateScore(category.name, normalizedQuery)
    if (score > 0) {
      allResults.push({
        id: category.id,
        name: category.name,
        type: 'category',
        description: category.description,
        score,
      })
    }
  })

  // Search in inventory items
  inventoryItems.forEach((item) => {
    const score = calculateScore(item.name, normalizedQuery)
    if (score > 0) {
      allResults.push({
        id: item.id,
        name: item.name,
        type: 'inventory',
        description: item.description,
        price: item.price,
        category_id: item.category_id,
        score,
      })
    }
  })

  // Sort by score and limit results
  return allResults.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10)
}

const EMPTY_CATEGORIES: any[] = []

export const TopButtons = React.memo<TopButtonsProps>(
  ({ onSearch, onSubmit, onHighlightItem, onNavigateToItem }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { allItems } = useInventoryItems()
    const { selectedRestaurant } = useRestaurantSelector()
    const { data: categoriesData } = useCategoriesQuery(
      selectedRestaurant?.id ? String(selectedRestaurant.id) : undefined,
    )
    const categories = Array.isArray(categoriesData?.categories)
      ? categoriesData.categories
      : EMPTY_CATEGORIES

    // Memoized fuzzy search results
    const memoizedSearchResults = useMemo(() => {
      return fuzzySearch(searchQuery, categories, allItems)
    }, [searchQuery, categories, allItems])

    // Update search results when memoized results change
    // Update search results when memoized results change
    useEffect(() => {
      setSearchResults(memoizedSearchResults)
      setSelectedIndex(-1)
    }, [memoizedSearchResults])

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false)
          setSelectedIndex(-1)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      onSearch?.(value)

      if (value.trim().length >= 2) {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || searchResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          )
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleResultClick(searchResults[selectedIndex])
          } else if (searchQuery.trim()) {
            handleSearchSubmit()
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    const handleResultClick = (result: SearchResult) => {
      setShowSuggestions(false)
      setSearchQuery(result.name)
      setSelectedIndex(-1)

      // Highlight the item
      onHighlightItem?.(result.id, result.type)

      // Navigate to the item
      onNavigateToItem?.(result.id, result.type, categories)
    }

    const handleSearchSubmit = () => {
      if (searchQuery.trim()) {
        onSubmit?.()
        setShowSuggestions(false)
      }
    }

    const clearSearch = () => {
      setSearchQuery('')
      setSearchResults([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      onSearch?.('')
      inputRef.current?.focus()
    }

    const getResultIcon = (type: 'category' | 'inventory') => {
      return type === 'category' ? (
        <Tag className="h-4 w-4 text-blue-500 flex-shrink-0" />
      ) : (
        <Package className="h-4 w-4 text-green-500 flex-shrink-0" />
      )
    }

    const getResultTypeLabel = (type: 'category' | 'inventory') => {
      return type === 'category' ? 'Category' : 'Item'
    }

    // Highlight matching text in search results
    const highlightMatch = (text: string, query: string) => {
      if (!query.trim()) return text

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi',
      )
      const parts = text.split(regex)

      return parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-0.5 rounded font-medium"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )
    }

    return (
      <div className="flex gap-5 px-4 py-2 bg-white z-[50] sticky top-0 max-w-[30rem]">
        <section className="relative flex-1" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search categories and items..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (
                  searchResults.length > 0 &&
                  searchQuery.trim().length >= 2
                ) {
                  setShowSuggestions(true)
                }
              }}
              className="text-lg! pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              <div className="py-1">
                <div className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                  {searchResults.length} result
                  {searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-blue-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {highlightMatch(result.name, searchQuery)}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                              result.type === 'category'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                          >
                            {getResultTypeLabel(result.type)}
                          </span>
                        </div>

                        {result.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                            {result.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {result.price !== undefined && (
                            <span className="text-sm font-medium text-orange-600">
                              ₹{result.price}
                            </span>
                          )}
                          {result.score && (
                            <span className="text-xs text-gray-400 ml-auto">
                              {Math.round((result.score / 1000) * 100)}% match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {showSuggestions &&
            searchResults.length === 0 &&
            searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-6 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try different keywords
                  </p>
                </div>
              </div>
            )}
        </section>
      </div>
    )
  },
)

TopButtons.displayName = 'TopButtons'
