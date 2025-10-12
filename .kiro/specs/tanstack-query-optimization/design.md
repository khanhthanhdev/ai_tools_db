# Design Document: TanStack Query + Convex Integration

## Overview

This design integrates TanStack Query (React Query) with Convex to optimize data fetching performance in the AI Knowledge Cloud. The integration leverages TanStack Query's caching, prefetching, and optimistic update capabilities while maintaining Convex's reactive real-time features.

### Key Performance Goals
- Reduce time-to-first-data from 1-2s to <300ms
- Enable instant filter/search changes via cache
- Prefetch data proactively for seamless UX
- Maintain Convex's real-time reactivity

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           QueryClientProvider (TanStack)               │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │      ConvexAuthProvider (Convex)                 │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │         App Components                     │  │  │ │
│  │  │  │  - BrowsePage                              │  │  │ │
│  │  │  │  - ToolsList                               │  │  │ │
│  │  │  │  - ToolCard                                │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   TanStack Query Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Query Cache  │  │  Prefetcher  │  │  Mutations   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Integration                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Queries    │  │  Mutations   │  │   Actions    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Convex Backend
```

### Data Flow

1. **Initial Load**: Component mounts → TanStack Query checks cache → If miss, calls Convex → Caches result
2. **Cached Load**: Component mounts → TanStack Query returns cached data instantly → Background refetch if stale
3. **Mutation**: User action → Optimistic update → Convex mutation → Cache invalidation → Refetch affected queries
4. **Prefetch**: User hovers/scrolls → TanStack Query prefetches → Populates cache → Instant when needed

## Components and Interfaces

### 1. Query Client Configuration

**File**: `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Design Decisions**:
- `staleTime: 5min` - Tools data doesn't change frequently, balance freshness vs performance
- `gcTime: 10min` - Keep unused data longer for back/forward navigation
- `refetchOnWindowFocus: false` - Avoid unnecessary refetches when switching tabs
- `retry: 1` - Single retry for transient network errors

### 2. Convex Query Wrapper Hook

**File**: `src/hooks/useConvexQuery.ts`

```typescript
import { useQuery as useTanStackQuery, UseQueryOptions } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';

export function useConvexQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query> | 'skip',
  options?: Omit<UseQueryOptions<FunctionReturnType<Query>>, 'queryKey' | 'queryFn'>
) {
  const convex = useConvex();
  
  return useTanStackQuery({
    queryKey: [query._name, args],
    queryFn: () => convex.query(query, args as FunctionArgs<Query>),
    enabled: args !== 'skip',
    ...options,
  });
}
```

**Design Decisions**:
- Maintains Convex's `'skip'` pattern for conditional queries
- Auto-generates query keys from function name and args
- Preserves type safety with Convex's type system
- Allows override of TanStack Query options

### 3. Convex Mutation Wrapper Hook

**File**: `src/hooks/useConvexMutation.ts`

```typescript
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';

export function useConvexMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation,
  options?: Omit<UseMutationOptions<
    FunctionReturnType<Mutation>,
    Error,
    FunctionArgs<Mutation>
  >, 'mutationFn'>
) {
  const convex = useConvex();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (args: FunctionArgs<Mutation>) => convex.mutation(mutation, args),
    onSuccess: (data, variables, context) => {
      // Auto-invalidate related queries
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
```

### 4. Query Key Factory

**File**: `src/lib/queryKeys.ts`

```typescript
export const queryKeys = {
  // Tools queries
  tools: {
    all: ['tools'] as const,
    lists: () => [...queryKeys.tools.all, 'list'] as const,
    list: (filters: { language?: string; category?: string; pricing?: string }) =>
      [...queryKeys.tools.lists(), filters] as const,
    searches: () => [...queryKeys.tools.all, 'search'] as const,
    search: (params: { searchTerm: string; language: string; category?: string; pricing?: string }) =>
      [...queryKeys.tools.searches(), params] as const,
    detail: (id: string) => [...queryKeys.tools.all, 'detail', id] as const,
  },
  
  // Favourites queries
  favourites: {
    all: ['favourites'] as const,
    ids: () => [...queryKeys.favourites.all, 'ids'] as const,
    list: () => [...queryKeys.favourites.all, 'list'] as const,
  },
  
  // Reviews queries
  reviews: {
    all: ['reviews'] as const,
    byTool: (toolId: string) => [...queryKeys.reviews.all, 'tool', toolId] as const,
  },
} as const;
```

**Design Decisions**:
- Hierarchical structure for easy invalidation (e.g., invalidate all tools queries)
- Type-safe with `as const` assertions
- Follows TanStack Query best practices for key structure
- Enables partial matching for cache invalidation

### 5. Prefetch Utilities

**File**: `src/lib/prefetch.ts`

```typescript
import { queryClient } from './queryClient';
import { api } from '../../convex/_generated/api';
import { queryKeys } from './queryKeys';
import { ConvexClient } from 'convex/browser';

export const prefetchTools = {
  // Prefetch tools list
  list: async (convex: ConvexClient, filters: Parameters<typeof api.aiTools.listTools>[0]) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.list(filters),
      queryFn: () => convex.query(api.aiTools.listTools, filters),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Prefetch on hover
  onHover: async (convex: ConvexClient, toolId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tools.detail(toolId),
      queryFn: () => convex.query(api.aiTools.getTool, { id: toolId }),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Prefetch favourites in parallel
  favourites: async (convex: ConvexClient) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.favourites.ids(),
      queryFn: () => convex.query(api.favourites.getUserFavouriteIds),
      staleTime: 2 * 60 * 1000, // Shorter stale time for user-specific data
    });
  },
};
```

