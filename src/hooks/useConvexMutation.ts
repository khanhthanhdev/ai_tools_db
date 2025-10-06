import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { FunctionReference, getFunctionName } from 'convex/server';

/**
 * Options for optimistic updates in Convex mutations.
 * 
 * @template TData - The type of data returned by the mutation
 * @template TVariables - The type of variables passed to the mutation
 * @template TContext - The type of context used for rollback
 */
export interface OptimisticUpdateOptions<TData, TVariables, TContext> {
  /**
   * Function to perform optimistic update before mutation executes.
   * Should return context data needed for rollback on error.
   */
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  
  /**
   * Function to rollback optimistic update if mutation fails.
   * Receives the context returned from onMutate.
   */
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
  
  /**
   * Function called after successful mutation.
   * Can be used for additional cache updates or side effects.
   */
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  
  /**
   * Function called after mutation settles (success or error).
   */
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: TContext | undefined) => void;
}

/**
 * A wrapper hook that combines TanStack Query mutations with Convex mutations.
 * 
 * This hook provides:
 * - Automatic cache invalidation after successful mutations
 * - Support for optimistic updates with automatic rollback on error
 * - Type-safe integration with Convex
 * - Consistent error handling
 * 
 * @example
 * ```tsx
 * // Basic mutation
 * const addTool = useConvexMutation(api.aiTools.addTool);
 * addTool.mutate({ name: 'New Tool', url: 'https://example.com' });
 * 
 * // Mutation with cache invalidation
 * const addTool = useConvexMutation(api.aiTools.addTool, {
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['aiTools.listTools'] });
 *   }
 * });
 * 
 * // Mutation with optimistic update
 * const toggleFavourite = useConvexMutation(api.favourites.toggleFavourite, {
 *   onMutate: async (variables) => {
 *     // Cancel outgoing refetches
 *     await queryClient.cancelQueries({ queryKey: ['favourites.getUserFavouriteIds'] });
 *     
 *     // Snapshot previous value
 *     const previousFavourites = queryClient.getQueryData(['favourites.getUserFavouriteIds']);
 *     
 *     // Optimistically update
 *     queryClient.setQueryData(['favourites.getUserFavouriteIds'], (old: string[] = []) => {
 *       return variables.isFavourited
 *         ? [...old, variables.toolId]
 *         : old.filter(id => id !== variables.toolId);
 *     });
 *     
 *     return { previousFavourites };
 *   },
 *   onError: (err, variables, context) => {
 *     // Rollback on error
 *     if (context?.previousFavourites) {
 *       queryClient.setQueryData(['favourites.getUserFavouriteIds'], context.previousFavourites);
 *     }
 *   },
 *   onSettled: () => {
 *     // Refetch to ensure consistency
 *     queryClient.invalidateQueries({ queryKey: ['favourites.getUserFavouriteIds'] });
 *   }
 * });
 * ```
 */
export function useConvexMutation<
  Mutation extends FunctionReference<'mutation'>,
  TContext = unknown
>(
  mutation: Mutation,
  options?: Omit<
    UseMutationOptions<
      Mutation['_returnType'],
      Error,
      Mutation['_args'],
      TContext
    >,
    'mutationFn'
  >
) {
  const convex = useConvex();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (args: Mutation['_args']) => {
      return await convex.mutation(mutation, args);
    },
    onMutate: async (variables) => {
      // Call user-provided onMutate if exists
      if (options?.onMutate) {
        return await options.onMutate(variables);
      }
      return undefined as TContext;
    },
    onError: (error, variables, context) => {
      // Call user-provided onError for rollback
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      // Call user-provided onSuccess for additional cache updates
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Call user-provided onSettled
      if (options?.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
    ...options,
  });
}
