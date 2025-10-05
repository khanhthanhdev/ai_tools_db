import { Doc } from "../../convex/_generated/dataModel";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { FavouriteButton } from "@/components/ui/favourite-button";
import ToolCardFlip from "@/components/kokonutui/tool-card-flip";

type ToolWithScore = Doc<"aiTools"> & { _score?: number };

interface ToolCardProps {
  tool: ToolWithScore;
  language: "en" | "vi";
  showScore?: boolean;
  config?: {
    size?: 'compact' | 'default';
    layout?: 'vertical' | 'horizontal';
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

export function ToolCard({ tool, language, showScore = false, config }: ToolCardProps) {
  const pricingStyle = pricingVariants[tool.pricing];
  const description = tool.description;
  const averageRating = tool.averageRating ?? 0;
  const totalReviews = tool.totalReviews ?? 0;

  // Trending indicator for featured/popular tools
  const trendingIndicator = tool.category === "Popular" ? (
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
  ) : undefined;
  
  // Calculate similarity score percentage
  const similarityScore = tool._score !== undefined ? Math.round(tool._score * 100) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full"
    >
      <ToolCardFlip
        toolId={tool._id}
        name={tool.name}
        logoUrl={tool.logoUrl}
        pricing={tool.pricing}
        category={tool.category}
        description={description}
        tags={tool.tags}
        averageRating={averageRating}
        totalReviews={totalReviews}
        url={tool.url}
        language={language}
        pricingStyle={pricingStyle}
        pricingLabel={pricingLabels[language][tool.pricing]}
        favouriteButton={<FavouriteButton toolId={tool._id} />}
        trendingIndicator={trendingIndicator}
        similarityScore={showScore ? similarityScore : undefined}
      />
    </motion.div>
  );
}
