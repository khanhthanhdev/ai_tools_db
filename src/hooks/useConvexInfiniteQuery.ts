import { useInfiniteQuery, UseInfiniteQueryOptions, QueryKey } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { FunctionReference, getFunctionName } from 'convex/server';
import { getQueryConfig, queryConfigs } from '../lib/queryClient';

/**
 * A wrapper hook that combines TanStack Query's useInfiniteQuery with Convex queries.
 * 
 * This hook provides:
 * - Infinite scrolling capabilities with cursor-based pagination
 * - Advanced caching from TanStack Query
 * - Type-safe integration with Convex
 * - Automatic query key generation
 * - Optimized cache configurations for paginated data
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 *   isLoading
 * } = useConvexInfiniteQuery(
 *   api.aiTools.listToolsPaginated,
 *   (pageParam) => ({
 *     language: 'en',
 *     paginationOpts: {
 *       numItems: 20,
 *       cursor: pageParam as string | undefined,
 *     }
 *   })
 * );
 * 
 * // Flatten all pages into a single array
 * const allTools = data?.pages.flatMap(page => page.page) ?? [];
 * ```
 */
export function useConvexInfiniteQuery<
  Query extends FunctionReference<'query'>,
  TQueryFnData = Query['_returnType'],
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  query: Query,
  argsFactory: (pageParam: TPageParam) => Query['_args'] | 'skip',
  options?: Omit<
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  > & {
    queryKey?: TQueryKey; // Allow custom query key override
    initialPageParam?: TPageParam;
    getNextPageParam?: (
      lastPage: TQueryFnData,
      allPages: TQueryFnData[],
      lastPageParam: TPageParam,
      allPageParams: TPageParam[]
    ) => TPageParam | undefined | null;
  }
) {
  const convex = useConvex();
  
  // Generate query key from function name, or use provided key
  const queryKey: TQueryKey = options?.queryKey ?? [getFunctionName(query), 'infinite'] as TQueryKey;
  
  // Get optimized configuration for infinite queries
  const optimizedConfig = {
    ...getQueryConfig(queryKey),
    ...queryConfigs.infiniteQuery,
  };
  
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const args = argsFactory(pageParam as TPageParam);
      if (args === 'skip') {
        throw new Error('Query is skipped');
      }
      return await convex.query(query, args as Query['_args']);
    },
    initialPageParam: options?.initialPageParam ?? (null as TPageParam),
    getNextPageParam: options?.getNextPageParam ?? ((lastPage: any) => {
      // Default implementation for Convex pagination
      // Assumes the response has { nextCursor, isDone } structure
      if (lastPage?.isDone || !lastPage?.nextCursor) {
        return undefined;
      }
      return lastPage.nextCursor as TPageParam;
    }),
    enabled: options?.enabled ?? true,
    // Apply optimized config first, then user options (user options take precedence)
    ...optimizedConfig,
    ...options,
  });
}