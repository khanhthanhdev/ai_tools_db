import { Doc } from "../../convex/_generated/dataModel";
import { TrendingUp, ExternalLink, Info } from "lucide-react";
import { motion } from "motion/react";
import { FavouriteButton } from "@/components/ui/favourite-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToolDetailDrawer } from "./ToolDetailDrawer";

type ToolWithScore = Doc<"aiTools"> & { _score?: number };

interface ToolCardProps {
  tool: ToolWithScore;
  language: "en" | "vi";
  showScore?: boolean;
  isFavourited?: boolean;
  config?: {
    size?: "compact" | "default";
    layout?: "vertical" | "horizontal";
  };
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

const pricingVariants = {
  free: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
    icon: "🆓",
    gradient: "from-emerald-500/10 to-green-500/5",
  },
  freemium: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
    icon: "⭐",
    gradient: "from-amber-500/10 to-yellow-500/5",
  },
  paid: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
    icon: "💎",
    gradient: "from-blue-500/10 to-indigo-500/5",
  },
} as const;

export function ToolCard({ tool, language, showScore = false, isFavourited }: ToolCardProps) {
  const pricingStyle = pricingVariants[tool.pricing];
  const description = tool.description;
  const averageRating = tool.averageRating ?? 0;
  const totalReviews = tool.totalReviews ?? 0;
  const similarityScore =
    tool._score !== undefined ? Math.round(tool._score * 100) : undefined;

  const tagLimit = 3;
  const displayTags = tool.tags.slice(0, tagLimit);
  const remainingTags = Math.max(0, tool.tags.length - tagLimit);
  const hiddenTags = tool.tags.slice(tagLimit);

  const smallMedia = tool.logoUrl ? (
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          pricingStyle.gradient
        )}
      />
      <img
        src={tool.logoUrl}
        alt={tool.name}
        className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-xl border-2 object-cover shadow-sm"
        loading="lazy"
      />
    </div>
  ) : (
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          pricingStyle.gradient
        )}
      />
      <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex flex-shrink-0 items-center justify-center rounded-xl border-2 bg-gradient-to-br from-muted to-muted/50 text-xl sm:text-2xl shadow-sm">
        🤖
      </div>
    </div>
  );

  return (
    <Card
        className={cn(
          "group/card relative w-full h-full min-h-[300px] sm:min-h-[340px]",
          "overflow-hidden",
          "border-2 transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30",
          "bg-gradient-to-br from-card to-card/50 backdrop-blur-sm",
          "flex flex-col"
        )}
      >
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none",
            pricingStyle.gradient
          )}
        />

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
        </div>

        {/* Trending indicator */}
        {tool.category === "Popular" && (
          <motion.div
            className="absolute top-3 right-3 z-10"
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

        <CardContent className="relative flex h-full flex-col !p-4 sm:!p-5">
          {/* Logo + Name + Favourite */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
            {smallMedia}
            <CardTitle className="flex-1 text-base sm:text-lg font-bold leading-tight line-clamp-2 transition-colors duration-300 group-hover/card:text-primary">
              {tool.name}
            </CardTitle>
            <FavouriteButton toolId={tool._id} isFavourited={isFavourited} />
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2 sm:mb-2.5">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold shadow-sm w-fit transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md",
                pricingStyle.badge
              )}
            >
              {pricingStyle.icon} {pricingLabels[language][tool.pricing]}
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs font-medium w-fit transition-all duration-300 group-hover/card:scale-105 backdrop-blur-sm"
            >
              {tool.category}
            </Badge>
            {similarityScore !== undefined && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold shadow-sm w-fit transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400"
                    >
                      ✨ {similarityScore}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>
                      {language === "en"
                        ? "Similarity score"
                        : "Điểm tương đồng"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Description */}
          <div className="flex-1 mb-2 sm:mb-2.5">
            <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-3 transition-colors duration-300">
              {description || "\u00A0"}
            </CardDescription>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5 mb-2 sm:mb-3 min-h-[24px] sm:min-h-[28px]">
            {displayTags.length > 0 && (
              <TooltipProvider delayDuration={200}>
                {displayTags.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs h-fit transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 cursor-default truncate max-w-[120px]"
                        >
                          {tag}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-[250px] break-words"
                      >
                        <p>{tag}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
                {remainingTags > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground h-fit transition-all duration-300 hover:bg-muted hover:scale-105 cursor-default"
                      >
                        +{remainingTags}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <div className="flex flex-col gap-1">
                        {hiddenTags.map((tag, index) => (
                          <span key={index} className="text-xs">
                            • {tag}
                          </span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex items-center mb-2 sm:mb-3">
            <StarRating
              rating={averageRating}
              size={18}
              showCount
              totalReviews={totalReviews}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-2 mt-auto">
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-3/5 group/btn relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-9 sm:h-10 text-xs sm:text-sm"
            >
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10"
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {language === "en" ? "Try Now" : "Thử ngay"}
                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              </a>
            </Button>

            <ToolDetailDrawer tool={tool} language={language}>
              <Button
                variant="outline"
                size="sm"
                className="w-2/5 group/btn relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-9 sm:h-10 px-2"
              >
                <Info className="h-4 w-4 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">
                  {language === "en" ? "Details" : "Chi tiết"}
                </span>
              </Button>
            </ToolDetailDrawer>
          </div>
        </CardContent>
      </Card>
  );
}
