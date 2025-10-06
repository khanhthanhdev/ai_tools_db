import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { useConvexInfiniteQuery } from "@/hooks/useConvexInfiniteQuery";
import { Id } from "../../convex/_generated/dataModel";
import { ReviewItem } from "@/components/ReviewItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: user } = useConvexQuery(api.auth.loggedInUser, {});
  const { data: userReview } = useConvexQuery(api.reviews.getUserReviewForTool, { toolId });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useConvexInfiniteQuery(
    api.reviews.getToolReviews,
    (pageParam) => ({
      toolId,
      sortBy,
      paginationOpts: {
        numItems: 5,
        cursor: pageParam as string | undefined,
      },
    }),
    {
      initialPageParam: null,
      getNextPageParam: (lastPage: any) => {
        if (lastPage?.isDone || !lastPage?.nextCursor) {
          return undefined;
        }
        return lastPage.nextCursor;
      },
    }
  );

  const reviews = data?.pages.flatMap(page => page.page) ?? [];

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

      {user && (
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

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reviews yet. Be the first to write one!</p>
        </div>
      )}

      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>

      {hasNextPage && (
        <div className="text-center">
          <Button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}