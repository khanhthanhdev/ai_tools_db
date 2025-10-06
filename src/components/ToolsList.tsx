import { api } from "../../convex/_generated/api";
import { ToolCard } from "./ToolCard";
import { ToolCardSkeletonGrid } from "./ToolCardSkeleton";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useConvexInfiniteQuery } from "@/hooks/useConvexInfiniteQuery";
import { useConvexQuery } from "@/hooks/useConvexQuery";

import { queryKeys } from "@/lib/queryKeys";
import { useViewportPrefetch } from "@/hooks/useViewportPrefetch";

type ToolWithScore = Doc<"aiTools"> & { _score?: number };

interface ToolsListProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPricing: string;
  language: "en" | "vi";
  semanticResults?: ToolWithScore[];
  isSemanticSearch?: boolean;
  useInfiniteScrollMode?: boolean; // Toggle between pagination and infinite scroll
}

export function ToolsList({
  searchTerm,
  selectedCategory,
  selectedPricing,
  language,
  semanticResults,
  isSemanticSearch = false,
  useInfiniteScrollMode = true, // Default to infinite scroll for better UX
}: ToolsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE_MOBILE = 12;
  const ITEMS_PER_PAGE_DESKTOP = 20;
  const PAGE_SIZE = 20; // Server-side page size

  // Use hook for responsive detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPricing, isSemanticSearch]);



  // Infinite query for search results (when searching)
  const searchInfiniteQuery = useConvexInfiniteQuery(
    api.aiTools.searchToolsPaginated,
    (pageParam) => {
      if (!searchTerm || isSemanticSearch) return 'skip';
      
      const args = {
        searchTerm,
        language,
        category: selectedCategory || undefined,
        pricing: selectedPricing as any || undefined,
        paginationOpts: {
          numItems: PAGE_SIZE,
          cursor: pageParam as string | null,
        },
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Search pagination args:', args);
      }
      
      return args;
    },
    {
      enabled: Boolean(searchTerm && !isSemanticSearch),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Infinite query for browse results (when not searching)
  const browseInfiniteQuery = useConvexInfiniteQuery(
    api.aiTools.listToolsPaginated,
    (pageParam) => {
      if (searchTerm || isSemanticSearch) return 'skip';
      
      const args = {
        language,
        category: selectedCategory || undefined,
        pricing: selectedPricing as any || undefined,
        paginationOpts: {
          numItems: PAGE_SIZE,
          cursor: pageParam as string | null,
        },
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Browse pagination args:', args);
      }
      
      return args;
    },
    {
      enabled: Boolean(!searchTerm && !isSemanticSearch),
      staleTime: 5 * 60 * 1000, // 5 minutes for browse results
    }
  );

  // Separate query for favourites (smaller dataset, doesn't need pagination)
  const favouritesQuery = useConvexQuery(
    api.favourites.getUserFavouriteIds,
    {},
    {
      queryKey: queryKeys.favourites.ids(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const favouriteIds = favouritesQuery.data;
  const favouriteIdsSet = useMemo(
    () => new Set(favouriteIds || []),
    [favouriteIds]
  );

  // Determine which query to use based on current mode
  const activeQuery = searchTerm && !isSemanticSearch ? searchInfiniteQuery : browseInfiniteQuery;
  
  // Flatten all pages into a single array
  const allTools = isSemanticSearch && semanticResults 
    ? semanticResults 
    : activeQuery.data?.pages.flatMap(page => page.page) ?? [];

  // Calculate categories for viewport prefetch (needed for hook)
  const toolsByCategory = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof allTools>);

  const categories = Object.keys(toolsByCategory).sort();

  // Initialize viewport prefetch for categories (always call hook)
  const { observeCategory } = useViewportPrefetch({
    categories,
    filters: {
      language,
      pricing: selectedPricing as 'free' | 'freemium' | 'paid' | undefined,
    },
    enabled: !isSemanticSearch && !searchTerm && !isMobile && !selectedCategory, // Only enable for desktop browse mode
  });

  // Development logging for pagination performance
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && activeQuery.data) {
      const totalPages = activeQuery.data.pages.length;
      const totalItems = allTools.length;
      console.log(`Pagination stats: ${totalPages} pages loaded, ${totalItems} total items`);
    }
  }, [activeQuery.data, allTools.length]);

  // Extract loading states
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;
  const error = activeQuery.error;
  const hasNextPage = activeQuery.hasNextPage;
  const isFetchingNextPage = activeQuery.isFetchingNextPage;
  const fetchNextPage = activeQuery.fetchNextPage;

  // Client-side pagination for non-infinite scroll mode
  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const tools = useInfiniteScrollMode ? allTools : allTools;
  
  // Infinite scroll logic - fetch next page from server
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isSemanticSearch) {
      fetchNextPage();
    }
  };
  
  // Background refetch indicator: show when fetching but not initial loading
  const isBackgroundRefetch = isFetching && !isLoading && allTools.length > 0;

  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
    threshold: 300,
  });

  // Pagination logic (for non-infinite scroll mode)
  const totalPages = Math.ceil(allTools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTools = useInfiniteScrollMode ? tools : allTools.slice(startIndex, endIndex);

  // Handle error state
  if (error) {
    return (
      <Card className="mx-auto max-w-md py-20 text-center shadow-sm">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-12 w-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="mb-3 text-xl">
            {language === "en" ? "Error loading tools" : "Lỗi khi tải công cụ"}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {error.message || (language === "en" 
              ? "Something went wrong. Please try again later." 
              : "Đã xảy ra lỗi. Vui lòng thử lại sau."
            )}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Only show skeleton on initial load (no cached data)
  if (isLoading && allTools.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading amazing AI tools...</p>
          </div>
        </div>
        <ToolCardSkeletonGrid count={PAGE_SIZE} />
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <Card className="mx-auto max-w-md py-20 text-center shadow-sm">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20">
            <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <CardTitle className="mb-3 text-xl">
            {language === "en" ? "No AI tools found" : "Không tìm thấy công cụ AI nào"}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {language === "en" 
              ? "Try adjusting your search terms or filters to discover more amazing AI tools." 
              : "Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để khám phá thêm các công cụ AI tuyệt vời."
            }
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === "en" ? "Previous" : "Trước"}
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
                className="h-8 w-8 p-0 shadow-sm"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="shadow-sm"
        >
          {language === "en" ? "Next" : "Tiếp"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Use pagination for mobile, categories for desktop
  if (isMobile || selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Background refetch indicator */}
        {isBackgroundRefetch && (
          <motion.div
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>
              {language === "en" ? "Updating..." : "Đang cập nhật..."}
            </span>
          </motion.div>
        )}
        
        {selectedCategory && (
          <motion.div 
            className="mb-6 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {selectedCategory}
            </h2>
            <Badge variant="default" className="text-xs shadow-md">
              {tools.length}
            </Badge>
          </motion.div>
        )}
        
        {/* Semantic search indicator */}
        {isSemanticSearch && (
          <motion.div
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              {language === "en" 
                ? "Results ranked by semantic similarity" 
                : "Kết quả được xếp hạng theo độ tương đồng ngữ nghĩa"}
            </span>
          </motion.div>
        )}
        
        <motion.div 
          className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.02
              }
            }
          }}
        >
          {(paginatedTools || []).map((tool) => (
            <motion.div
              key={tool._id}
              className="flex h-full min-h-0"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.25,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <ToolCard 
                tool={tool} 
                language={language}
                showScore={isSemanticSearch && '_score' in tool}
                isFavourited={favouriteIdsSet.has(tool._id)}
                config={{ 
                  size: 'compact', 
                  layout: 'vertical' 
                }} 
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Infinite scroll sentinel or pagination controls */}
        {useInfiniteScrollMode ? (
          <>
            {hasNextPage && (
              <div ref={sentinelRef} className="flex items-center justify-center py-8">
                {isFetchingNextPage && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              </div>
            )}
          </>
        ) : (
          <PaginationControls />
        )}
      </div>
    );
  }

  // Desktop view with categories (toolsByCategory and categories already calculated above)

  return (
    <div className="space-y-12">
      {/* Background refetch indicator */}
      {isBackgroundRefetch && (
        <motion.div
          className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>
            {language === "en" ? "Updating..." : "Đang cập nhật..."}
          </span>
        </motion.div>
      )}
      
      {/* Semantic search indicator */}
      {isSemanticSearch && (
        <motion.div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            {language === "en" 
              ? "Results ranked by semantic similarity" 
              : "Kết quả được xếp hạng theo độ tương đồng ngữ nghĩa"}
          </span>
        </motion.div>
      )}
      
      {categories.map((category, categoryIndex) => (
        <CategorySection
          key={category}
          category={category}
          tools={toolsByCategory[category]}
          categoryIndex={categoryIndex}
          language={language}
          isSemanticSearch={isSemanticSearch}
          favouriteIdsSet={favouriteIdsSet}
          observeCategory={observeCategory}
        />
      ))}

      {/* Infinite scroll sentinel for desktop */}
      {useInfiniteScrollMode && hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          {isFetchingNextPage && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </div>
      )}
    </div>
  );
}

