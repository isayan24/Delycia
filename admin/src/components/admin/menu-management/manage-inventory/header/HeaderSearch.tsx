import { Input } from '@/components/ui/input'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, Tag, Package } from 'lucide-react'
import HeaderNav from './HeaderNav'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import useInventoryStore from '../inventory/main-file/UseInventoryStates' // Import the store
import { useMenuStore } from '@/store/useMenuStore'

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
  onHighlightItem?: (
    itemId: string,
    type: 'category' | 'inventory',
    categoryId?: string,
  ) => void
  onNavigateToItem?: (
    itemId: string,
    type: 'category' | 'inventory',
    categoryId?: string,
  ) => void
}

// Enhanced fuzzy search function for both categories and inventory items
const fuzzySearch = (
  query: string,
  categories: any[],
  inventoryItems: any[],
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

export const HeaderSearch = React.memo<TopButtonsProps>(
  ({ onSearch, onHighlightItem, onNavigateToItem }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Get data from hooks
    const { allItems } = useInventoryItems()
    const { categories } = useMenuStore()

    // Get store functions for accordion management
    const { openAccordion, isAccordionOpen } = useInventoryStore()

    // Memoized fuzzy search results
    const memoizedSearchResults = useMemo(() => {
      return fuzzySearch(searchQuery, categories, allItems)
    }, [searchQuery, categories, allItems])

    // Update search results when memoized results change
    useEffect(() => {
      setSearchResults(memoizedSearchResults)
      setShowSuggestions(
        memoizedSearchResults.length > 0 && searchQuery.trim().length >= 2,
      )
      setSelectedIndex(-1)
    }, [memoizedSearchResults, searchQuery])

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
      setSearchQuery(result.name)
      setShowSuggestions(false)
      setSelectedIndex(-1)

      // Enhanced accordion handling for inventory items
      if (result.type === 'inventory' && result.category_id) {
        // ALWAYS ensure the accordion is open (fixed logic)
        openAccordion(result.category_id)
        console.log(
          'Opened accordion via state for category',
          result.category_id,
        )

        // Enhanced approach to ensure accordion opens
        const ensureAccordionOpen = () => {
          // First, use the navigation callback
          onNavigateToItem?.(result.id, result.type, result.category_id)

          // Multiple DOM-based approaches to ensure accordion opens
          setTimeout(() => {
            const categoryHeader = document.querySelector(
              `[data-category-id="${result.category_id}"]`,
            )
            const accordionContent = document.querySelector(
              `[data-category-content="${result.category_id}"]`,
            )

            if (
              categoryHeader &&
              categoryHeader instanceof HTMLElement &&
              accordionContent
            ) {
              const isAccordionClosed =
                accordionContent.getAttribute('data-state') === 'closed'

              // ONLY click if the accordion is actually closed
              if (isAccordionClosed) {
                try {
                  categoryHeader.click()
                  console.log(
                    'Clicked accordion header to open category',
                    result.category_id,
                  )
                } catch (error) {
                  console.warn('Failed to click accordion header', error)
                }
              } else {
                console.log(
                  'Accordion already open for category',
                  result.category_id,
                )
              }
            }

            // Enhanced item highlighting after ensuring accordion is open
            setTimeout(() => {
              const targetItem = document.getElementById(
                `inventory-item-${result.id}`,
              )
              if (targetItem) {
                // Highlight the specific item
                const originalBackground = targetItem.style.background
                const originalBorder = targetItem.style.border
                const originalBoxShadow = targetItem.style.boxShadow

                targetItem.style.background =
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))'
                targetItem.style.border = '2px solid #f97316'
                targetItem.style.boxShadow =
                  '0 0 0 4px rgba(249, 115, 22, 0.2), 0 4px 12px rgba(0,0,0,0.1)'

                // Smooth scroll to the item
                targetItem.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest',
                })

                // Remove highlight after 2 seconds
                setTimeout(() => {
                  targetItem.style.background = originalBackground
                  targetItem.style.border = originalBorder
                  targetItem.style.boxShadow = originalBoxShadow
                }, 2000)
              } else {
                // Fallback: highlight the category if item not found
                console.warn(
                  'Inventory item not found, highlighting category instead',
                )
                const categoryCard = document.getElementById(
                  `inventory-category-${result.category_id}`,
                )
                if (categoryCard) {
                  const originalBorder = categoryCard.style.border
                  const originalBoxShadow = categoryCard.style.boxShadow

                  categoryCard.style.border = '3px solid #f97316'
                  categoryCard.style.boxShadow =
                    '0 0 0 6px rgba(249, 115, 22, 0.3), 0 0 20px rgba(249, 115, 22, 0.2)'

                  categoryCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest',
                  })

                  setTimeout(() => {
                    categoryCard.style.border = originalBorder
                    categoryCard.style.boxShadow = originalBoxShadow
                  }, 2000)
                }
              }
            }, 500) // Wait a bit longer for DOM to update after accordion opens
          }, 100) // Initial small delay for state updates
        }

        ensureAccordionOpen()
      } else if (result.type === 'inventory') {
        // No category ID, just highlight and navigate
        onHighlightItem?.(result.id, result.type)
        onNavigateToItem?.(result.id, result.type)
      } else {
        // For categories, highlight and navigate immediately
        onHighlightItem?.(result.id, result.type)
        onNavigateToItem?.(result.id, result.type)
      }
    }

    const handleSearchSubmit = () => {
      if (searchQuery.trim()) {
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
      <section className="z-[50] sticky top-0">
        <div className="flex gap-10 px-4 py-3 bg-white">
          <section className="relative flex-1 max-w-[30rem]" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Search inventory items and categories..."
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
                className="!text-lg pl-10 pr-10"
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

            {/* Backdrop Overlay */}
            {showSuggestions && searchResults.length > 0 && (
              <div
                className="fixed inset-0 bg-black/10 dark:bg-black/30 z-40"
                onClick={() => setShowSuggestions(false)}
              />
            )}

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

        <div className="">
          <HeaderNav />
        </div>
      </section>
    )
  },
)

HeaderSearch.displayName = 'HeaderSearch'
