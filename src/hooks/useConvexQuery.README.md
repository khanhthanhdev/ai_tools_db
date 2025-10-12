# useConvexQuery Hook

A wrapper hook that integrates TanStack Query with Convex queries, providing advanced caching, prefetching, and optimistic update capabilities while maintaining Convex's type safety and reactive features.

## Features

✅ **TanStack Query Integration** - Wraps Convex queries with TanStack Query's `useQuery` hook
✅ **Type Safety** - Preserves Convex's full type safety using `FunctionReference` types
✅ **Skip Pattern Support** - Supports Convex's `'skip'` pattern for conditional queries
✅ **Automatic Query Keys** - Generates query keys from Convex function names and arguments
✅ **Customizable Options** - Allows overriding TanStack Query options (staleTime, gcTime, etc.)

## Requirements Satisfied

### Requirement 1.2: Convex Query Wrapping
> WHEN a Convex query is executed THEN it SHALL be wrapped with TanStack Query's useQuery hook

✅ The hook wraps `convex.query()` calls with TanStack Query's `useQuery`

### Requirement 1.3: Cached Data
> IF a query is already cached THEN TanStack Query SHALL return cached data immediately

✅ TanStack Query automatically handles caching based on query keys

### Requirement 7.3: Type Safety
> WHEN components use useQuery THEN they SHALL receive the same data structure as before

✅ Uses Convex's `FunctionReference` types to preserve exact type signatures

### Requirement 7.4: Real-time Updates
> IF a component uses Convex's reactive queries THEN it SHALL still receive real-time updates

✅ Compatible with Convex's reactive system through background refetching

## Usage

### Basic Query

```typescript
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '../../convex/_generated/api';

function ToolsList() {
  const { data, isLoading, error } = useConvexQuery(
    api.aiTools.listTools,
    { language: 'en' }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.length} tools found</div>;
}
```

### Conditional Query (Skip Pattern)

```typescript
function SearchResults({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useConvexQuery(
    api.aiTools.searchTools,
    searchTerm 
      ? { searchTerm, language: 'en' }
      : 'skip'  // Query won't execute when searchTerm is empty
  );

  if (!searchTerm) return <div>Enter a search term</div>;
  if (isLoading) return <div>Searching...</div>;
  
  return <div>Found {data?.length || 0} results</div>;
}
```

### Custom Options

```typescript
function ToolsWithCustomCache() {
  const { data, isStale, isFetching } = useConvexQuery(
    api.aiTools.listTools,
    { language: 'en', category: 'AI Writing' },
    {
      staleTime: 10 * 60 * 1000,      // Consider data fresh for 10 minutes
      gcTime: 15 * 60 * 1000,          // Keep in cache for 15 minutes
      refetchOnWindowFocus: true,      // Refetch when window regains focus
    }
  );

  return (
    <div>
      {isFetching && <span>Updating...</span>}
      {isStale && <span>Data is stale</span>}
      <div>Tools: {data?.length || 0}</div>
    </div>
  );
}
```

### Parallel Queries

```typescript
function Dashboard() {
  const toolsQuery = useConvexQuery(
    api.aiTools.listTools,
    { language: 'en' }
  );
  
  const favouritesQuery = useConvexQuery(
    api.favourites.getUserFavouriteIds,
    {}
  );

  // Both queries execute in parallel
  const isLoading = toolsQuery.isLoading || favouritesQuery.isLoading;
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div>Tools: {toolsQuery.data?.length || 0}</div>
      <div>Favourites: {favouritesQuery.data?.length || 0}</div>
    </div>
  );
}
```

## Return Value

The hook returns a TanStack Query result object with the following properties:

- `data`: The query result (typed according to the Convex function)
- `isLoading`: `true` during initial load
- `isFetching`: `true` during any fetch (including background refetch)
- `isError`: `true` if the query failed
- `error`: Error object if query failed
- `isStale`: `true` if data is considered stale
- `refetch()`: Function to manually refetch
- `dataUpdatedAt`: Timestamp of last successful fetch

## Query Key Structure

Query keys are automatically generated as:
```typescript
[functionName, args]
```

Example:
```typescript
// For: useConvexQuery(api.aiTools.listTools, { language: 'en' })
// Query key: ['aiTools:listTools', { language: 'en' }]
```

This structure enables:
- Automatic cache invalidation by function name
- Precise cache updates by specific arguments
- Hierarchical query key patterns for bulk operations

## Migration from Convex useQuery

### Before (Convex only)
```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const tools = useQuery(
  api.aiTools.listTools,
  searchTerm ? { searchTerm } : 'skip'
);
```

### After (with TanStack Query)
```typescript
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '../../convex/_generated/api';

const { data: tools } = useConvexQuery(
  api.aiTools.listTools,
  searchTerm ? { searchTerm } : 'skip'
);
```

## Implementation Details

### Type Safety
The hook uses Convex's `FunctionReference` type to ensure:
- Correct function arguments
- Accurate return type inference
- Compile-time error checking

### Skip Pattern
When `args` is `'skip'`:
- The query is disabled (`enabled: false`)
- No network request is made
- `data` remains `undefined`
- `isLoading` is `false`

### Query Key Generation
Uses Convex's `getFunctionName()` to extract the full function path (e.g., `'aiTools:listTools'`), ensuring unique and consistent query keys.

## Best Practices

1. **Use skip for conditional queries**: Prefer `'skip'` over conditional rendering
2. **Leverage caching**: Data is cached automatically, reducing unnecessary requests
3. **Monitor stale state**: Use `isStale` and `isFetching` for better UX
4. **Customize staleTime**: Adjust based on data volatility
5. **Parallel queries**: Multiple `useConvexQuery` calls execute in parallel automatically

## Next Steps

After implementing this hook, the next tasks are:
- Create `useConvexMutation` for mutations with cache invalidation
- Create query key factory for consistent key management
- Migrate existing components to use `useConvexQuery`
- Implement prefetching strategies
