/**
 * Query Key Factory for TanStack Query
 * 
 * Provides a hierarchical, type-safe structure for generating query keys.
 * This enables efficient cache invalidation and management.
 * 
 * Key Structure:
 * - Level 1: Entity type (tools, favourites, reviews)
 * - Level 2: Query type (list, search, detail, etc.)
 * - Level 3: Parameters (filters, IDs, etc.)
 * 
 * Example:
 * - ['tools'] - All tools queries
 * - ['tools', 'list'] - All list queries
 * - ['tools', 'list', { language: 'en', category: 'chatbot' }] - Specific list query
 * 
 * Benefits:
 * - Invalidate all tools: queryClient.invalidateQueries({ queryKey: queryKeys.tools.all })
 * - Invalidate all lists: queryClient.invalidateQueries({ queryKey: queryKeys.tools.lists() })
 * - Invalidate specific query: queryClient.invalidateQueries({ queryKey: queryKeys.tools.list(filters) })
 */

export const queryKeys = {
  // ============================================================================
  // TOOLS QUERIES
  // ============================================================================
  tools: {
    // Base key for all tools queries
    all: ['tools'] as const,
    
    // List queries (browse page)
    lists: () => [...queryKeys.tools.all, 'list'] as const,
    list: (filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }) => [...queryKeys.tools.lists(), filters] as const,
    
    // Paginated list queries (for infinite scroll)
    paginatedLists: () => [...queryKeys.tools.all, 'paginatedList'] as const,
    paginatedList: (filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }) => [...queryKeys.tools.paginatedLists(), filters] as const,
    
    // Search queries (keyword search)
    searches: () => [...queryKeys.tools.all, 'search'] as const,
    search: (params: {
      searchTerm: string;
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }) => [...queryKeys.tools.searches(), params] as const,
    
    // Paginated search queries (for infinite scroll)
    paginatedSearches: () => [...queryKeys.tools.all, 'paginatedSearch'] as const,
    paginatedSearch: (params: {
      searchTerm: string;
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }) => [...queryKeys.tools.paginatedSearches(), params] as const,
    
    // Vector/semantic search queries
    vectorSearches: () => [...queryKeys.tools.all, 'vectorSearch'] as const,
    vectorSearch: (params: {
      vector: number[];
      limit: number;
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }) => [...queryKeys.tools.vectorSearches(), params] as const,
    
    // Individual tool details
    details: () => [...queryKeys.tools.all, 'detail'] as const,
    detail: (toolId: string) => [...queryKeys.tools.details(), toolId] as const,
    
    // Similar tools (based on embeddings)
    similarTools: (toolId: string, limit?: number) => 
      [...queryKeys.tools.all, 'similar', toolId, { limit }] as const,
    
    // User's submitted tools
    userTools: () => [...queryKeys.tools.all, 'userTools'] as const,
    
    // Categories
    categories: (language?: 'en' | 'vi') => 
      [...queryKeys.tools.all, 'categories', { language }] as const,
    
    // Statistics
    stats: () => [...queryKeys.tools.all, 'stats'] as const,
    
    // Duplicate check
    duplicateCheck: (params: {
      url?: string;
      name?: string;
      excludeToolId?: string;
    }) => [...queryKeys.tools.all, 'duplicateCheck', params] as const,
    
    // Embedding-related queries
    embeddingStats: () => [...queryKeys.tools.all, 'embeddingStats'] as const,
    toolsWithoutEmbeddings: () => [...queryKeys.tools.all, 'withoutEmbeddings'] as const,
  },
  
  // ============================================================================
  // FAVOURITES QUERIES
  // ============================================================================
  favourites: {
    // Base key for all favourites queries
    all: ['favourites'] as const,
    
    // User's favourite tool IDs (for quick lookup)
    ids: () => [...queryKeys.favourites.all, 'ids'] as const,
    
    // User's favourite tools (full data)
    list: () => [...queryKeys.favourites.all, 'list'] as const,
    
    // Check if specific tool is favourited
    isFavourited: (toolId: string) => 
      [...queryKeys.favourites.all, 'isFavourited', toolId] as const,
  },
  
  // ============================================================================
  // REVIEWS QUERIES
  // ============================================================================
  reviews: {
    // Base key for all reviews queries
    all: ['reviews'] as const,
    
    // Reviews for a specific tool
    byTool: (toolId: string, sortBy?: 'recent' | 'helpful') => 
      [...queryKeys.reviews.all, 'tool', toolId, { sortBy }] as const,
    
    // User's review for a specific tool
    userReviewForTool: (toolId: string) => 
      [...queryKeys.reviews.all, 'userReview', toolId] as const,
    
    // Check if user voted on a review
    hasVoted: (reviewId: string) => 
      [...queryKeys.reviews.all, 'hasVoted', reviewId] as const,
  },
  
  // ============================================================================
  // SEARCH CACHE QUERIES (for semantic search optimization)
  // ============================================================================
  searchCache: {
    // Base key for search cache queries
    all: ['searchCache'] as const,
    
    // Cached search result by query hash
    byQueryHash: (queryHash: string) => 
      [...queryKeys.searchCache.all, 'queryHash', queryHash] as const,
  },
  
  // ============================================================================
  // ANALYTICS QUERIES
  // ============================================================================
  analytics: {
    // Base key for analytics queries
    all: ['analytics'] as const,
    
    // Search analytics
    searchAnalytics: (filters?: {
      startDate?: number;
      endDate?: number;
      searchType?: string;
    }) => [...queryKeys.analytics.all, 'search', filters] as const,
  },
} as const;

/**
 * Type helper to extract query key types
 * Useful for type-safe cache manipulation
 */
export type QueryKeys = typeof queryKeys;

/**
 * Helper function to generate a query key for any Convex query
 * Useful for queries not covered by the factory
 * 
 * @param queryName - The Convex query function name (e.g., 'aiTools.listTools')
 * @param args - The query arguments
 * @returns A query key array
 */
export function convexQueryKey<T extends Record<string, unknown>>(
  queryName: string,
  args: T | 'skip'
): readonly [string, T | 'skip'] {
  return [queryName, args] as const;
}
