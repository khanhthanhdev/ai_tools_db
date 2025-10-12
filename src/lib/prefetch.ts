/**
 * Prefetch Utilities for TanStack Query + Convex Integration
 * 
 * This module provides utilities for proactive data fetching to improve
 * perceived performance and user experience.
 */

import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { queryKeys } from './queryKeys';

/**
 * Prefetch utilities for tools data
 */
export const prefetchTools = {
  /**
   * Prefetch tools list with given filters
   */
  list: async (
    queryClient: QueryClient,
    convex: ConvexReactClient,
    filters: {
      language?: 'en' | 'vi';
      category?: string;
      pricing?: 'free' | 'freemium' | 'paid';
    }
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.paginatedList(filters),
      queryFn: () => convex.query(api.aiTools.listToolsPaginated, {
        ...filters,
        paginationOpts: {
          numItems: 20,
          cursor: null,
        },
      }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Prefetch tool details on hover
   */
  onHover: async (
    queryClient: QueryClient,
    convex: ConvexReactClient,
    toolId: Id<"aiTools">
  ) => {
    // Check if already cached to avoid unnecessary prefetch
    const queryKey = queryKeys.tools.detail(toolId);
    const cachedData = queryClient.getQueryData(queryKey);

    if (!cachedData) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => convex.query(api.aiTools.getToolById, { toolId }),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  },

  /**
   * Prefetch favourites in parallel with tools data
   */
  favourites: async (
    queryClient: QueryClient,
    convex: ConvexReactClient
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.favourites.ids(),
      queryFn: () => convex.query(api.favourites.getUserFavouriteIds, {}),
      staleTime: 2 * 60 * 1000, // 2 minutes for user-specific data
    });
  },



  /**
   * Prefetch data when user is authenticated (for route navigation)
   */
  onAuthentication: async (
    queryClient: QueryClient,
    convex: ConvexReactClient
  ) => {
    // Prefetch favourite IDs for quick lookup
    await queryClient.prefetchQuery({
      queryKey: queryKeys.favourites.ids(),
      queryFn: () => convex.query(api.favourites.getUserFavouriteIds, {}),
      staleTime: 2 * 60 * 1000, // 2 minutes for user-specific data
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Prefetched favourites for authenticated user');
    }
  },

  /**
   * Prefetch route-specific data
   */
  forRoute: async (
    queryClient: QueryClient,
    convex: ConvexReactClient,
    route: string
  ) => {
    switch (route) {
      case '/favourites':
        // Prefetch full favourites list
        await queryClient.prefetchQuery({
          queryKey: queryKeys.favourites.list(),
          queryFn: () => convex.query(api.favourites.getUserFavourites, {}),
          staleTime: 2 * 60 * 1000,
        });
        break;

      case '/stats':
        // Prefetch statistics data
        await queryClient.prefetchQuery({
          queryKey: queryKeys.tools.stats(),
          queryFn: () => convex.query(api.aiTools.getToolStats, {}),
          staleTime: 10 * 60 * 1000,
        });
        break;

      case '/add-tool':
        // Prefetch categories for the form
        await queryClient.prefetchQuery({
          queryKey: queryKeys.tools.categories(),
          queryFn: () => convex.query(api.aiTools.getCategories, {}),
          staleTime: 30 * 60 * 1000,
        });
        break;

      case '/':
        // Prefetch initial tools data
        await queryClient.prefetchQuery({
          queryKey: queryKeys.tools.paginatedList({ language: 'en' }),
          queryFn: () => convex.query(api.aiTools.listToolsPaginated, {
            language: 'en',
            paginationOpts: {
              numItems: 20,
              cursor: null,
            },
          }),
          staleTime: 5 * 60 * 1000,
        });
        break;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Prefetched data for route: ${route}`);
    }
  },
};