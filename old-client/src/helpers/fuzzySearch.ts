export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category_id?: string;
  category_name?: string;
  images?: any[];
  is_veg?: boolean;
  status?: string;
  stock?: number;
  similarity_score?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category_id?: string;
  images?: any[];
  is_veg?: boolean;
  status?: string;
  stock?: number;
}

// Input normalization function
const normalizeSearchInput = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
};

export const fuzzySearch = (
  query: string, 
  items: InventoryItem[], 
  categoryMap?: Map<string, string>
): SearchResult[] => {
  const startTime = performance.now();
  
  try {
    // Validate inputs
    if (!query || typeof query !== 'string' || !query.trim()) return [];
    if (!items || !Array.isArray(items)) return [];
    
    // Normalize and validate input
    const normalizedQuery = normalizeSearchInput(query);
    
    // Return empty results for very short queries or invalid input
    if (normalizedQuery.length < 1) return [];

    // Validate items array is not empty
    if (items.length === 0) return [];

    // Performance optimization: limit search scope for very large datasets
    const searchItems = items.length > 1000 ? items.slice(0, 1000) : items;
  
  // Function to calculate match score
  const calculateScore = (text: string, query: string): number => {
    const normalizedText = text.toLowerCase();
    
    // Exact match gets highest score
    if (normalizedText === query) return 1000;
    
    // Starts with query gets high score
    if (normalizedText.startsWith(query)) return 900;
    
    // Contains query as whole word gets good score
    if (normalizedText.includes(` ${query} `) || normalizedText.includes(` ${query}`)) return 800;
    
    // Contains query gets medium score
    if (normalizedText.includes(query)) return 700;
    
    // Character-by-character fuzzy matching
    let score = 0;
    let queryIndex = 0;
    let consecutiveMatches = 0;
    
    for (let i = 0; i < normalizedText.length && queryIndex < query.length; i++) {
      if (normalizedText[i] === query[queryIndex]) {
        score += 10;
        queryIndex++;
        consecutiveMatches++;
        
        // Bonus for consecutive matches
        if (consecutiveMatches > 1) {
          score += consecutiveMatches * 5;
        }
      } else {
        consecutiveMatches = 0;
      }
    }
    
    // Penalty for incomplete matches
    if (queryIndex < query.length) {
      score = score * (queryIndex / query.length);
    }
    
    // Bonus for shorter strings (more relevant)
    score += Math.max(0, 50 - normalizedText.length);
    
    return score;
  };

  // Enhanced scoring that includes name, description, and category
  const calculateItemScore = (item: InventoryItem, query: string): number => {
    // Score based on item name (highest priority) - always check this first
    const nameScore = calculateScore(item.name, query);
    
    // Early return for exact or high-scoring name matches to improve performance
    if (nameScore >= 800) {
      return nameScore;
    }
    
    let maxScore = nameScore;
    
    // Score based on description (medium priority) - only if name score is low
    if (item.description && nameScore < 700) {
      const descScore = calculateScore(item.description, query) * 0.7;
      maxScore = Math.max(maxScore, descScore);
    }
    
    // Score based on category name (lower priority) - only if other scores are low
    if (maxScore < 600 && item.category_id && categoryMap?.has(item.category_id)) {
      const categoryName = categoryMap.get(item.category_id)!;
      const categoryScore = calculateScore(categoryName, query) * 0.5;
      maxScore = Math.max(maxScore, categoryScore);
    }
    
    return maxScore;
  };
  
    // Score and filter items with performance optimizations
    const scoredItems: SearchResult[] = [];
    
    // Use a more efficient approach for large datasets
    for (const item of searchItems) {
      // Validate item structure
      if (!item || typeof item !== 'object' || !item.id || !item.name) {
        continue; // Skip invalid items
      }

      try {
        const score = calculateItemScore(item, normalizedQuery);
        
        // Only process items with a minimum score to improve performance
        if (score > 0) {
          const categoryName = item.category_id && categoryMap?.has(item.category_id) 
            ? categoryMap.get(item.category_id) 
            : undefined;
          
          scoredItems.push({
            ...item,
            category_name: categoryName,
            similarity_score: score
          });
          
          // Early termination if we have enough high-scoring results
          if (scoredItems.length >= 50 && score < 300) {
            break;
          }
        }
      } catch (itemError) {
        console.warn('Error processing item:', item.id, itemError);
        continue; // Skip problematic items
      }
    }
    
    // Sort by similarity score (highest first) and limit to top 20
    const results = scoredItems
      .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
      .slice(0, 20);

    // Performance monitoring
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance metrics for monitoring
    if (duration > 50) { // Log if search takes more than 50ms
      console.warn(`Fuzzy search performance: ${duration.toFixed(2)}ms for ${searchItems.length} items, query: "${query}"`);
    }

    return results;

  } catch (error) {
    console.error('Fuzzy search error:', error);
    return []; // Return empty results on error
  }
};
  