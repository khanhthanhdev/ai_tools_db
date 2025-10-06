import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { prefetchTools } from '@/lib/prefetch';

interface UseViewportPrefetchOptions {
  /**
   * Array of categories in order
   */
  categories: string[];

  /**
   * Current filters to apply when prefetching
   */
  filters: {
    language?: 'en' | 'vi';
    pricing?: 'free' | 'freemium' | 'paid';
  };

  /**
   * Distance from viewport to trigger prefetch (in pixels)
   * Default: 200px
   */
  rootMargin?: string;

  /**
   * Whether prefetching is enabled
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Hook for viewport-based prefetching of category data
 * 
 * This hook observes category sections and prefetches the next category's data
 * when the current category is approaching the viewport (200px by default).
 * 
 * @example
 * ```tsx
 * const { observeCategory } = useViewportPrefetch({
 *   categories: ['AI Writing', 'Chatbots', 'Image Generation'],
 *   filters: { language: 'en', pricing: 'free' }
 * });
 * 
 * // In CategorySection component:
 * <div ref={(el) => observeCategory(el, categoryIndex)}>
 *   // category content
 * </div>
 * ```
 */
export function useViewportPrefetch({
  categories,
  filters,
  rootMargin = '200px',
  enabled = true,
}: UseViewportPrefetchOptions) {
  const queryClient = useQueryClient();
  const convex = useConvex();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Map<Element, number>>(new Map());

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!enabled) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryIndex = observedElementsRef.current.get(entry.target);

          if (categoryIndex !== undefined) {
            const currentCategory = categories[categoryIndex];
            const nextCategoryIndex = categoryIndex + 1;
            const nextCategory = categories[nextCategoryIndex];

            if (process.env.NODE_ENV === 'development') {
              console.log(`Category "${currentCategory}" (index ${categoryIndex}) is now visible in viewport`);
            }

            if (nextCategory) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`Triggering prefetch for next category: "${nextCategory}" (index ${nextCategoryIndex})`);
              }

              // Prefetch the next category
              prefetchTools.nextCategory(
                queryClient,
                convex,
                nextCategory,
                filters
              ).catch((error) => {
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`Failed to prefetch category ${nextCategory}:`, error);
                }
              });
            } else if (process.env.NODE_ENV === 'development') {
              console.log(`No next category to prefetch after "${currentCategory}"`);
            }
          }
        }
      });
    },
    [categories, filters, queryClient, convex, enabled]
  );

  // Initialize intersection observer
  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold: 0.1, // Trigger when 10% of the element is visible
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, enabled]);

  /**
   * Function to observe a category element
   * 
   * @param element - The DOM element to observe
   * @param categoryIndex - The index of the category in the categories array
   */
  const observeCategory = useCallback(
    (element: Element | null, categoryIndex: number) => {
      if (!element || !observerRef.current || !enabled) return;

      const categoryName = categories[categoryIndex];

      if (process.env.NODE_ENV === 'development') {
        console.log(`Setting up viewport prefetch observer for category: "${categoryName}" (index ${categoryIndex})`);
      }

      // Store the mapping between element and category index
      observedElementsRef.current.set(element, categoryIndex);

      // Start observing the element
      observerRef.current.observe(element);

      // Return cleanup function
      return () => {
        if (observerRef.current && element) {
          observerRef.current.unobserve(element);
          observedElementsRef.current.delete(element);

          if (process.env.NODE_ENV === 'development') {
            console.log(`Cleaned up viewport prefetch observer for category: "${categoryName}"`);
          }
        }
      };
    },
    [enabled, categories]
  );

  /**
   * Function to stop observing a category element
   */
  const unobserveCategory = useCallback((element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      observedElementsRef.current.delete(element);
    }
  }, []);

  return {
    observeCategory,
    unobserveCategory,
  };
}