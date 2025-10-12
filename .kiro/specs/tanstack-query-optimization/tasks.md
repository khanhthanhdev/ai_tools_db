# Implementation Plan

- [x] 1. Install and configure TanStack Query

  - Install @tanstack/react-query and @tanstack/react-query-devtools packages
  - Create queryClient configuration with optimal settings (5min staleTime, 10min gcTime)
  - Wrap app with QueryClientProvider in main.tsx
  - _Requirements: 1.1, 1.4_

- [x] 2. Create Convex integration utilities
- [x] 2.1 Create useConvexQuery hook

  - Implement wrapper hook that combines TanStack Query with Convex
  - Support 'skip' pattern for conditional queries
  - Preserve Convex type safety
  - _Requirements: 1.2, 1.3, 7.3, 7.4_

- [x] 2.2 Create useConvexMutation hook

  - Implement mutation wrapper with automatic cache invalidation
  - Support optimistic updates
  - Handle error rollback
  - _Requirements: 1.5, 5.3, 5.4_

- [x] 2.3 Create query key factory

  - Define hierarchical query key structure for tools, favourites, reviews
  - Implement type-safe query key generation
  - _Requirements: 8.2_

- [x] 2.4 Create useConvexInfiniteQuery hook

  - Implement infinite query wrapper for paginated data
  - Support cursor-based pagination with Convex
  - Handle loading states for infinite scroll
  - _Requirements: 1.2, 2.2, 3.2_

- [ ]\* 2.5 Write unit tests for integration utilities

  - Test useConvexQuery with mocked Convex client
  - Test useConvexMutation with cache invalidation
  - Test query key factory generates correct keys
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 3. Migrate ToolsList component
- [x] 3.1 Replace Convex useQuery with useConvexQuery and useConvexInfiniteQuery

  - Update searchTools query to use TanStack Query infinite queries
  - Update listTools query to use TanStack Query infinite queries
  - Maintain existing loading states and error handling
  - _Requirements: 2.2, 2.3, 7.1, 7.3_

- [x] 3.2 Implement parallel data fetching

  - Fetch tools and favourites in parallel using separate queries
  - Use TanStack Query for concurrent data loading
  - _Requirements: 3.2_

- [x] 3.3 Add cache-aware loading states

  - Show cached data immediately while refetching
  - Display subtle background refetch indicator
  - _Requirements: 5.1, 5.2, 5.5_

- [ ]\* 3.4 Test ToolsList migration

  - Verify data loads correctly from cache
  - Test filter changes use cached data
  - Verify parallel fetching works
  - _Requirements: 2.2, 2.3, 3.2_

- [x] 4. Implement prefetching strategies
- [x] 4.1 Add hover prefetch to ToolCard

  - Prefetch tool details on mouseEnter with 200ms debounce
  - Check cache before prefetching to avoid duplicates
  - _Requirements: 3.1, 3.6_

- [x] 4.2 Add viewport-based prefetch

  - Use Intersection Observer to detect visible categories
  - Prefetch next category when current is 200px from viewport
  - _Requirements: 3.3_

- [x] 4.3 Prefetch on route navigation

  - Prefetch favourites when user is authenticated
  - _Requirements: 3.4, 3.5_

- [ ]\* 4.4 Test prefetching effectiveness

  - Verify hover triggers prefetch
  - Test viewport prefetch timing
  - Measure cache hit rate improvement
  - _Requirements: 3.1, 3.3, 6.3_

- [ ] 5. Implement cache invalidation and optimistic updates
- [x] 5.1 Create cache invalidation helpers

  - Implement invalidateQueries utilities for tools, favourites, reviews
  - Create selective cache update functions
  - _Requirements: 4.2, 4.3_

- [x] 5.2 Update tool mutations

  - Add cache invalidation to addTool mutation
  - Add cache invalidation to editTool mutation
  - Add cache invalidation to deleteTool mutation
  - _Requirements: 4.2_

- [x] 5.3 Update favourite mutations

  - Implement optimistic updates for toggleFavourite
  - Add rollback on error
  - Update only affected cache entries

  - _Requirements: 4.3, 5.3, 5.4_

