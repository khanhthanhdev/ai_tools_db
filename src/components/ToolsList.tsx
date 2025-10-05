import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCard } from "./ToolCard";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Doc } from "../../convex/_generated/dataModel";

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
  const ITEMS_PER_PAGE_MOBILE = 6;
  const ITEMS_PER_PAGE_DESKTOP = 12;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPricing, isSemanticSearch]);
  
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

  // Use semantic results if provided, otherwise use keyword search or browse results
  const tools = isSemanticSearch && semanticResults 
    ? semanticResults 
    : searchTerm 
      ? searchResults 
      : browseResults;

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

  // Pagination logic
  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const totalPages = tools ? Math.ceil(tools.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTools = tools?.slice(startIndex, endIndex);

  if (tools === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="font-medium text-muted-foreground">Loading amazing AI tools...</p>
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
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
                staggerChildren: 0.05
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
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }
                }
              }}
            >
              <ToolCard 
                tool={tool} 
                language={language}
                showScore={isSemanticSearch && '_score' in tool}
                config={{ 
                  size: 'compact', 
                  layout: 'vertical' 
                }} 
              />
            </motion.div>
          ))}
        </motion.div>
        
        <PaginationControls />
      </div>
    );
  }

  // Desktop view with categories (no pagination)
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
        <motion.div 
          key={category}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: categoryIndex * 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {category}
            </h2>
            <Badge variant="default" className="text-xs shadow-md">
              {toolsByCategory[category].length}
            </Badge>
          </div>
          <motion.div 
            className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04
                }
              }
            }}
          >
            {toolsByCategory[category].map((tool) => (
              <motion.div
                key={tool._id}
                className="flex h-full min-h-0"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }
                }}
              >
                <ToolCard 
                  tool={tool} 
                  language={language}
                  showScore={isSemanticSearch && '_score' in tool}
                  config={{ 
                    size: 'compact', 
                    layout: 'vertical' 
                  }} 
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
