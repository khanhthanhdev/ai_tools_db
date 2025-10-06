/**
 * Cache Invalidation Utilities for TanStack Query + Convex Integration
 * 
 * This module provides utilities for invalidating cached queries and performing
 * selective cache updates to maintain data consistency after mutations.
 * 
 * Key Features:
 * - Hierarchical invalidation (invalidate all tools vs specific tool)
 * - Selective cache updates for optimistic UI updates
 * - Type-safe cache manipulation
 * - Rollback utilities for failed mutations
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Cache invalidation utilities
 * These functions invalidate cached queries to trigger refetches
 */
export const invalidateQueries = {
  // ============================================================================
  // TOOLS INVALIDATION
  // ============================================================================
  
  /**
   * Invalidate all tools-related queries
   * Use when tools data structure changes significantly
   */
  allTools: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.all 
    });
  },

  /**
   * Invalidate all tools list queries (browse page data)
   * Use after adding/editing/deleting tools
   */
  toolsLists: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.lists() 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.paginatedLists() 
    });
    // Also invalidate the actual infinite query keys used by useConvexInfiniteQuery
    queryClient.invalidateQueries({ 
      queryKey: ['aiTools.listToolsPaginated', 'infinite'] 
    });
  },

  /**
   * Invalidate all search queries
   * Use when search results might be affected by tool changes
   */
  toolsSearches: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.searches() 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.paginatedSearches() 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.vectorSearches() 
    });
    // Also invalidate the actual infinite query keys used by useConvexInfiniteQuery
    queryClient.invalidateQueries({ 
      queryKey: ['aiTools.searchToolsPaginated', 'infinite'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['aiTools.vectorSearchPaginated', 'infinite'] 
    });
  },

  /**
   * Invalidate specific tool detail
   * Use after editing a specific tool
   */
  toolDetail: (queryClient: QueryClient, toolId: Id<'aiTools'>) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.detail(toolId) 
    });
  },

  /**
   * Invalidate similar tools for a specific tool
   * Use when tool embeddings or relationships change
   */
  similarTools: (queryClient: QueryClient, toolId: Id<'aiTools'>) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.similarTools(toolId) 
    });
  },

  /**
   * Invalidate user's submitted tools
   * Use after user adds/edits/deletes their tools
   */
  userTools: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.userTools() 
    });
  },

  /**
   * Invalidate categories
   * Use when new categories are added or category data changes
   */
  categories: (queryClient: QueryClient, language?: 'en' | 'vi') => {
    if (language) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tools.categories(language) 
      });
    } else {
      // Invalidate all language variants
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tools.categories('en') 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tools.categories('vi') 
      });
    }
  },

  /**
   * Invalidate statistics
   * Use after any tool mutations that affect counts
   */
  stats: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tools.stats() 
    });
  },

  // ============================================================================
  // FAVOURITES INVALIDATION
  // ============================================================================

  /**
   * Invalidate all favourites queries
   * Use when favourite relationships change
   */
  allFavourites: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.favourites.all 
    });
  },

  /**
   * Invalidate favourite IDs (lightweight query)
   * Use after toggling favourites
   */
  favouriteIds: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.favourites.ids() 
    });
  },

  /**
   * Invalidate favourites list (full data)
   * Use when favourites page needs refresh
   */
  favouritesList: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.favourites.list() 
    });
  },

  /**
   * Invalidate specific tool's favourite status
   * Use for targeted updates
   */
  toolFavouriteStatus: (queryClient: QueryClient, toolId: Id<'aiTools'>) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.favourites.isFavourited(toolId) 
    });
  },

  // ============================================================================
  // REVIEWS INVALIDATION
  // ============================================================================

  /**
   * Invalidate all reviews queries
   * Use when review system changes significantly
   */
  allReviews: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.reviews.all 
    });
  },

  /**
   * Invalidate reviews for a specific tool
   * Use after adding/editing/deleting reviews for a tool
   */
  toolReviews: (queryClient: QueryClient, toolId: Id<'aiTools'>, sortBy?: 'recent' | 'helpful') => {
    if (sortBy) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reviews.byTool(toolId, sortBy) 
      });
    } else {
      // Invalidate all sort variants for this tool
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reviews.byTool(toolId, 'recent') 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reviews.byTool(toolId, 'helpful') 
      });
    }
  },

  /**
   * Invalidate user's review for a specific tool
   * Use after user adds/edits/deletes their review
   */
  userReviewForTool: (queryClient: QueryClient, toolId: Id<'aiTools'>) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.reviews.userReviewForTool(toolId) 
    });
  },

  /**
   * Invalidate vote status for a review
   * Use after user votes on a review
   */
  reviewVoteStatus: (queryClient: QueryClient, reviewId: Id<'reviews'>) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.reviews.hasVoted(reviewId) 
    });
  },
};

