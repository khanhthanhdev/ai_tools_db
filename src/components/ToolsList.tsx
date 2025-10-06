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

import { useConvexQuery } from "@/hooks/useConvexQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useConvex } from "convex/react";

import { queryKeys } from "@/lib/queryKeys";

type ToolWithScore = Doc<"aiTools"> & { _score?: number };

interface ToolsListProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPricing: string;
  language: "en" | "vi";
  semanticResults?: ToolWithScore[];
  isSemanticSearch?: boolean;
}

export function ToolsList({
  searchTerm,
  selectedCategory,
  selectedPricing,
  language,
  semanticResults,
  isSemanticSearch = false,
}: ToolsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Items per page
  
  const queryClient = useQueryClient();
  const convex = useConvex();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPricing, isSemanticSearch]);

  // Server-side pagination with offset-based queries
  // Calculate offset for current page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Query for search results (when searching) - server-side pagination
  const searchQuery = useConvexQuery(
    api.aiTools.searchToolsWithOffset,
    searchTerm && !isSemanticSearch
      ? {
          searchTerm,
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing
            ? (selectedPricing as "free" | "freemium" | "paid")
            : undefined,
          offset,
          limit: ITEMS_PER_PAGE,
        }
      : "skip",
    {
      queryKey: queryKeys.tools.paginatedSearch({
        searchTerm,
        language,
        category: selectedCategory,
        pricing: selectedPricing
          ? (selectedPricing as "free" | "freemium" | "paid")
          : undefined,
        page: currentPage,
      }),
      enabled: Boolean(searchTerm && !isSemanticSearch),
      staleTime: 2 * 60 * 1000, // 2 minutes
      // TanStack Query optimizations
      placeholderData: (previousData) => previousData, // Keep previous page data while loading new page
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    }
  );

  // Query for browse results (when not searching) - server-side pagination
  const browseQuery = useConvexQuery(
    api.aiTools.listToolsWithOffset,
    !searchTerm && !isSemanticSearch
      ? {
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing
            ? (selectedPricing as "free" | "freemium" | "paid")
            : undefined,
          offset,
          limit: ITEMS_PER_PAGE,
        }
      : "skip",
    {
      queryKey: queryKeys.tools.paginatedList({
        language,
        category: selectedCategory,
        pricing: selectedPricing
          ? (selectedPricing as "free" | "freemium" | "paid")
          : undefined,
        page: currentPage,
      }),
      enabled: Boolean(!searchTerm && !isSemanticSearch),
      staleTime: 5 * 60 * 1000, // 5 minutes for browse results
      // TanStack Query optimizations
      placeholderData: (previousData) => previousData, // Keep previous page data while loading new page
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
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
    () => new Set<Id<"aiTools">>(favouriteIds || []),
    [favouriteIds]
  );

  // Determine which query to use based on current mode
  const activeQuery =
    searchTerm && !isSemanticSearch ? searchQuery : browseQuery;

  // Get tools and pagination info from server response
  const serverData = activeQuery.data;
  const tools = isSemanticSearch && semanticResults 
    ? semanticResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : (serverData?.tools ?? []);
  
  const totalCount = isSemanticSearch && semanticResults 
    ? semanticResults.length 
    : (serverData?.totalCount ?? 0);
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

  // TanStack Query optimization: Prefetch adjacent pages for smooth navigation
  useEffect(() => {
    if (!isSemanticSearch && totalPages > 1) {
      const prefetchPage = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        
        const pageOffset = (page - 1) * ITEMS_PER_PAGE;
        const baseArgs = {
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing ? (selectedPricing as "free" | "freemium" | "paid") : undefined,
          offset: pageOffset,
          limit: ITEMS_PER_PAGE,
        };

        if (searchTerm) {
          // Prefetch search results
          queryClient.prefetchQuery({
            queryKey: queryKeys.tools.paginatedSearch({
              searchTerm,
              language,
              category: selectedCategory,
              pricing: selectedPricing ? (selectedPricing as "free" | "freemium" | "paid") : undefined,
              page,
            }),
            queryFn: () => convex.query(api.aiTools.searchToolsWithOffset, {
              searchTerm,
              ...baseArgs,
            }),
            staleTime: 2 * 60 * 1000,
          });
        } else {
          // Prefetch browse results
          queryClient.prefetchQuery({
            queryKey: queryKeys.tools.paginatedList({
              language,
              category: selectedCategory,
              pricing: selectedPricing ? (selectedPricing as "free" | "freemium" | "paid") : undefined,
              page,
            }),
            queryFn: () => convex.query(api.aiTools.listToolsWithOffset, baseArgs),
            staleTime: 5 * 60 * 1000,
          });
        }
      };

      // Prefetch next and previous pages
      prefetchPage(currentPage + 1); // Next page
      prefetchPage(currentPage - 1); // Previous page
    }
  }, [currentPage, totalPages, searchTerm, selectedCategory, selectedPricing, language, isSemanticSearch, queryClient, convex]);

  // Remove category-based layout - always show simple grid

  // Extract loading states
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;
  const error = activeQuery.error;

  // Background refetch indicator: show when fetching but not initial loading
  const isBackgroundRefetch = isFetching && !isLoading && tools.length > 0;

  // Handle error state
  if (error) {
    return (
      <Card className="mx-auto max-w-md py-20 text-center shadow-sm">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-12 w-12 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="mb-3 text-xl">
            {language === "en" ? "Error loading tools" : "Lỗi khi tải công cụ"}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {error.message ||
              (language === "en"
                ? "Something went wrong. Please try again later."
                : "Đã xảy ra lỗi. Vui lòng thử lại sau.")}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Only show skeleton on initial load (no cached data)
  if (isLoading && tools.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading amazing AI tools...
            </p>
          </div>
        </div>
        <ToolCardSkeletonGrid count={ITEMS_PER_PAGE} />
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <Card className="mx-auto max-w-md py-20 text-center shadow-sm">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20">
            <svg
              className="h-12 w-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <CardTitle className="mb-3 text-xl">
            {language === "en"
              ? "No AI tools found"
              : "Không tìm thấy công cụ AI nào"}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {language === "en"
              ? "Try adjusting your search terms or filters to discover more amazing AI tools."
              : "Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để khám phá thêm các công cụ AI tuyệt vời."}
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === "en" ? "Previous" : "Trước"}
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 7) {
              pageNumber = i + 1;
            } else if (currentPage <= 4) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNumber = totalPages - 6 + i;
            } else {
              pageNumber = currentPage - 3 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
                disabled={isLoading}
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || isLoading}
          className="shadow-sm"
        >
          {language === "en" ? "Next" : "Tiếp"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Always use simple grid layout with pagination
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
          <span>{language === "en" ? "Updating..." : "Đang cập nhật..."}</span>
        </motion.div>
      )}

      {/* Show category title if filtering by category */}
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
            {totalCount}
          </Badge>
        </motion.div>
      )}

      {/* Show results info */}
      {!selectedCategory && totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {language === "en"
              ? `Showing ${startIndex + 1}-${Math.min(endIndex, totalCount)} of ${totalCount} tools`
              : `Hiển thị ${startIndex + 1}-${Math.min(endIndex, totalCount)} trong ${totalCount} công cụ`}
          </span>
          <span>
            {language === "en"
              ? `Page ${currentPage} of ${totalPages}`
              : `Trang ${currentPage} / ${totalPages}`}
          </span>
        </div>
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

      {/* Tools grid */}
      <motion.div
        className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.02,
            },
          },
        }}
      >
        {(tools || []).map((tool) => (
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
                  ease: "easeOut",
                },
              },
            }}
          >
            <ToolCard
              tool={tool}
              language={language}
              showScore={isSemanticSearch && "_score" in tool}
              isFavourited={favouriteIdsSet.has(tool._id)}
              config={{
                size: "compact",
                layout: "vertical",
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination controls */}
      <PaginationControls />
    </div>
  );
}
