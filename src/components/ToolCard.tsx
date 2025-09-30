import { Doc } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface ToolCardProps {
  tool: Doc<"aiTools">;
  language: "en" | "vi";
}

const pricingLabels = {
  en: {
    free: "Free",
    freemium: "Freemium", 
    paid: "Paid",
  },
  vi: {
    free: "Miễn phí",
    freemium: "Freemium",
    paid: "Trả phí",
  },
};

interface ToolCardConfig {
  size?: 'compact' | 'default' | 'large';
  layout?: 'vertical' | 'horizontal';
}

export function ToolCard({ tool, language, config = {} }: ToolCardProps & { config?: ToolCardConfig }) {
  const { size = 'default', layout = 'vertical' } = config;
  
  const pricingVariants = {
    free: "success" as const,
    freemium: "warning" as const, 
    paid: "secondary" as const,
  } as const;

  const pricingIcons = {
    free: "🆓",
    freemium: "⭐", 
    paid: "💎",
  };

  const sizeConfig = {
    compact: {
      logoSize: 'w-12 h-12',
      titleSize: 'text-base',
      descriptionLines: 'line-clamp-2',
    },
    default: {
      logoSize: 'w-16 h-16',
      titleSize: 'text-lg', 
      descriptionLines: 'line-clamp-3',
    },
    large: {
      logoSize: 'w-20 h-20',
      titleSize: 'text-xl',
      descriptionLines: 'line-clamp-4',
    }
  };

  const currentSize = sizeConfig[size];
  const description = tool.description;

  if (layout === 'horizontal') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="flex p-6 gap-6">
          <div className="flex-shrink-0">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                className={`${currentSize.logoSize} rounded-lg object-cover border`}
              />
            ) : (
              <div className={`${currentSize.logoSize} rounded-lg border bg-muted flex items-center justify-center`}>
                <div className="text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs text-muted-foreground font-medium">AI</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <CardTitle className={`${currentSize.titleSize} mb-2 line-clamp-1`}>
                  {tool.name}
                </CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={pricingVariants[tool.pricing]}>
                    {pricingIcons[tool.pricing]} {pricingLabels[language][tool.pricing]}
                  </Badge>
                  <Badge variant="secondary">
                    {tool.category}
                  </Badge>
                </div>
              </div>
            </div>

            <CardDescription className={`${currentSize.descriptionLines} mb-4`}>
              {description}
            </CardDescription>

            {tool.tags && tool.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {tool.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tool.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Button asChild variant="secondary" className="w-fit">
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                {language === "en" ? "Try Now" : "Thử ngay"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                className={`${currentSize.logoSize} rounded-lg object-cover border flex-shrink-0`}
              />
            ) : (
              <div className={`${currentSize.logoSize} rounded-lg border bg-muted flex items-center justify-center flex-shrink-0`}>
                <div className="text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs text-muted-foreground font-medium">AI</div>
                </div>
              </div>
            )}
          </div>
          <Badge variant={pricingVariants[tool.pricing]} className="flex-shrink-0">
            {pricingIcons[tool.pricing]} {pricingLabels[language][tool.pricing]}
          </Badge>
        </div>

        <div className="mb-4">
          <CardTitle className={`${currentSize.titleSize} mb-2 line-clamp-2`}>
            {tool.name}
          </CardTitle>
          <Badge variant="secondary">
            {tool.category}
          </Badge>
        </div>

        <CardDescription className={`${currentSize.descriptionLines} mb-6 flex-grow`}>
          {description}
        </CardDescription>

        {tool.tags && tool.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.tags.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <Button asChild variant="secondary" className="w-full">
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              {language === "en" ? "Try Now" : "Thử ngay"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
