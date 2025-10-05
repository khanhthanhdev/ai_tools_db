import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCard } from "./ToolCard";
import { ToolCardSkeletonGrid } from "./ToolCardSkeleton";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
  const [loadedPages, setLoadedPages] = useState(1); // For infinite scroll
  const ITEMS_PER_PAGE_MOBILE = 6;
  const ITEMS_PER_PAGE_DESKTOP = 12;
  const INITIAL_LOAD = 8; // Load fewer items initially for faster first paint

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setLoadedPages(1);
  }, [searchTerm, selectedCategory, selectedPricing, isSemanticSearch]);

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

  const searchResults = useQuery(
    api.aiTools.searchTools,
    searchTerm && !isSemanticSearch
      ? {
          searchTerm,
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing as any || undefined,
        }
      : "skip"
  );

  const browseResults = useQuery(
    api.aiTools.listTools,
    !searchTerm && !isSemanticSearch
      ? {
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing as any || undefined,
        }
      : "skip"
  );

  // Batch fetch all favourite IDs once instead of per-tool
  const favouriteIds = useQuery(api.favourites.getUserFavouriteIds);
  const favouriteIdsSet = useMemo(
    () => new Set(favouriteIds || []),
    [favouriteIds]
  );

  // Use semantic results if provided, otherwise use keyword search or browse results
  const allTools = isSemanticSearch && semanticResults 
    ? semanticResults 
    : searchTerm 
      ? searchResults 
      : browseResults;

  // Client-side pagination for infinite scroll
  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const itemsToShow = useInfiniteScrollMode ? INITIAL_LOAD * loadedPages : itemsPerPage;
  const tools = allTools?.slice(0, itemsToShow);
  
  const toolsData = allTools ? {
    tools: tools || [],
    total: allTools.length,
    hasMore: (tools?.length || 0) < allTools.length,
  } : undefined;

  // Infinite scroll logic
  const handleLoadMore = () => {
    if (toolsData?.hasMore && !isSemanticSearch) {
      setLoadedPages(prev => prev + 1);
    }
  };

  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore: toolsData?.hasMore ?? false,
    isLoading: toolsData === undefined,
    threshold: 300,
  });

  // Pagination logic (for non-infinite scroll mode)
  const totalPages = allTools ? Math.ceil(allTools.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTools = useInfiniteScrollMode ? tools : allTools?.slice(startIndex, endIndex);

  if (toolsData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading amazing AI tools...</p>
          </div>
        </div>
        <ToolCardSkeletonGrid count={INITIAL_LOAD} />
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
            {toolsData?.hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <PaginationControls />
        )}
      </div>
    );
  }

  // Desktop view with categories
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const categories = Object.keys(toolsByCategory).sort();

  return (
    <div className="space-y-12">
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
        />
      ))}

      {/* Infinite scroll sentinel for desktop */}
      {useInfiniteScrollMode && toolsData?.hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
}: {
  category: string;
  tools: ToolWithScore[];
  categoryIndex: number;
  language: "en" | "vi";
  isSemanticSearch: boolean;
  favouriteIdsSet: Set<Id<"aiTools">>;
}) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
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
          {tools.map((tool, index) => (
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