/**
 * Selective cache update utilities
 * These functions update cached data directly without triggering refetches
 * Useful for optimistic updates and immediate UI feedback
 */
export const updateCache = {
  // ============================================================================
  // FAVOURITES OPTIMISTIC UPDATES
  // ============================================================================

  /**
   * Optimistically toggle favourite status
   * Updates both favourite IDs and favourite status queries
   */
  toggleFavourite: (
    queryClient: QueryClient, 
    toolId: Id<'aiTools'>, 
    isFavourited: boolean
  ) => {
    // Update favourite IDs list
    queryClient.setQueryData<Id<'aiTools'>[]>(
      queryKeys.favourites.ids(),
      (oldIds = []) => {
        return isFavourited
          ? [...oldIds, toolId]
          : oldIds.filter(id => id !== toolId);
      }
    );

    // Update specific favourite status
    queryClient.setQueryData(
      queryKeys.favourites.isFavourited(toolId),
      isFavourited
    );

    // Update favourites list if it exists in cache
    queryClient.setQueryData(
      queryKeys.favourites.list(),
      (oldFavourites: any[] = []) => {
        if (isFavourited) {
          // Don't add to list optimistically - we don't have full tool data
          return oldFavourites;
        } else {
          // Remove from list
          return oldFavourites.filter((fav: any) => fav._id !== toolId);
        }
      }
    );
  },

  // ============================================================================
  // TOOLS OPTIMISTIC UPDATES
  // ============================================================================

  /**
   * Optimistically update tool in lists after edit
   * Updates the tool data across all relevant list queries
   */
  updateToolInLists: (
    queryClient: QueryClient,
    updatedTool: any // Tool data from mutation result
  ) => {
    // Update all list queries that might contain this tool
    queryClient.setQueriesData(
      { queryKey: queryKeys.tools.lists() },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            tools: page.tools?.map((tool: any) => 
              tool._id === updatedTool._id ? updatedTool : tool
            ) || [],
          })),
        };
      }
    );

    // Update paginated list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.tools.paginatedLists() },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            tools: page.tools?.map((tool: any) => 
              tool._id === updatedTool._id ? updatedTool : tool
            ) || [],
          })),
        };
      }
    );

    // Update tool detail if cached
    queryClient.setQueryData(
      queryKeys.tools.detail(updatedTool._id),
      updatedTool
    );
  },

  /**
   * Optimistically remove tool from lists after delete
   */
  removeToolFromLists: (
    queryClient: QueryClient,
    toolId: Id<'aiTools'>
  ) => {
    // Remove from all list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.tools.lists() },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            tools: page.tools?.filter((tool: any) => tool._id !== toolId) || [],
          })),
        };
      }
    );

    // Remove from paginated list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.tools.paginatedLists() },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            tools: page.tools?.filter((tool: any) => tool._id !== toolId) || [],
          })),
        };
      }
    );

    // Remove tool detail from cache
    queryClient.removeQueries({
      queryKey: queryKeys.tools.detail(toolId)
    });
  },

  // ============================================================================
  // REVIEWS OPTIMISTIC UPDATES
  // ============================================================================

  /**
   * Optimistically add review to tool's reviews list
   */
  addReviewToTool: (
    queryClient: QueryClient,
    toolId: Id<'aiTools'>,
    newReview: any
  ) => {
    // Add to recent reviews
    queryClient.setQueryData(
      queryKeys.reviews.byTool(toolId, 'recent'),
      (oldReviews: any[] = []) => [newReview, ...oldReviews]
    );

    // Update user's review for this tool
    queryClient.setQueryData(
      queryKeys.reviews.userReviewForTool(toolId),
      newReview
    );
  },

  /**
   * Optimistically update review vote count
   */
  updateReviewVotes: (
    queryClient: QueryClient,
    toolId: Id<'aiTools'>,
    reviewId: Id<'reviews'>,
    voteChange: number, // +1 for upvote, -1 for downvote, 0 for remove vote
    hasVoted: boolean
  ) => {
    // Update reviews list
    queryClient.setQueriesData(
      { queryKey: queryKeys.reviews.byTool(toolId) },
      (oldReviews: any[] = []) => {
        return oldReviews.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulVotes: (review.helpfulVotes || 0) + voteChange }
            : review
        );
      }
    );

    // Update vote status
    queryClient.setQueryData(
      queryKeys.reviews.hasVoted(reviewId),
      hasVoted
    );
  },
};

