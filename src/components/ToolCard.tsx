import { Doc } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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
  size?: "compact" | "default" | "large";
  layout?: "vertical" | "horizontal";
}

const sizeConfig = {
  compact: {
    media: "h-14 w-14",
    title: "text-base",
    description: "line-clamp-2",
    tagLimit: 2,
  },
  default: {
    media: "h-16 w-16",
    title: "text-lg",
    description: "line-clamp-3",
    tagLimit: 3,
  },
  large: {
    media: "h-20 w-20",
    title: "text-xl",
    description: "line-clamp-4",
    tagLimit: 4,
  },
} as const;

const pricingVariants = {
  free: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
    icon: "🆓",
  },
  freemium: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
    icon: "⭐",
  },
  paid: {
    badge: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
    icon: "💎",
  },
} as const;

export function ToolCard({ tool, language, config = {} }: ToolCardProps & { config?: ToolCardConfig }) {
  const { size = "default" } = config;
  const sizing = sizeConfig[size];
  const pricingStyle = pricingVariants[tool.pricing];
  const description = tool.description;
  const tags = (tool.tags ?? []).slice(0, sizing.tagLimit);
  const remainingTags = Math.max(0, (tool.tags?.length ?? 0) - tags.length);
  const ctaLabel = language === "en" ? "Try Now" : "Thử ngay";

  // Media component (logo or placeholder)
  const media = tool.logoUrl ? (
    <img
      src={tool.logoUrl}
      alt={tool.name}
      className={cn(
        "flex-shrink-0 rounded-xl border object-cover transition-transform group-hover:scale-105",
        sizing.media
      )}
      loading="lazy"
    />
  ) : (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-xl border bg-muted text-2xl transition-transform group-hover:scale-105",
        sizing.media
      )}
    >
      🤖
    </div>
  );

  // Optimized layout: top row (logo + badges), middle (title + description), bottom (tags + CTA)
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardContent className="flex h-full flex-col p-5">
        {/* Top row: logo + badges */}
        <div className="flex items-start gap-3 mb-3">
          {media}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <Badge variant="outline" className={cn("text-xs font-medium shadow-sm w-fit", pricingStyle.badge)}>
              {pricingStyle.icon} {pricingLabels[language][tool.pricing]}
            </Badge>
            <Badge variant="secondary" className="text-xs font-medium w-fit">
              {tool.category}
            </Badge>
          </div>
        </div>
        
        {/* Title + Description - Flexible area */}
        <div className="flex-1 flex flex-col gap-2 mb-4">
          <CardTitle className={cn("font-semibold leading-tight line-clamp-2", sizing.title)}>
            {tool.name}
          </CardTitle>
          {description && (
            <CardDescription className={cn("text-sm leading-relaxed", sizing.description)}>
              {description}
            </CardDescription>
          )}
        </div>
        
        {/* Bottom section: Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs h-fit">
                {tag}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground h-fit">
                +{remainingTags}
              </Badge>
            )}
          </div>
        )}
        
        {/* CTA Button - Always at bottom */}
        <Button asChild variant="default" size="sm" className="w-full mt-auto">
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {ctaLabel}
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
