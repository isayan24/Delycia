export interface SearchResult {
    id: string;
    name: string;
    price: number;
    category_id: string;
  }
export const fuzzySearch = (query: string, items: any[]): SearchResult[] => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
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
    
    // Score and filter items
    const scoredItems = items
      .map(item => ({
        ...item,
        score: calculateScore(item.name, normalizedQuery)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 results
    
    return scoredItems.map(({ score, ...item }) => item);
  };