import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized Query Client Configuration
 * 
 * Different data types have different freshness requirements:
 * - Static data (categories, stats): Long cache times
 * - User-specific data (favourites, reviews): Shorter cache times
 * - Search results: Medium cache times with aggressive prefetching
 * - Tool details: Medium cache times, frequently accessed
 */

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  // Stale times (how long data is considered fresh)
  STATIC_DATA_STALE: 15 * 60 * 1000,      // 15 minutes - categories, stats
  TOOL_DATA_STALE: 5 * 60 * 1000,         // 5 minutes - tool lists, details
  USER_DATA_STALE: 2 * 60 * 1000,         // 2 minutes - favourites, user reviews
  SEARCH_DATA_STALE: 3 * 60 * 1000,       // 3 minutes - search results
  REAL_TIME_DATA_STALE: 30 * 1000,        // 30 seconds - analytics, live stats
  
  // Garbage collection times (how long unused data stays in memory)
  STATIC_DATA_GC: 30 * 60 * 1000,         // 30 minutes
  TOOL_DATA_GC: 15 * 60 * 1000,           // 15 minutes
  USER_DATA_GC: 10 * 60 * 1000,           // 10 minutes
  SEARCH_DATA_GC: 10 * 60 * 1000,         // 10 minutes
  REAL_TIME_DATA_GC: 5 * 60 * 1000,       // 5 minutes
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default configuration for tool data (most common case)
      staleTime: CACHE_TIMES.TOOL_DATA_STALE,
      gcTime: CACHE_TIMES.TOOL_DATA_GC,
      
      // Retry configuration optimized for different error types
      retry: (failureCount: number, error: Error) => {
        // Don't retry on authentication errors
        if (error.message.includes('Unauthorized') || 
            error.message.includes('Forbidden') ||
            error.message.includes('401') ||
            error.message.includes('403')) {
          return false;
        }
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('400') || 
            error.message.includes('404') ||
            error.message.includes('422')) {
          return false;
        }
        
        // Retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex: number) => {
        return Math.min(1000 * 2 ** attemptIndex, 10000); // Max 10 second delay
      },
      
      // Don't refetch on window focus to avoid unnecessary requests
      refetchOnWindowFocus: false,
      
      // Refetch when reconnecting to get fresh data
      refetchOnReconnect: true,
      
      // Enable stale-while-revalidate: always refetch but show stale data immediately
      refetchOnMount: (query) => {
        // Always refetch real-time data
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey) && queryKey.length > 0) {
          const firstKey = queryKey[0] as string;
          
          // Always refetch real-time data
          if (firstKey.includes('analytics') || firstKey.includes('stats')) {
            return true;
          }
          
          // Don't refetch static data that rarely changes
          if (firstKey === 'tools' && 
              (queryKey[1] === 'categories' || queryKey[1] === 'stats')) {
            return query.state.dataUpdatedAt === 0; // Only if no data
          }
        }
        
        // For all other queries, enable stale-while-revalidate
        // This will show cached data immediately while refetching in background
        return true;
      },
      
      // Network mode configuration
      networkMode: 'online', // Only run queries when online
    },
    
    mutations: {
      // Retry mutations once for transient errors
      retry: (failureCount: number, error: Error) => {
        // Don't retry on client errors
        if (error.message.includes('400') || 
            error.message.includes('401') ||
            error.message.includes('403') ||
            error.message.includes('404') ||
            error.message.includes('422')) {
          return false;
        }
        
        // Retry once for network/server errors
        return failureCount < 1;
      },
      
      // Shorter retry delay for mutations (user is waiting)
      retryDelay: 1000, // 1 second
      
      // Run mutations even when offline (will queue)
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Query-specific configuration overrides
 * Use these with individual queries to override default settings
 */
export const queryConfigs = {
  // Static data that rarely changes
  staticData: {
    staleTime: CACHE_TIMES.STATIC_DATA_STALE,
    gcTime: CACHE_TIMES.STATIC_DATA_GC,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  
  // User-specific data that should be kept fresh
  userData: {
    staleTime: CACHE_TIMES.USER_DATA_STALE,
    gcTime: CACHE_TIMES.USER_DATA_GC,
    refetchOnReconnect: true,
  },
  
  // Search results with medium freshness and stale-while-revalidate
  searchData: {
    staleTime: CACHE_TIMES.SEARCH_DATA_STALE,
    gcTime: CACHE_TIMES.SEARCH_DATA_GC,
    refetchOnMount: true, // Enable stale-while-revalidate for search results
    refetchOnReconnect: true,
  },
  
  // Real-time data that should be frequently updated
  realTimeData: {
    staleTime: CACHE_TIMES.REAL_TIME_DATA_STALE,
    gcTime: CACHE_TIMES.REAL_TIME_DATA_GC,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  },
  
  // Prefetch configuration for hover/viewport prefetching
  prefetch: {
    staleTime: CACHE_TIMES.TOOL_DATA_STALE,
    gcTime: CACHE_TIMES.TOOL_DATA_GC,
    retry: 0, // Don't retry prefetch requests
  },
  
  // Infinite query configuration for paginated data
  infiniteQuery: {
    staleTime: CACHE_TIMES.SEARCH_DATA_STALE,
    gcTime: CACHE_TIMES.SEARCH_DATA_GC,
    refetchOnMount: true, // Enable stale-while-revalidate for infinite queries
    getNextPageParam: (lastPage: any) => lastPage?.nextCursor ?? undefined,
    getPreviousPageParam: (firstPage: any) => firstPage?.prevCursor ?? undefined,
    maxPages: 10, // Limit memory usage for infinite queries
  },
  
  // Stale-while-revalidate configuration for optimal UX
  staleWhileRevalidate: {
    staleTime: CACHE_TIMES.TOOL_DATA_STALE,
    gcTime: CACHE_TIMES.TOOL_DATA_GC,
    refetchOnMount: true, // Always refetch but show stale data immediately
    refetchOnReconnect: true,
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid excessive requests
    // Show stale data while refetching in background
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isFetching'],
  },
} as const;

/**
 * Helper function to get optimized query config based on query type
 */
export function getQueryConfig(queryKey: readonly unknown[]) {
  if (!Array.isArray(queryKey) || queryKey.length === 0) {
    return {};
  }
  
  const firstKey = queryKey[0] as string;
  const secondKey = queryKey[1] as string;
  
  // Static data configurations
  if (firstKey === 'tools' && (secondKey === 'categories' || secondKey === 'stats')) {
    return queryConfigs.staticData;
  }
  
  // User-specific data configurations
  if (firstKey === 'favourites' || 
      (firstKey === 'reviews' && secondKey === 'userReview')) {
    return queryConfigs.userData;
  }
  
  // Search data configurations with stale-while-revalidate
  if (firstKey === 'tools' && 
      (secondKey === 'search' || secondKey === 'paginatedSearch' || secondKey === 'vectorSearch')) {
    return { ...queryConfigs.searchData, ...queryConfigs.staleWhileRevalidate };
  }
  
  // Real-time data configurations
  if (firstKey === 'analytics' || 
      (firstKey === 'tools' && secondKey === 'embeddingStats')) {
    return queryConfigs.realTimeData;
  }
  
  // Default configuration for tool data with stale-while-revalidate
  if (firstKey === 'tools') {
    return queryConfigs.staleWhileRevalidate;
  }
  
  // Default configuration
  return {};
}
