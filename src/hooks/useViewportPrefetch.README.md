# useViewportPrefetch Hook

A React hook that implements viewport-based prefetching for category data using Intersection Observer API.

## Overview

This hook observes category sections and automatically prefetches the next category's data when the current category is approaching the viewport (200px by default). This improves perceived performance by loading data before users need it.

## Features

- **Intersection Observer**: Uses native browser API for efficient viewport detection
- **Configurable Root Margin**: Customizable distance from viewport to trigger prefetch (default: 200px)
- **Cache-Aware**: Checks if data is already cached before prefetching to avoid unnecessary requests
- **Development Logging**: Provides detailed console logs in development mode for debugging
- **Automatic Cleanup**: Properly cleans up observers on component unmount

## Usage

```tsx
import { useViewportPrefetch } from '@/hooks/useViewportPrefetch';

function ToolsList({ categories, language, selectedPricing }) {
  const { observeCategory } = useViewportPrefetch({
    categories,
    filters: {
      language,
      pricing: selectedPricing,
    },
    enabled: true, // Can be disabled for search/semantic modes
  });

  return (
    <div>
      {categories.map((category, index) => (
        <CategorySection
          key={category}
          category={category}
          categoryIndex={index}
          observeCategory={observeCategory}
        />
      ))}
    </div>
  );
}

function CategorySection({ category, categoryIndex, observeCategory }) {
  const categoryRef = useCallback((element) => {
    if (element && observeCategory) {
      return observeCategory(element, categoryIndex);
    }
  }, [observeCategory, categoryIndex]);

  return (
    <div ref={categoryRef}>
      <h2>{category}</h2>
      {/* category content */}
    </div>
  );
}
```

## Parameters

### UseViewportPrefetchOptions

- `categories: string[]` - Array of categories in order
- `filters: object` - Current filters to apply when prefetching
  - `language?: 'en' | 'vi'` - Language filter
  - `pricing?: 'free' | 'freemium' | 'paid'` - Pricing filter
- `rootMargin?: string` - Distance from viewport to trigger prefetch (default: '200px')
- `enabled?: boolean` - Whether prefetching is enabled (default: true)

## Return Value

- `observeCategory: (element: Element | null, categoryIndex: number) => (() => void) | undefined`
  - Function to observe a category element
  - Returns cleanup function to unobserve the element
- `unobserveCategory: (element: Element) => void`
  - Function to manually stop observing an element

## How It Works

1. **Setup**: Creates an Intersection Observer with specified root margin
2. **Observation**: Each category section is observed for viewport intersection
3. **Detection**: When a category enters the viewport (within root margin)
4. **Prefetch**: Automatically prefetches the next category's data
5. **Caching**: Uses TanStack Query cache to store prefetched data
6. **Cleanup**: Removes observers when components unmount

## Performance Benefits

- **Reduced Loading Time**: Next category data is already cached when user scrolls
- **Smooth UX**: No loading spinners when navigating between categories
- **Efficient**: Only prefetches when needed, checks cache before fetching
- **Bandwidth Conscious**: Doesn't prefetch if data is already available

## Development Debugging

In development mode, the hook provides detailed console logs:

```
Setting up viewport prefetch observer for category: "AI Writing" (index 0)
Category "AI Writing" (index 0) is now visible in viewport
Triggering prefetch for next category: "Chatbots" (index 1)
Prefetching next category: Chatbots
```

## Integration with TanStack Query

The hook integrates seamlessly with the existing TanStack Query setup:

- Uses `queryClient.prefetchQuery()` for data prefetching
- Follows the same query key structure as other queries
- Respects cache settings (5-minute stale time)
- Works with existing cache invalidation strategies

## Browser Support

Uses Intersection Observer API which is supported in:
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

For older browsers, consider adding a polyfill or graceful degradation.