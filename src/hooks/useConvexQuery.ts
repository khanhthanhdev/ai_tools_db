import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { FunctionReference, getFunctionName } from 'convex/server';
import { getQueryConfig } from '../lib/queryClient';

/**
 * A wrapper hook that combines TanStack Query with Convex queries.
 * 
 * This hook provides:
 * - Advanced caching capabilities from TanStack Query
 * - Type-safe integration with Convex
 * - Support for the 'skip' pattern for conditional queries
 * - Automatic query key generation from Convex function names
 * - Optimized cache configurations based on data type
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useConvexQuery(
 *   api.aiTools.listTools,
 *   { language: 'en', category: 'AI Writing' }
 * );
 * 
 * // Conditional query with 'skip'
 * const { data } = useConvexQuery(
 *   api.aiTools.searchTools,
 *   searchTerm ? { searchTerm, language: 'en' } : 'skip'
 * );
 * 
 * // With custom query key for better cache management
 * const { data } = useConvexQuery(
 *   api.aiTools.getCategories,
 *   { language: 'en' },
 *   { queryKey: queryKeys.tools.categories('en') }
 * );
 * ```
 */
export function useConvexQuery<Query extends FunctionReference<'query'>>(
    query: Query,
    args: Query['_args'] | 'skip',
    options?: Omit<
        UseQueryOptions<Query['_returnType'], Error, Query['_returnType'], QueryKey>,
        'queryKey' | 'queryFn'
    > & {
        queryKey?: QueryKey; // Allow custom query key override
    }
) {
    const convex = useConvex();

    // Generate query key from function name and arguments, or use provided key
    const queryKey: QueryKey = options?.queryKey ?? [getFunctionName(query), args];

    // Get optimized configuration based on query type
    const optimizedConfig = getQueryConfig(queryKey);

    return useQuery({
        queryKey,
        queryFn: async () => {
            if (args === 'skip') {
                throw new Error('Query is skipped');
            }
            return await convex.query(query, args as Query['_args']);
        },
        enabled: args !== 'skip' && (options?.enabled ?? true),
        // Apply optimized config first, then user options (user options take precedence)
        ...optimizedConfig,
        ...options,
    });
}