// Separate component for category sections with scroll animation
function CategorySection({
  category,
  tools,
  categoryIndex,
  language,
  isSemanticSearch,
  favouriteIdsSet,
  observeCategory,
}: {
  category: string;
  tools: ToolWithScore[];
  categoryIndex: number;
  language: "en" | "vi";
  isSemanticSearch: boolean;
  favouriteIdsSet: Set<Id<"aiTools">>;
  observeCategory?: (element: Element | null, categoryIndex: number) => (() => void) | undefined;
}) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Set up viewport prefetch observer
  const categoryRef = useCallback((element: HTMLDivElement | null) => {
    // Set the ref for scroll animation
    ref.current = element;
    
    // Set up viewport prefetch observer if provided
    if (element && observeCategory) {
      const cleanup = observeCategory(element, categoryIndex);
      
      // Store cleanup function to call on unmount
      return cleanup;
    }
  }, [ref, observeCategory, categoryIndex]);

  return (
    <div ref={categoryRef}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{
          duration: 0.5,
          delay: Math.min(categoryIndex * 0.1, 0.3), // Cap delay at 0.3s
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {category}
          </h2>
          <Badge variant="default" className="text-xs shadow-md">
            {tools.length}
          </Badge>
        </div>
        <motion.div
          className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.01, // Reduced for faster animation
              },
            },
          }}
        >
          {tools.map((tool, _index) => (
            <motion.div
              key={tool._id}
              className="flex h-full min-h-0"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.2, // Faster animation
                    ease: "easeOut",
                  },
                },
              }}
            >
              <ToolCard
                tool={tool}
                language={language}
                showScore={isSemanticSearch && "_score" in tool}
                isFavourited={favouriteIdsSet?.has(tool._id)}
                config={{
                  size: "compact",
                  layout: "vertical",
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
