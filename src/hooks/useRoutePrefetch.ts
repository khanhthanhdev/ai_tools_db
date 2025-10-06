/**
 * Route Navigation Prefetch Hook
 * 
 * This hook handles prefetching data when navigating between routes,
 * specifically prefetching favourites when the user is authenticated.
 * 
 * Requirements addressed:
 * - 3.4: Prefetch favourites when user is authenticated
 * - 3.5: Proactive data loading for seamless UX
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConvexQuery } from './useConvexQuery';
import { useConvex } from 'convex/react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../convex/_generated/api';
import { prefetchTools } from '../lib/prefetch';

/**
 * Hook that prefetches data based on route navigation and authentication status
 */
export function useRoutePrefetch() {
  const location = useLocation();
  const convex = useConvex();
  const queryClient = useQueryClient();
  
  // Get current user to determine authentication status
  const { data: user } = useConvexQuery(
    api.auth.loggedInUser,
    {},
    {
      queryKey: ['auth', 'loggedInUser'],
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );

  // Prefetch favourites when user is authenticated
  useEffect(() => {
    if (user) {
      // User is authenticated, prefetch favourites data
      const prefetchFavourites = async () => {
        try {
          await prefetchTools.onAuthentication(queryClient, convex as any);
        } catch (error) {
          // Silently fail prefetch - it's not critical
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to prefetch favourites:', error);
          }
        }
      };

      prefetchFavourites();
    }
  }, [user, convex, queryClient]);

  // Prefetch route-specific data based on navigation
  useEffect(() => {
    const prefetchRouteData = async () => {
      try {
        await prefetchTools.forRoute(queryClient, convex as any, location.pathname);
      } catch (error) {
        // Silently fail prefetch - it's not critical
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to prefetch data for route ${location.pathname}:`, error);
        }
      }
    };

    prefetchRouteData();
  }, [location.pathname, convex, queryClient]);

  return {
    isAuthenticated: !!user,
    currentRoute: location.pathname,
  };
}