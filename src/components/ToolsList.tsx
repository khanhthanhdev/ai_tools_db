import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCard } from "./ToolCard";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ToolsListProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPricing: string;
  language: "en" | "vi";
}

export function ToolsList({
  searchTerm,
  selectedCategory,
  selectedPricing,
  language,
}: ToolsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE_MOBILE = 6;
  const ITEMS_PER_PAGE_DESKTOP = 12;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPricing]);
  const searchResults = useQuery(
    api.aiTools.searchTools,
    searchTerm
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
    !searchTerm
      ? {
          language,
          category: selectedCategory || undefined,
          pricing: selectedPricing as any || undefined,
        }
      : "skip"
  );

  const tools = searchTerm ? searchResults : browseResults;

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
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground font-medium">Loading amazing AI tools...</p>
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <Card className="text-center py-20 max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <CardTitle className="text-xl mb-3">
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
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
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
                className="w-8 h-8 p-0"
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
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">{selectedCategory}</h2>
            <Badge variant="default" className="text-xs">
              {tools.length}
            </Badge>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(paginatedTools || []).map((tool) => (
            <ToolCard 
              key={tool._id} 
              tool={tool} 
              language={language} 
              config={{ 
                size: 'compact', 
                layout: 'vertical' 
              }} 
            />
          ))}
        </div>
        
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
      {categories.map((category) => (
        <div key={category}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            <Badge variant="default" className="text-xs">
              {toolsByCategory[category].length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toolsByCategory[category].map((tool) => (
              <ToolCard 
                key={tool._id} 
                tool={tool} 
                language={language} 
                config={{ 
                  size: 'compact', 
                  layout: 'vertical' 
                }} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
