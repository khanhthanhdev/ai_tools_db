import { queryClient, queryConfigs } from './queryClient';
import { queryKeys } from './queryKeys';
import { ConvexClient } from 'convex/browser';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Optimized prefetch utilities with data-type specific configurations
 * 
 * These utilities use the optimized query configurations to ensure
 * prefetched data has appropriate cache settings for different data types.
 */

export const prefetchTools = {
  /**
   * Prefetch tools list with optimized caching
   */
  list: async (
    convex: ConvexClient,
    filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.list(filters),
      queryFn: () => convex.query('aiTools:listTools' as any, filters),
      ...queryConfigs.prefetch,
    });
  },

  /**
   * Prefetch paginated tools list for infinite scroll
   */
  paginatedList: async (
    convex: ConvexClient,
    filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.tools.paginatedList(filters),
      queryFn: ({ pageParam }) => convex.query('aiTools:listToolsPaginated' as any, {
        ...filters,
        paginationOpts: {
          numItems: 20,
          cursor: pageParam as string | undefined,
        }
      }),
      initialPageParam: undefined,
      ...queryConfigs.prefetch,
      ...queryConfigs.infiniteQuery,
    });
  },

  /**
   * Prefetch tool details on hover (optimized for quick access)
   */
  onHover: async (convex: ConvexClient, toolId: Id<"aiTools">) => {
    // Check if already in cache to avoid unnecessary requests
    const existingData = queryClient.getQueryData(queryKeys.tools.detail(toolId));
    if (existingData) {
      return; // Already cached
    }

    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.detail(toolId),
      queryFn: () => convex.query('aiTools:getTool' as any, { id: toolId }),
      ...queryConfigs.prefetch,
    });
  },

  /**
   * Prefetch similar tools (used in tool detail pages)
   */
  similar: async (convex: ConvexClient, toolId: Id<"aiTools">, limit = 6) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.similarTools(toolId, limit),
      queryFn: () => convex.query('aiTools:getSimilarTools' as any, { toolId, limit }),
      ...queryConfigs.prefetch,
    });
  },

  /**
   * Prefetch categories (static data with long cache)
   */
  categories: async (convex: ConvexClient, language?: 'en' | 'vi') => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.categories(language),
      queryFn: () => convex.query('aiTools:getCategories' as any, language ? { language } : {}),
      ...queryConfigs.staticData, // Use static data config for categories
    });
  },

  /**
   * Prefetch search results
   */
  search: async (
    convex: ConvexClient,
    params: {
      searchTerm: string;
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.search(params),
      queryFn: () => convex.query('aiTools:searchTools' as any, params),
      ...queryConfigs.searchData,
    });
  },

  /**
   * Prefetch paginated search results
   */
  paginatedSearch: async (
    convex: ConvexClient,
    params: {
      searchTerm: string;
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.tools.paginatedSearch(params),
      queryFn: ({ pageParam }) => convex.query('aiTools:searchToolsPaginated' as any, {
        ...params,
        paginationOpts: {
          numItems: 20,
          cursor: pageParam as string | undefined,
        }
      }),
      initialPageParam: undefined,
      ...queryConfigs.searchData,
      ...queryConfigs.infiniteQuery,
    });
  },
};

export const prefetchFavourites = {
  /**
   * Prefetch user's favourite IDs (user-specific data)
   */
  ids: async (convex: ConvexClient) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.favourites.ids(),
      queryFn: () => convex.query('favourites:getUserFavouriteIds' as any, {}),
      ...queryConfigs.userData,
    });
  },

  /**
   * Prefetch user's favourite tools list
   */
  list: async (convex: ConvexClient) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.favourites.list(),
      queryFn: () => convex.query('favourites:getUserFavouriteTools' as any, {}),
      ...queryConfigs.userData,
    });
  },
};

export const prefetchReviews = {
  /**
   * Prefetch reviews for a specific tool
   */
  byTool: async (convex: ConvexClient, toolId: Id<"aiTools">, sortBy: 'recent' | 'helpful' = 'helpful') => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.reviews.byTool(toolId, sortBy),
      queryFn: () => convex.query('reviews:getToolReviews' as any, { toolId, sortBy }),
      ...queryConfigs.prefetch,
    });
  },
};

/**
 * Batch prefetch utilities for common page loads
 */
export const batchPrefetch = {
  /**
   * Prefetch data needed for the browse page
   */
  browsePage: async (
    convex: ConvexClient,
    filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await Promise.all([
      prefetchTools.paginatedList(convex, filters),
      prefetchTools.categories(convex, filters.language),
      prefetchFavourites.ids(convex), // Prefetch in parallel for authenticated users
    ]);
  },

  /**
   * Prefetch data needed for tool detail page
   */
  toolDetailPage: async (convex: ConvexClient, toolId: Id<"aiTools">) => {
    await Promise.all([
      prefetchTools.similar(convex, toolId),
      prefetchReviews.byTool(convex, toolId),
      prefetchFavourites.ids(convex),
    ]);
  },

  /**
   * Prefetch data for favourites page
   */
  favouritesPage: async (convex: ConvexClient) => {
    await Promise.all([
      prefetchFavourites.list(convex),
      prefetchTools.categories(convex), // For filtering favourites
    ]);
  },
};



/**
 * Debounced hover prefetch utility
 */
export function createHoverPrefetcher(convex: ConvexClient, delay = 200) {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    prefetchOnHover: (toolId: Id<"aiTools">) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        prefetchTools.onHover(convex, toolId);
      }, delay);
    },

    cancelPrefetch: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}