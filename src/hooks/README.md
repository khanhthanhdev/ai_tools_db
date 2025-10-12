# TanStack Query + Convex Integration Hooks

This directory contains custom hooks that integrate TanStack Query with Convex for optimized data fetching and caching.

## Hooks

### `useConvexQuery`

A wrapper hook that combines TanStack Query with Convex queries for advanced caching capabilities.

**Features:**
- Advanced caching from TanStack Query
- Type-safe integration with Convex
- Support for 'skip' pattern for conditional queries
- Automatic query key generation

**Usage:**
```tsx
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '../../convex/_generated/api';

function ToolsList() {
  const { data, isLoading, error } = useConvexQuery(
    api.aiTools.listTools,
    { language: 'en', category: 'AI Writing' }
  );

  // Conditional query with 'skip'
  const { data: searchResults } = useConvexQuery(
    api.aiTools.searchTools,
    searchTerm ? { searchTerm, language: 'en' } : 'skip'
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render tools */}</div>;
}
```

### `useConvexMutation`

A wrapper hook that combines TanStack Query mutations with Convex mutations for automatic cache management.

**Features:**
- Automatic cache invalidation after successful mutations
- Support for optimistic updates with automatic rollback on error
- Type-safe integration with Convex
- Consistent error handling

**Usage:**

#### Basic Mutation
```tsx
import { useConvexMutation } from '@/hooks/useConvexMutation';
import { api } from '../../convex/_generated/api';

function AddToolForm() {
  const addTool = useConvexMutation(api.aiTools.addTool, {
    onSuccess: () => {
      console.log('Tool added successfully');
    },
    onError: (error) => {
      console.error('Failed to add tool:', error);
    }
  });

  const handleSubmit = (formData) => {
    addTool.mutate(formData);
  };

  return (
    <button onClick={handleSubmit} disabled={addTool.isPending}>
      {addTool.isPending ? 'Adding...' : 'Add Tool'}
    </button>
  );
}
```

#### Mutation with Cache Invalidation
```tsx
import { useConvexMutation } from '@/hooks/useConvexMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../convex/_generated/api';

function AddToolForm() {
  const queryClient = useQueryClient();
  
  const addTool = useConvexMutation(api.aiTools.addTool, {
    onSuccess: () => {
      // Invalidate tools list to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['aiTools.listTools'] });
      queryClient.invalidateQueries({ queryKey: ['aiTools.searchTools'] });
    }
  });

  return <form>{/* Form implementation */}</form>;
}
```

#### Mutation with Optimistic Updates
```tsx
import { useConvexMutation } from '@/hooks/useConvexMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../convex/_generated/api';

function FavouriteButton({ toolId }: { toolId: string }) {
  const queryClient = useQueryClient();
  
  const toggleFavourite = useConvexMutation(api.favourites.toggleFavourite, {
    // Optimistically update the UI before mutation completes
    onMutate: async (variables) => {
      const { toolId, isFavourited } = variables;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['favourites.getUserFavouriteIds'] 
      });
      
      // Snapshot the previous value for rollback
      const previousFavourites = queryClient.getQueryData<string[]>(
        ['favourites.getUserFavouriteIds']
      );
      
      // Optimistically update the cache
      queryClient.setQueryData<string[]>(
        ['favourites.getUserFavouriteIds'],
        (old = []) => {
          return isFavourited
            ? [...old, toolId]
            : old.filter(id => id !== toolId);
        }
      );
      
      // Return context for rollback
      return { previousFavourites };
    },
    
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousFavourites) {
        queryClient.setQueryData(
          ['favourites.getUserFavouriteIds'],
          context.previousFavourites
        );
      }
    },
    
    // Always refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['favourites.getUserFavouriteIds'] 
      });
    }
  });

  const handleToggle = () => {
    toggleFavourite.mutate({ toolId, isFavourited: true });
  };

  return (
    <button onClick={handleToggle}>
      Toggle Favourite
    </button>
  );
}
```

#### Mutation with Selective Cache Updates
```tsx
import { useConvexMutation } from '@/hooks/useConvexMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../convex/_generated/api';

function EditToolForm({ toolId }: { toolId: string }) {
  const queryClient = useQueryClient();
  
  const editTool = useConvexMutation(api.aiTools.editTool, {
    onSuccess: (updatedTool, variables) => {
      // Update specific tool in all list queries
      queryClient.setQueriesData(
        { queryKey: ['aiTools.listTools'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return oldData.map((tool: any) =>
            tool._id === variables.id ? { ...tool, ...updatedTool } : tool
          );
        }
      );
      
      // Update tool detail cache
      queryClient.setQueryData(
        ['aiTools.getTool', { id: variables.id }],
        updatedTool
      );
    }
  });

  return <form>{/* Form implementation */}</form>;
}
```

## Best Practices

### Query Keys
- Use consistent query key structure across the application
- Consider using a query key factory for type safety (see `src/lib/queryKeys.ts`)

### Cache Invalidation
- Invalidate related queries after mutations
- Use specific query keys when possible to avoid unnecessary refetches
- Consider using `setQueryData` for selective updates instead of full invalidation

### Optimistic Updates
- Always snapshot previous data for rollback
- Cancel outgoing queries before optimistic update
- Always refetch in `onSettled` to ensure consistency
- Handle errors gracefully with proper rollback

### Error Handling
- Provide user-friendly error messages
- Consider retry strategies for transient errors
- Log errors for debugging

### Performance
- Use `staleTime` to control how long data is considered fresh
- Use `gcTime` (formerly `cacheTime`) to control how long unused data stays in cache
- Prefetch data proactively for better UX

## Type Safety

Both hooks maintain full type safety with Convex:
- Query/mutation arguments are type-checked
- Return types are inferred correctly
- Context types for optimistic updates are type-safe

## Requirements Covered

### useConvexMutation
- ✅ **Requirement 1.5**: Wraps Convex mutations with TanStack Query's useMutation
- ✅ **Requirement 5.3**: Supports optimistic updates via onMutate callback
- ✅ **Requirement 5.4**: Handles error rollback via onError callback with context
- ✅ Automatic cache invalidation support
- ✅ Type-safe integration with Convex

## See Also
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Convex Documentation](https://docs.convex.dev/)
- Example usage in `src/hooks/__examples__/useConvexMutation.example.tsx`