### 6. Cache Invalidation Helpers

**File**: `src/lib/cacheInvalidation.ts`

```typescript
import { queryClient } from './queryClient';
import { queryKeys } from './queryKeys';

export const invalidateQueries = {
  // Invalidate all tools queries
  allTools: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tools.all });
  },
  
  // Invalidate specific tool
  tool: (toolId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tools.detail(toolId) });
  },
  
  // Invalidate favourites
  favourites: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favourites.all });
  },
  
  // Invalidate reviews for a tool
  toolReviews: (toolId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byTool(toolId) });
  },
};

export const updateCache = {
  // Optimistic favourite toggle
  toggleFavourite: (toolId: string, isFavourited: boolean) => {
    queryClient.setQueryData<string[]>(
      queryKeys.favourites.ids(),
      (old = []) => {
        return isFavourited
          ? [...old, toolId]
          : old.filter(id => id !== toolId);
      }
    );
  },
};
```

## Data Models

### Query State Structure

```typescript
// TanStack Query wraps Convex data with additional metadata
interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean; // Background refetch
  isStale: boolean;
  dataUpdatedAt: number;
  refetch: () => void;
}
```

### Cache Entry Structure

```typescript
interface CacheEntry {
  queryKey: readonly unknown[];
  queryHash: string;
  state: {
    data: unknown;
    dataUpdatedAt: number;
    error: Error | null;
    status: 'pending' | 'error' | 'success';
  };
}
```

## Error Handling

### Error Boundary Strategy

1. **Network Errors**: Retry once, then show cached data with error indicator
2. **Convex Errors**: Display error message, allow manual retry
3. **Cache Errors**: Fall back to direct Convex query
4. **Mutation Errors**: Rollback optimistic updates, show error toast

### Error Recovery

```typescript
// Automatic retry with exponential backoff
const queryOptions = {
  retry: (failureCount: number, error: Error) => {
    if (error.message.includes('Unauthorized')) return false;
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};
```

## Testing Strategy

### Unit Tests

1. **Query Hooks**: Test `useConvexQuery` with mocked Convex client
2. **Mutation Hooks**: Test `useConvexMutation` with cache invalidation
3. **Prefetch Utilities**: Test prefetch functions populate cache correctly
4. **Cache Invalidation**: Test invalidation helpers clear correct queries

### Integration Tests

1. **Data Flow**: Test component → TanStack Query → Convex → cache
2. **Optimistic Updates**: Test UI updates before mutation completes
3. **Cache Invalidation**: Test mutations invalidate related queries
4. **Prefetching**: Test hover/scroll triggers prefetch

### Performance Tests

1. **Time-to-First-Data**: Measure initial load time (<300ms target)
2. **Cache Hit Rate**: Measure percentage of requests served from cache
3. **Prefetch Effectiveness**: Measure how often prefetched data is used
4. **Memory Usage**: Monitor cache size and garbage collection

## Migration Strategy

### Phase 1: Setup (Non-Breaking)
- Install TanStack Query
- Configure QueryClient
- Add QueryClientProvider alongside ConvexAuthProvider
- No component changes yet

### Phase 2: Gradual Migration
- Migrate ToolsList component first (highest impact)
- Migrate favourites functionality
- Migrate search components
- Keep old Convex hooks as fallback

### Phase 3: Optimization
- Add prefetching to ToolCard hover
- Implement optimistic updates for favourites
- Add cache invalidation to mutations
- Enable TanStack Query DevTools

### Phase 4: Cleanup
- Remove unused Convex `useQuery` imports
- Update documentation
- Performance benchmarking
- Remove fallback code

## Performance Optimizations

### 1. Parallel Data Fetching

```typescript
// Fetch tools and favourites in parallel
const [toolsQuery, favouritesQuery] = await Promise.all([
  queryClient.prefetchQuery(queryKeys.tools.list(filters)),
  queryClient.prefetchQuery(queryKeys.favourites.ids()),
]);
```

### 2. Selective Cache Updates

```typescript
// Update only affected cache entries
queryClient.setQueriesData(
  { queryKey: queryKeys.tools.lists() },
  (oldData) => {
    // Update only the modified tool
    return oldData?.map(tool => 
      tool._id === updatedTool._id ? updatedTool : tool
    );
  }
);
```

### 3. Stale-While-Revalidate

```typescript
// Show stale data immediately, fetch fresh in background
const { data, isFetching } = useConvexQuery(
  api.aiTools.listTools,
  filters,
  {
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always', // Always check for updates
  }
);
```

### 4. Intersection Observer Prefetch

```typescript
// Prefetch when category enters viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      prefetchTools.list(convex, { category: entry.target.dataset.category });
    }
  });
}, { rootMargin: '200px' }); // Prefetch 200px before visible
```

## Monitoring and Debugging

### Development Tools

- **TanStack Query DevTools**: Visual cache inspector
- **Performance Profiler**: Measure query timing
- **Network Tab**: Verify reduced Convex calls

### Production Metrics

- Time-to-first-data (p50, p95, p99)
- Cache hit rate
- Query error rate
- Mutation success rate
- Background refetch frequency

## Security Considerations

1. **Cache Isolation**: User-specific data (favourites) uses separate cache keys
2. **Stale Data**: Sensitive data has shorter staleTime
3. **Auth Integration**: Queries respect Convex auth state
4. **Cache Clearing**: Clear cache on logout

## Accessibility

- Loading states announced to screen readers
- Error messages are accessible
- Optimistic updates don't break keyboard navigation
- Focus management during mutations
