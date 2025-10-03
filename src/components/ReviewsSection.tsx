import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ReviewItem } from "@/components/ReviewItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/clerk-react";
import { ReviewForm } from "@/components/ReviewForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewsSectionProps {
  toolId: Id<"aiTools">;
}

type SortByType = "recent" | "helpful";

export function ReviewsSection({ toolId }: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<SortByType>("recent");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isSignedIn } = useAuth();
  const userReview = useQuery(api.reviews.getUserReviewForTool, { toolId });

  const {
    results: reviews,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.reviews.getToolReviews,
    { toolId, sortBy },
    { initialNumItems: 5 }
  );

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <Select value={sortBy} onValueChange={(value: SortByType) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isSignedIn && (
        <div className="mt-4">
          {showReviewForm ? (
            <ReviewForm
              toolId={toolId}
              existingReview={userReview}
              onReviewSubmitted={handleReviewSubmitted}
            />
          ) : (
            <Button onClick={() => setShowReviewForm(true)}>
              {userReview ? "Edit Your Review" : "Write a Review"}
            </Button>
          )}
        </div>
      )}

      {status === "loading" && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {status !== "loading" && reviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reviews yet. Be the first to write one!</p>
        </div>
      )}

      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>

      {status === "CanLoadMore" && (
        <div className="text-center">
          <Button onClick={() => loadMore(5)}>Load More</Button>
        </div>
      )}
    </div>
  );
}