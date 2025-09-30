import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolCard } from "./ToolCard";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";

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

  // Group tools by category for better organization
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const categories = Object.keys(toolsByCategory).sort();

  return (
    <div className="space-y-16">
      {selectedCategory ? (
        // Show single category
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-10 bg-gradient-to-b from-primary to-primary/80 rounded-full"></div>
            <h2 className="text-3xl font-bold text-foreground">{selectedCategory}</h2>
            <Badge variant="secondary">
              {tools.length} {language === "en" ? "tools" : "công cụ"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => (
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
      ) : (
        // Show all categories
        categories.map((category) => (
          <div key={category}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-10 bg-gradient-to-b from-primary to-primary/80 rounded-full"></div>
              <h2 className="text-3xl font-bold text-foreground">{category}</h2>
              <Badge variant="secondary">
                {toolsByCategory[category].length} {language === "en" ? "tools" : "công cụ"}
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
        ))
      )}
    </div>
  );
}