- [ ]\* 5.4 Test cache invalidation

  - Verify mutations invalidate correct queries
  - Test optimistic updates and rollback
  - Verify selective cache updates work
  - _Requirements: 4.2, 4.3, 5.3, 5.4_

- [ ] 6. Migrate remaining components
- [x] 6.1 Migrate FavouritesPage

  - Replace Convex useQuery with useConvexQuery
  - Implement cache-aware loading
  - _Requirements: 2.2, 5.5, 7.1_

- [x] 6.2 Migrate Sidebar component

  - Replace categories query with useConvexQuery
  - Implement proper caching for categories
  - _Requirements: 2.2, 7.1_

- [x] 6.3 Migrate remaining components with direct Convex useQuery

  - Update ReviewItem, ReviewsSection, ToolDetailPage, CategoryFilterMobile
  - Update DatabaseStats, ToolDetailDrawer, SemanticSearchBar, SimilarTools
  - Update AddToolForm, FavouriteButton components
  - _Requirements: 2.2, 7.1_

- [x] 6.4 Migrate AddToolPage mutations

  - Update mutations to use useConvexMutation
  - Implement optimistic updates
  - _Requirements: 1.5, 5.3_

- [x]\* 6.5 Test migrated components


  - Verify all components work with TanStack Query
  - Test backward compatibility
  - Verify real-time updates still work
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 7. Add development tools and monitoring
- [x] 7.1 Configure TanStack Query DevTools

  - Add ReactQueryDevtools component in development mode
  - Configure position and initial state
  - _Requirements: 8.4_

- [ ] 7.2 Add performance monitoring

  - Implement time-to-first-data measurement
  - Track cache hit rate
  - Monitor query error rate
  - _Requirements: 6.1, 6.2, 6.4_

- [ ]\* 7.3 Create developer documentation

  - Document useConvexQuery and useConvexMutation patterns
  - Explain query key structure
  - Provide examples for common use cases
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 8. Performance optimization and validation
- [x] 8.1 Optimize query configurations






  - Fine-tune staleTime for different data types
  - Configure gcTime based on usage patterns
  - Adjust retry strategies
  - _Requirements: 4.1, 6.1_

- [ ] 8.2 Implement stale-while-revalidate





  - Configure queries to show stale data immediately
  - Enable background refetch for fresh data
  - _Requirements: 2.3, 5.5_

- [ ] 8.3 Add cache size management

  - Configure cache eviction policies
  - Implement cache clearing on logout
  - _Requirements: 4.5_

- [ ]\* 8.4 Performance benchmarking

  - Measure time-to-first-data (target <300ms)
  - Measure filter change response time (target <100ms)
  - Measure cache hit rate
  - Compare before/after metrics
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Error handling and edge cases
- [ ] 9.1 Implement error boundaries

  - Add error recovery for network failures
  - Handle Convex-specific errors
  - Implement fallback to cached data
  - _Requirements: 5.4, 7.5_

- [ ] 9.2 Handle offline scenarios

  - Serve cached data when offline
  - Show offline indicator
  - Queue mutations for when online
  - _Requirements: 4.4_

- [ ] 9.3 Add retry logic

  - Configure exponential backoff for retries
  - Skip retry for auth errors
  - _Requirements: 5.4_

- [ ]\* 9.4 Test error scenarios

  - Test network failure handling
  - Test offline mode
  - Test mutation rollback
  - Verify error messages are accessible
  - _Requirements: 5.4, 7.5_

- [ ] 10. Final integration and cleanup
- [x] 10.1 Remove unused Convex useQuery imports






  - Search for remaining direct Convex useQuery usage
  - Replace with useConvexQuery
  - Remove unused imports
  - _Requirements: 7.1_

- [ ] 10.2 Update TypeScript types

  - Ensure all query results are properly typed
  - Fix any type errors from migration
  - _Requirements: 7.3_

- [ ] 10.3 Verify backward compatibility

  - Test all existing features still work
  - Verify ConvexAuthProvider integration
  - Test real-time updates
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 10.4 Final performance validation
  - Run full performance test suite
  - Verify all performance targets met
  - Document performance improvements
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
