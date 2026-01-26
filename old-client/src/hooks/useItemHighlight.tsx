import { useState, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useRestaurantId } from "./useRestaurantId";

interface HighlightOptions {
  retryCount?: number;
  scrollBehavior?: ScrollBehavior;
  highlightDuration?: number;
  maxRetries?: number;
}

export const useItemHighlight = () => {
  const rid = useRestaurantId();
  const [isHighlighting, setIsHighlighting] = useState(false);
  const highlightTimeoutRef = useRef<NodeJS.Timeout>(null);
  const categoryCache = useRef<Map<string, { id: string; name: string }>>(new Map());

  // Enhanced category fetching with caching
  const fetchCategoryInfo = useCallback(async (categoryId: string) => {
    // Check cache first
    if (categoryCache.current.has(categoryId)) {
      return categoryCache.current.get(categoryId);
    }

    try {
      const url = rid ? `/category?rid=${rid}` : "/category";
      const response = await axiosInstance.get(url);
      
      if (response.data?.categories) {
        // Cache all categories for future use
        response.data.categories.forEach((cat: any) => {
          categoryCache.current.set(cat.id, { id: cat.id, name: cat.name });
        });
        
        return categoryCache.current.get(categoryId);
      }
    } catch (error) {
      console.error("Failed to fetch category information:", error);
    }
    
    return null;
  }, [rid]);

  // Enhanced tab switching with better error handling
  const switchToCategory = useCallback((categoryName: string) => {
    try {
      // Find and click the category tab
      const tabTrigger = document.querySelector(`[value="${categoryName}"]`);
      if (tabTrigger instanceof HTMLElement) {
        tabTrigger.click();
        return true;
      }
      
      // Fallback: try to find by text content
      const allTabs = document.querySelectorAll('[role="tab"]');
      for (const tab of allTabs) {
        if (tab.textContent?.trim().toLowerCase() === categoryName.toLowerCase()) {
          (tab as HTMLElement).click();
          return true;
        }
      }
      
      console.warn(`Could not find tab for category: ${categoryName}`);
      return false;
    } catch (error) {
      console.error("Error switching category tab:", error);
      return false;
    }
  }, []);

  // Enhanced element highlighting with customizable options
  const applyHighlightEffect = useCallback((
    element: HTMLElement, 
    options: HighlightOptions = {}
  ) => {
    const {
      highlightDuration = 2500,
      scrollBehavior = "smooth"
    } = options;

    try {
      // Scroll to element first
      element.scrollIntoView({
        behavior: scrollBehavior,
        block: "center",
        inline: "nearest",
      });

      // Apply highlight styles
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      const originalZIndex = element.style.zIndex;
      
      // Initial highlight state
      element.classList.add(
        "ring-4",
        "ring-orange-400",
        "ring-opacity-90",
        "shadow-2xl",
        "bg-orange-50",
        "border-orange-300"
      );
      
      element.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      element.style.transform = "scale(1.02)";
      element.style.zIndex = "10";

      // Clear any existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Remove highlight after duration
      highlightTimeoutRef.current = setTimeout(() => {
        try {
          element.style.transition = "all 0.6s ease-out";
          element.classList.remove(
            "ring-4",
            "ring-orange-400",
            "ring-opacity-90",
            "shadow-2xl",
            "bg-orange-50",
            "border-orange-300"
          );
          
          element.style.transform = originalTransform;
          element.style.zIndex = originalZIndex;
          
          // Final cleanup after transition
          setTimeout(() => {
            element.style.transition = originalTransition;
            setIsHighlighting(false);
          }, 600);
        } catch (cleanupError) {
          console.warn("Error during highlight cleanup:", cleanupError);
          setIsHighlighting(false);
        }
      }, highlightDuration);

    } catch (error) {
      console.error("Error applying highlight effect:", error);
      setIsHighlighting(false);
    }
  }, []);

  // Enhanced item highlighting with improved retry logic and error handling
  const highlightItem = useCallback(
    async (
      itemId: string,
      categoryId?: string,
      categoryName?: string,
      options: HighlightOptions = {}
    ) => {
      if (isHighlighting) {
        console.log("Highlight already in progress, skipping");
        return;
      }

      const {
        maxRetries = 8,
        retryCount = 0
      } = options;

      setIsHighlighting(true);

      try {
        // Store category name for later use
        let resolvedCategoryName = categoryName;

        // If we don't have categoryName but have categoryId, fetch it
        if (!resolvedCategoryName && categoryId) {
          const categoryInfo = await fetchCategoryInfo(categoryId);
          if (categoryInfo) {
            resolvedCategoryName = categoryInfo.name;
          }
        }

        // Switch to the correct category tab if needed
        if (resolvedCategoryName && resolvedCategoryName !== "All") {
          const tabSwitched = switchToCategory(resolvedCategoryName);
          if (!tabSwitched) {
            console.warn(`Failed to switch to category: ${resolvedCategoryName}`);
            // Try "All" tab as fallback
            switchToCategory("All");
          }
        }

        // Function to attempt highlighting with retries
        const attemptHighlight = (currentRetry = 0) => {
          const itemElement = document.getElementById(`food-item-${itemId}`);
          
          if (itemElement) {
            console.log(`Successfully found item element on attempt ${currentRetry + 1}`);
            applyHighlightEffect(itemElement, options);
          } else if (currentRetry < maxRetries) {
            console.log(`Item not found, retrying... (${currentRetry + 1}/${maxRetries})`);
            
            // Exponential backoff with jitter
            const delay = Math.min(300 + currentRetry * 200 + Math.random() * 100, 2000);
            
            setTimeout(() => {
              attemptHighlight(currentRetry + 1);
            }, delay);
          } else {
            console.warn(`Could not find element with id: food-item-${itemId} after ${maxRetries} attempts`);
            setIsHighlighting(false);
            
            // Last resort: try to scroll to the general area
            if (resolvedCategoryName) {
              const categorySection = document.querySelector(`[data-category="${resolvedCategoryName}"]`);
              if (categorySection) {
                categorySection.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          }
        };

        // Start highlighting attempt with appropriate delay
        const initialDelay = categoryId ? 500 : 100;
        setTimeout(() => {
          attemptHighlight(retryCount);
        }, initialDelay);

      } catch (error) {
        console.error("Error in highlightItem:", error);
        setIsHighlighting(false);
      }
    },
    [rid, fetchCategoryInfo, switchToCategory, applyHighlightEffect, isHighlighting]
  );

  // Clear any ongoing highlighting
  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // Remove highlight from any currently highlighted elements
    const highlightedElements = document.querySelectorAll('.ring-orange-400');
    highlightedElements.forEach((element) => {
      element.classList.remove(
        "ring-4",
        "ring-orange-400",
        "ring-opacity-90",
        "shadow-2xl",
        "bg-orange-50",
        "border-orange-300"
      );
      (element as HTMLElement).style.transform = "";
      (element as HTMLElement).style.zIndex = "";
      (element as HTMLElement).style.transition = "";
    });
    
    setIsHighlighting(false);
  }, []);

  // Batch highlight multiple items (useful for search result sets)
  const highlightMultipleItems = useCallback(
    async (items: Array<{ id: string; categoryId?: string; categoryName?: string }>) => {
      if (items.length === 0) return;
      
      // Highlight the first item normally
      if (items[0]) {
        await highlightItem(items[0].id, items[0].categoryId, items[0].categoryName);
      }
      
      // Add subtle highlights to other items with staggered timing
      items.slice(1).forEach((item, index) => {
        setTimeout(() => {
          const element = document.getElementById(`food-item-${item.id}`);
          if (element) {
            element.classList.add("ring-2", "ring-blue-300", "ring-opacity-50");
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-blue-300", "ring-opacity-50");
            }, 1500);
          }
        }, 200 * (index + 1));
      });
    },
    [highlightItem]
  );

  // Clear category cache when needed
  const clearCategoryCache = useCallback(() => {
    categoryCache.current.clear();
  }, []);

  return {
    highlightItem,
    clearHighlight,
    highlightMultipleItems,
    clearCategoryCache,
    isHighlighting,
    // Utility methods
    utils: {
      switchToCategory,
      fetchCategoryInfo,
    }
  };
};