import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fuzzySearch, SearchResult } from '@/helpers/fuzzySearch';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useTableStore } from '@/store/useTableStore';
import { Minus, Plus, Search } from 'lucide-react';
import React, { useEffect, useState, useRef, useMemo } from 'react'

export default function OrderHeader() {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [categoryIdForSearch, setCategoryIdForSearch] = useState<string | undefined>("")

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { quantities, setCategoryId, changeState, updateQuantity, setHighlightedItem } = useTableStore();
  const { items, allItems, loading, error } = useInventoryItems(categoryIdForSearch)

  // Memoized fuzzy search results
  const searchResults = useMemo(() => {
    return fuzzySearch(searchValue, allItems);
  }, [searchValue, allItems]);

  const handleQuantityUpdate = (itemId: string, change: number) => {
    // Find the current item data from the items array 
    const currentItem = allItems.find(item => item.id === itemId)

    if (currentItem) {
      updateQuantity(itemId, change, currentItem)
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show/hide dropdown based on search value and results
  useEffect(() => {
    if (searchValue.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchValue, searchResults]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSelectItem = (item: SearchResult) => {
    const currentItem: any = allItems.find(i => i.id === item.id) || {}

    // Set the category to show the item
    setCategoryId(currentItem.category_id || item.category_id)

    // Trigger highlighting for the selected item
    setHighlightedItem(item.id)

    // Clear search and close dropdown
    setSearchValue('');
    setShowDropdown(false);

    // Scroll to item after a delay to ensure the category tab and item are rendered
    setTimeout(() => {
      scrollToItem(item.id, currentItem.category_id || item.category_id);
    }, 500); // Increased delay to account for category switching
  };

  // Enhanced scroll-to-item function
  const scrollToItem = (itemId: string, categoryId?: string) => {
    // Try multiple selectors to find the item
    const possibleSelectors = [
      `[data-item-id="${itemId}"]`,
      `#item-${itemId}`,
      `#inventory-item-${itemId}`,
      `[data-inventory-id="${itemId}"]`
    ];

    let itemElement: HTMLElement | null = null;

    // Try to find the item element using different selectors
    for (const selector of possibleSelectors) {
      itemElement = document.querySelector(selector) as HTMLElement;
      if (itemElement) {
        console.log(`Found item using selector: ${selector}`);
        break;
      }
    }

    // If direct selectors don't work, try to find by text content
    if (!itemElement) {
      const currentItem = allItems.find(i => i.id === itemId);
      if (currentItem) {
        // Look for elements containing the item name
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          if (element.textContent?.trim() === currentItem.name.trim()) {
            // Find the closest parent that looks like an item container
            let parent = element.parentElement;
            while (parent) {
              if (
                parent.classList.contains('item') ||
                parent.classList.contains('inventory-item') ||
                parent.classList.contains('border') ||
                parent.getAttribute('data-item-id') ||
                parent.querySelector('[data-item-id]')
              ) {
                itemElement = parent as HTMLElement;
                console.log('Found item by text content and parent traversal');
                break;
              }
              parent = parent.parentElement;
            }
            if (itemElement) break;
          }
        }
      }
    }

    // If still not found, try to scroll to the category section
    if (!itemElement && categoryId) {
      const categorySectionSelectors = [
        `[data-category="${categoryId}"]`,
        `[data-category-id="${categoryId}"]`,
        `#category-${categoryId}`,
        `[value="${categoryId}"][role="tabpanel"]`
      ];

      for (const selector of categorySectionSelectors) {
        const categorySection = document.querySelector(selector) as HTMLElement;
        if (categorySection) {
          categorySection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          console.log(`Scrolled to category section using selector: ${selector}`);
          
          // Highlight the entire category section temporarily
          categorySection.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          categorySection.style.border = '2px solid rgba(59, 130, 246, 0.3)';
          categorySection.style.borderRadius = '8px';
          
          setTimeout(() => {
            categorySection.style.backgroundColor = '';
            categorySection.style.border = '';
            categorySection.style.borderRadius = '';
          }, 2000);
          
          return;
        }
      }
    }

    // If item element is found, scroll to it
    if (itemElement) {
      // Add highlight styling before scrolling
      const originalStyle = {
        backgroundColor: itemElement.style.backgroundColor,
        border: itemElement.style.border,
        borderRadius: itemElement.style.borderRadius,
        transition: itemElement.style.transition
      };

      itemElement.style.transition = 'all 0.3s ease-in-out'; 

      itemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
 
     
    } else {
      console.warn('Could not find item element to scroll to:', {
        itemId,
        categoryId,
        availableElements: document.querySelectorAll('[data-item-id], [id*="item"], [data-inventory-id]').length
      });

      // As a fallback, try to scroll to any visible item in the current category
      if (categoryId) {
        const categoryItems = document.querySelectorAll(`[data-category-id="${categoryId}"] [data-item-id], [data-category="${categoryId}"] [data-item-id]`);
        if (categoryItems.length > 0) {
          (categoryItems[0] as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          console.log('Scrolled to first item in category as fallback');
        }
      }
    }
  };

  const handleQuantityClick = (e: React.MouseEvent, itemId: string, change: number) => {
    e.stopPropagation();
    handleQuantityUpdate(itemId, change);
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="relative flex flex-col w-full">
      <div className="flex justify-between w-full mb-4 gap-2">
        <section className='flex items-center gap-4 relative'>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchValue}
                onChange={handleInputChange}
                placeholder="Search items..."
                className="max-w-3xl pl-10 pr-10"
              />
            </div>
          </div>
        </section>

        <Button onClick={() => changeState(0)} variant={'outline'}>
          ← Tables
        </Button>
      </div>

      {/* Backdrop Overlay */}
      {showDropdown && searchResults.length > 0 && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/30 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div ref={searchContainerRef} className="absolute top-full left-0 mt-2 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] max-h-80 overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200 flex justify-between items-center cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                >
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                      {highlightMatch(item.name, searchValue)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">₹{item.price}</div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {quantities[item.id] ? (
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={(e) => handleQuantityClick(e, item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {quantities[item.id]}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={(e) => handleQuantityClick(e, item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs px-3 py-1.5 h-7 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={(e) => handleQuantityClick(e, item.id, 1)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && searchValue && searchResults.length === 0 && (
        <div className="absolute top-full left-0 mt-1 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-6 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found for &quot;{searchValue}&quot;</p>
          </div>
        </div>
      )}
    </div>
  )
}