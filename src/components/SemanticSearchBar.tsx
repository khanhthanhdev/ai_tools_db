import { useState, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/ToolCard";
import { Search, Loader2, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Language = "en" | "vi";
type SearchType = "semantic" | "hybrid";
type PricingFilter = "free" | "freemium" | "paid" | undefined;

interface SemanticSearchBarProps {
  language: Language;
  onResultsChange?: (results: ToolWithScore[]) => void;
  category?: string;
  pricing?: PricingFilter;
}

interface ToolWithScore extends Doc<"aiTools"> {
  _score?: number;
  _searchType?: "semantic" | "keyword" | "hybrid";
}

const translations = {
  en: {
    searchPlaceholder:
      "Search with natural language... (e.g., 'tools for writing blog posts')",
    searchButton: "Search",
    searchType: "Search Type",
    semantic: "Semantic",
    hybrid: "Hybrid",
    semanticDesc: "Natural language understanding",
    hybridDesc: "Best of both worlds",
    examplesTitle: "Try these example queries:",
    examples: [
      "tools for creating presentations",
      "help me write better code",
      "design tools for social media",
      "automate my email responses",
      "analyze data and create charts",
    ],
    noResults: "No tools found",
    noResultsDesc: "Try different keywords or adjust your filters",
    loading: "Searching...",
    resultsCount: "results",
    similarityScore: "Match",
    errorTitle: "Search Error",
    rateLimitError: "Too many searches. Please wait a moment and try again.",
    genericError: "Search failed. Please try again.",
  },
  vi: {
    searchPlaceholder:
      "Tìm kiếm bằng ngôn ngữ tự nhiên... (vd: 'công cụ viết bài blog')",
    searchButton: "Tìm kiếm",
    searchType: "Loại tìm kiếm",
    semantic: "Ngữ nghĩa",
    hybrid: "Kết hợp",
    semanticDesc: "Hiểu ngôn ngữ tự nhiên",
    hybridDesc: "Tốt nhất của cả hai",
    examplesTitle: "Thử các truy vấn mẫu:",
    examples: [
      "công cụ tạo bài thuyết trình",
      "giúp tôi viết code tốt hơn",
      "công cụ thiết kế cho mạng xã hội",
      "tự động hóa email trả lời",
      "phân tích dữ liệu và tạo biểu đồ",
    ],
    noResults: "Không tìm thấy công cụ nào",
    noResultsDesc: "Thử từ khóa khác hoặc điều chỉnh bộ lọc",
    loading: "Đang tìm kiếm...",
    resultsCount: "kết quả",
    similarityScore: "Khớp",
    errorTitle: "Lỗi tìm kiếm",
    rateLimitError: "Quá nhiều tìm kiếm. Vui lòng đợi một chút và thử lại.",
    genericError: "Tìm kiếm thất bại. Vui lòng thử lại.",
  },
};

export function SemanticSearchBar({
  language,
  onResultsChange,
  category,
  pricing,
}: SemanticSearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("hybrid");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ToolWithScore[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const semanticSearch = useAction(api.actions.semanticSearch);
  const hybridSearch = useAction(api.actions.hybridSearch);

  // Batch fetch all favourite IDs once
  const favouriteIds = useQuery(api.favourites.getUserFavouriteIds);
  const favouriteIdsSet = useMemo(
    () => new Set(favouriteIds || []),
    [favouriteIds]
  );

  const t = translations[language];

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const searchAction =
        searchType === "semantic" ? semanticSearch : hybridSearch;

      const searchResults = await searchAction({
        query: trimmedQuery,
        limit: 20,
        language,
        category: category || undefined,
        pricing: pricing || undefined,
      });

      setResults(searchResults as ToolWithScore[]);
      onResultsChange?.(searchResults as ToolWithScore[]);
    } catch (error: any) {
      console.error("Search failed:", error);
      
      // Check if it's a rate limit error
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("Rate limit exceeded")) {
        setError(errorMessage);
      } else {
        setError(t.genericError);
      }
      
      setResults([]);
      onResultsChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    // Trigger search after setting query
    setTimeout(() => {
      const form = document.getElementById(
        "semantic-search-form"
      ) as HTMLFormElement;
      form?.requestSubmit();
    }, 0);
  };

  const showExamples = !query && !hasSearched;

  return (
    <div className="w-full space-y-6">
      {/* Search Form */}
      <form
        id="semantic-search-form"
        onSubmit={handleSearch}
        className="space-y-4"
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="pl-10 pr-4 h-12 text-base"
            disabled={loading}
          />
        </div>

        {/* Search Type Toggle and Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Type Toggle */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {t.searchType}:
            </span>
            <div className="flex gap-2 flex-1">
              <Button
                type="button"
                variant={searchType === "semantic" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("semantic")}
                className={cn(
                  "flex-1 sm:flex-none gap-2",
                  searchType === "semantic" &&
                    "bg-purple-600 hover:bg-purple-700"
                )}
                disabled={loading}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">{t.semantic}</span>
                <span className="sm:hidden">{t.semantic}</span>
              </Button>
              <Button
                type="button"
                variant={searchType === "hybrid" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("hybrid")}
                className={cn(
                  "flex-1 sm:flex-none gap-2",
                  searchType === "hybrid" && "bg-blue-600 hover:bg-blue-700"
                )}
                disabled={loading}
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">{t.hybrid}</span>
                <span className="sm:hidden">{t.hybrid}</span>
              </Button>
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="gap-2 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.loading}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {t.searchButton}
              </>
            )}
          </Button>
        </div>

        {/* Search Type Description */}
        <div className="text-xs text-muted-foreground">
          {searchType === "semantic" ? (
            <span>✨ {t.semanticDesc}</span>
          ) : (
            <span>⚡ {t.hybridDesc}</span>
          )}
        </div>
      </form>

      {/* Example Queries */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {t.examplesTitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {t.examples.map((example, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive text-xl">⚠️</span>
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-destructive">{t.errorTitle}</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!loading && !error && hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Results Count */}
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {results.length} {t.resultsCount}
              </Badge>
              {searchType === "hybrid" && (
                <span className="text-xs text-muted-foreground">
                  ({results.filter((r) => r._searchType === "semantic").length}{" "}
                  semantic,{" "}
                  {results.filter((r) => r._searchType === "keyword").length}{" "}
                  keyword)
                </span>
              )}
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((tool, index) => (
                <motion.div
                  key={tool._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative"
                >
                  {/* Similarity Score Badge */}
                  {tool._score !== undefined && tool._score > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge
                        variant="success"
                        className="text-xs font-semibold shadow-lg"
                      >
                        {t.similarityScore} {Math.round(tool._score * 100)}%
                      </Badge>
                    </div>
                  )}
                  <ToolCard 
                    tool={tool} 
                    language={language}
                    isFavourited={favouriteIdsSet.has(tool._id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-3"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t.noResults}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.noResultsDesc}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
