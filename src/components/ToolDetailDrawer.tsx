import * as React from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ToolWithScore = Doc<"aiTools"> & { _score?: number };

interface ToolDetailDrawerProps {
  tool: ToolWithScore;
  language: "en" | "vi";
  children: React.ReactNode;
}

const drawerVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
    rotateX: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

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

export function ToolDetailDrawer({ tool, language, children }: ToolDetailDrawerProps) {
  const user = useQuery(api.auth.loggedInUser);
  const createReview = useMutation(api.reviews.createReview);
  const [userRating, setUserRating] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const pricingStyle = pricingVariants[tool.pricing];
  const averageRating = tool.averageRating ?? 0;
  const totalReviews = tool.totalReviews ?? 0;

  const handleRatingChange = async (rating: number) => {
    if (!user) {
      toast.error(
        language === "en"
          ? "You must be logged in to rate this tool."
          : "Bạn cần đăng nhập để đánh giá công cụ này."
      );
      return;
    }

    try {
      await createReview({
        toolId: tool._id,
        rating,
        reviewText: undefined,
      });
      setUserRating(rating);
      toast.success(
        language === "en"
          ? "Rating submitted successfully!"
          : "Đánh giá đã được gửi thành công!"
      );
    } catch (error: any) {
      if (error.message?.includes("already reviewed")) {
        toast.error(
          language === "en"
            ? "You have already rated this tool."
            : "Bạn đã đánh giá công cụ này rồi."
        );
      } else {
        toast.error(
          language === "en"
            ? "Failed to submit rating."
            : "Không thể gửi đánh giá."
        );
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-w-2xl mx-auto p-6 rounded-2xl shadow-xl max-h-[90vh]">
        <motion.div
          variants={drawerVariants as any}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full space-y-6 overflow-y-auto"
        >
          <motion.div variants={itemVariants as any}>
            <DrawerHeader className="px-0 space-y-2.5">
              <div className="flex items-center gap-4">
                {tool.logoUrl ? (
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    className="h-16 w-16 rounded-xl border-2 object-cover shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center rounded-xl border-2 bg-gradient-to-br from-muted to-muted/50 text-3xl shadow-md">
                    🤖
                  </div>
                )}
                <div className="flex-1">
                  <DrawerTitle className="text-2xl font-semibold tracking-tight">
                    {tool.name}
                  </DrawerTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-semibold", pricingStyle.badge)}
                    >
                      {pricingStyle.icon} {pricingLabels[language][tool.pricing]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </DrawerHeader>
          </motion.div>

          <motion.div variants={itemVariants as any} className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                {language === "en" ? "Description" : "Mô tả"}
              </h3>
              <DrawerDescription className="text-base leading-relaxed text-foreground">
                {tool.description}
              </DrawerDescription>
            </div>

            {/* Detail */}
            {tool.detail && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  {language === "en" ? "Details" : "Chi tiết"}
                </h3>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {tool.detail}
                </p>
              </div>
            )}

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  {language === "en" ? "Tags" : "Thẻ"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {language === "en" ? "Rating" : "Đánh giá"}
              </h3>
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <StarRating
                  rating={userRating ?? averageRating}
                  size={32}
                  showCount
                  totalReviews={totalReviews}
                  isEditable={!!user}
                  onRatingChange={handleRatingChange}
                />
                {totalReviews === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "No reviews yet" : "Chưa có đánh giá"}
                  </p>
                )}
                {user && (
                  <p className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "Click stars to rate this tool"
                      : "Nhấp vào sao để đánh giá công cụ này"}
                  </p>
                )}
                {!user && (
                  <p className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "Login to rate this tool"
                      : "Đăng nhập để đánh giá công cụ này"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <DrawerFooter className="flex flex-col gap-3 px-0">
              <Button
                asChild
                className="w-full h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {language === "en" ? "Visit Website" : "Truy cập trang web"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl transition-colors"
                >
                  {language === "en" ? "Close" : "Đóng"}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
