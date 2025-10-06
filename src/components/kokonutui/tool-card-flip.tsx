"use client";

import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useState, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "../../../convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { useConvexMutation } from "@/hooks/useConvexMutation";
import { toast } from "sonner";

export interface ToolCardFlipProps {
  // Front side props
  toolId: string;
  name: string;
  logoUrl?: string;
  pricing: "free" | "freemium" | "paid";
  category: string;
  description: string;
  tags?: string[];
  averageRating: number;
  totalReviews: number;
  url: string;
  language: "en" | "vi";
  
  // Styling
  pricingStyle: {
    badge: string;
    icon: string;
    gradient: string;
  };
  pricingLabel: string;
  
  // Interactive elements
  favouriteButton: ReactNode;
  trendingIndicator?: ReactNode;
  similarityScore?: number;
}

export default function ToolCardFlip({
  toolId,
  name,
  logoUrl,
  category,
  description,
  tags = [],
  averageRating,
  totalReviews,
  url,
  language,
  pricingStyle,
  pricingLabel,
  favouriteButton,
  trendingIndicator,
  similarityScore,
}: ToolCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: user } = useConvexQuery(api.auth.loggedInUser, {});
  const createReview = useConvexMutation(api.reviews.createReview);
  const [userRating, setUserRating] = useState<number | null>(null);

  const handleRatingChange = (rating: number) => {
    if (!user) {
      toast.error(language === "en" ? "You must be logged in to rate this tool." : "Bạn cần đăng nhập để đánh giá công cụ này.");
      return;
    }

    // Don't await here, let it run in the background
    createReview.mutateAsync({
      toolId: toolId as any,
      rating,
      reviewText: undefined,
    }).then(() => {
      setUserRating(rating);
      toast.success(language === "en" ? "Rating submitted successfully!" : "Đánh giá đã được gửi thành công!");
    }).catch((error: any) => {
      if (error.message?.includes("already reviewed")) {
        toast.error(language === "en" ? "You have already rated this tool." : "Bạn đã đánh giá công cụ này rồi.");
      } else {
        toast.error(language === "en" ? "Failed to submit rating." : "Không thể gửi đánh giá.");
      }
    });
  };
  const ctaLabel = language === "en" ? "Try Now" : "Thử ngay";
  const tagLimit = 3;
  const displayTags = tags.slice(0, tagLimit);
  const remainingTags = Math.max(0, tags.length - tagLimit);
  const hiddenTags = tags.slice(tagLimit);

  // Media component (logo or placeholder)
  const smallMedia = logoUrl ? (
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        pricingStyle.gradient
      )} />
      <img
        src={logoUrl}
        alt={name}
        className="relative h-16 w-16 flex-shrink-0 rounded-xl border-2 object-cover shadow-sm"
        loading="lazy"
      />
    </div>
  ) : (
    <div className="relative group-hover:scale-105 transition-transform duration-300">
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        pricingStyle.gradient
      )} />
      <div className="relative h-16 w-16 flex flex-shrink-0 items-center justify-center rounded-xl border-2 bg-gradient-to-br from-muted to-muted/50 text-2xl shadow-sm">
        🤖
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full h-full min-h-[380px] group [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative w-full h-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of card */}
        <Card
          className={cn(
            "group/card absolute inset-0 w-full h-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden",
            "border-2 transition-all duration-300",
            "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30",
            "bg-gradient-to-br from-card to-card/50 backdrop-blur-sm",
            "flex flex-col",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {favouriteButton}
          
          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none",
            pricingStyle.gradient
          )} />
          
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          </div>

          <CardContent className="relative flex h-full flex-col p-3 sm:p-4">
            {/* Top row: logo + badges */}
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              {smallMedia}
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold shadow-sm w-fit transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md",
                      pricingStyle.badge
                    )}
                  >
                    {pricingStyle.icon} {pricingLabel}
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
                <Badge
                  variant="secondary"
                  className="text-xs font-medium w-fit transition-all duration-300 group-hover/card:scale-105 backdrop-blur-sm"
                >
                  {category}
                </Badge>
              </div>
            </div>

            {/* Title + Description */}
            <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <CardTitle className="text-base sm:text-lg font-bold leading-tight line-clamp-2 transition-colors duration-300 group-hover/card:text-primary">
                {name}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed line-clamp-3 transition-colors duration-300">
                {description || "\u00A0"}
              </CardDescription>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3 min-h-[28px]">
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
                        <TooltipContent side="top" className="max-w-[250px] break-words">
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
                            <span key={index} className="text-xs">• {tag}</span>
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
                size={20}
                showCount
                totalReviews={totalReviews}
              />
            </div>

            {/* Trending indicator */}
            {trendingIndicator}
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className={cn(
            "group/card absolute inset-0 w-full h-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "border-2 transition-all duration-300",
            "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30",
            "bg-gradient-to-br from-card to-card/50 backdrop-blur-sm",
            "flex flex-col",
            !isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none",
            pricingStyle.gradient
          )} />

          <CardContent className="relative flex h-full flex-col p-3 sm:p-4 justify-start items-start gap-3 sm:gap-4">
            {/* Logo and Name in same line */}
            <div className="flex items-center gap-3 sm:gap-4 w-full mb-2 sm:mb-3">
              {/* Logo */}
              {logoUrl ? (
                <div className="relative group-hover/card:scale-105 transition-transform duration-300 flex-shrink-0">
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br blur-lg opacity-30",
                    pricingStyle.gradient
                  )} />
                  <img
                    src={logoUrl}
                    alt={name}
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 object-cover shadow-md"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative group-hover/card:scale-105 transition-transform duration-300 flex-shrink-0">
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br blur-lg opacity-30",
                    pricingStyle.gradient
                  )} />
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl border-2 bg-gradient-to-br from-muted to-muted/50 text-2xl shadow-md">
                    🤖
                  </div>
                </div>
              )}

              {/* Tool Name */}
              <CardTitle className="text-lg sm:text-xl font-bold leading-tight transition-colors duration-300 group-hover/card:text-primary flex-1">
                {name}
              </CardTitle>
            </div>

            {/* Description */}
            <CardDescription className="text-sm sm:text-base leading-relaxed line-clamp-3 transition-colors duration-300 mb-2 sm:mb-3">
              {description || "No description available"}
            </CardDescription>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2 w-full mb-2 sm:mb-3">
              <StarRating
                rating={userRating ?? averageRating}
                size={24}
                showCount
                totalReviews={totalReviews}
                isEditable={true}
                onRatingChange={handleRatingChange}
              />
              {totalReviews === 0 && (
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "No reviews yet" : "Chưa có đánh giá"}
                </p>
              )}
              {user && (
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Click to rate this tool" : "Nhấp để đánh giá công cụ này"}
                </p>
              )}
            </div>

            {/* Try Now Button */}
            <Button
              asChild
              variant="default"
              size="default"
              className="w-full group/btn relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 px-4 py-2.5 mt-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" className="relative z-10">
                <span className="flex items-center justify-center gap-2">
                  {ctaLabel}
                  <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