/**
 * Rollback utilities for failed optimistic updates
 * These functions restore previous cache state when mutations fail
 */
export const rollbackCache = {
  /**
   * Rollback favourite toggle on mutation failure
   */
  favouriteToggle: (
    queryClient: QueryClient,
    toolId: Id<'aiTools'>,
    previousState: {
      favouriteIds: Id<'aiTools'>[];
      isFavourited: boolean;
      favouritesList?: any[];
    }
  ) => {
    // Restore favourite IDs
    queryClient.setQueryData(
      queryKeys.favourites.ids(),
      previousState.favouriteIds
    );

    // Restore favourite status
    queryClient.setQueryData(
      queryKeys.favourites.isFavourited(toolId),
      previousState.isFavourited
    );

    // Restore favourites list if provided
    if (previousState.favouritesList) {
      queryClient.setQueryData(
        queryKeys.favourites.list(),
        previousState.favouritesList
      );
    }
  },

  /**
   * Rollback tool update on mutation failure
   */
  toolUpdate: (
    queryClient: QueryClient,
    toolId: Id<'aiTools'>,
    previousTool: any
  ) => {
    // Restore tool in all list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.tools.lists() },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            tools: page.tools?.map((tool: any) => 
              tool._id === toolId ? previousTool : tool
            ) || [],
          })),
        };
      }
    );

    // Restore tool detail
    queryClient.setQueryData(
      queryKeys.tools.detail(toolId),
      previousTool
    );
  },
};

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Get current cache state for a query
   * Useful for storing state before optimistic updates
   */
  getCacheState: <T>(queryClient: QueryClient, queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  /**
   * Check if a query is currently cached
   */
  isCached: (queryClient: QueryClient, queryKey: readonly unknown[]): boolean => {
    return queryClient.getQueryData(queryKey) !== undefined;
  },

  /**
   * Clear all cache (use sparingly, e.g., on logout)
   */
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  /**
   * Clear cache for a specific entity type
   */
  clearEntity: (queryClient: QueryClient, entityType: 'tools' | 'favourites' | 'reviews') => {
    switch (entityType) {
      case 'tools':
        queryClient.removeQueries({ queryKey: queryKeys.tools.all });
        break;
      case 'favourites':
        queryClient.removeQueries({ queryKey: queryKeys.favourites.all });
        break;
      case 'reviews':
        queryClient.removeQueries({ queryKey: queryKeys.reviews.all });
        break;
    }
  },
};