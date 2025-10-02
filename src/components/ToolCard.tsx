import { Doc } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

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
    gradient: "from-emerald-500/10 to-green-500/5",
  },
  freemium: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
    icon: "⭐",
    gradient: "from-amber-500/10 to-yellow-500/5",
  },
  paid: {
    badge: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
    icon: "💎",
    gradient: "from-blue-500/10 to-indigo-500/5",
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
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        pricingStyle.gradient
      )} />
      <img
        src={tool.logoUrl}
        alt={tool.name}
        className={cn(
          "relative flex-shrink-0 rounded-xl border-2 object-cover shadow-sm",
          sizing.media
        )}
        loading="lazy"
      />
    </div>
  ) : (
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        pricingStyle.gradient
      )} />
      <div
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center rounded-xl border-2 bg-gradient-to-br from-muted to-muted/50 text-2xl shadow-sm",
          sizing.media
        )}
      >
        🤖
      </div>
    </div>
  );

  // Optimized layout with modern effects
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none",
          pricingStyle.gradient
        )} />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
        </div>

        <CardContent className="relative flex h-full flex-col p-6">
          {/* Top row: logo + badges */}
          <div className="flex items-start gap-4 mb-4">
            {media}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-semibold shadow-sm w-fit transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                  pricingStyle.badge
                )}
              >
                {pricingStyle.icon} {pricingLabels[language][tool.pricing]}
              </Badge>
              <Badge 
                variant="secondary" 
                className="text-xs font-medium w-fit transition-all duration-300 group-hover:scale-105 backdrop-blur-sm"
              >
                {tool.category}
              </Badge>
            </div>
          </div>
          
          {/* Title + Description - Flexible area */}
          <div className="flex-1 flex flex-col gap-3 mb-4">
            <CardTitle className={cn(
              "font-bold leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-primary",
              sizing.title
            )}>
              {tool.name}
            </CardTitle>
            {description && (
              <CardDescription className={cn(
                "text-sm leading-relaxed transition-colors duration-300",
                sizing.description
              )}>
                {description}
              </CardDescription>
            )}
          </div>
          
          {/* Bottom section: Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
              {tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Badge 
                    variant="outline" 
                    className="text-xs h-fit transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:scale-105"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {remainingTags > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs text-muted-foreground h-fit transition-all duration-300 hover:bg-muted hover:scale-105"
                >
                  +{remainingTags}
                </Badge>
              )}
            </div>
          )}
          
          {/* CTA Button - Always at bottom */}
          <Button 
            asChild 
            variant="default" 
            size="sm" 
            className="w-full mt-auto group/btn relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="relative z-10">
              <span className="flex items-center justify-center gap-2">
                {ctaLabel}
                <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
              {/* Button hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            </a>
          </Button>

          {/* Trending indicator for featured/popular tools */}
          {tool.category === "Popular" && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full blur-sm animate-pulse" />
                <div className="relative bg-gradient-to-br from-orange-500 to-pink-500 rounded-full p-1.5 shadow-lg">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
