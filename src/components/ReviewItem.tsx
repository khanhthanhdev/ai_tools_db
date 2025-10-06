import { Doc } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { useConvexMutation } from "@/hooks/useConvexMutation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { StarRating } from "./ui/star-rating";
import { Button } from "./ui/button";
import { ThumbsUp } from "lucide-react";

import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewItemProps {
  review: Doc<"reviews"> & { author: Doc<"users"> | null };
}

export function ReviewItem({ review }: ReviewItemProps) {
  const { data: user } = useConvexQuery(api.auth.loggedInUser, {});
  const toggleVote = useConvexMutation(api.reviews.toggleReviewVote);
  const { data: hasVoted } = useConvexQuery(api.reviews.hasUserVotedReview, { reviewId: review._id });

  const handleHelpfulClick = async () => {
    if (!user) {
      toast.error("You must be logged in to vote.");
      return;
    }
    try {
      await toggleVote.mutateAsync({ reviewId: review._id });
    } catch (error) {
      toast.error("Failed to vote.");
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b">
      <Avatar>
        <AvatarImage src={review.author?.image} />
        <AvatarFallback>
          {review.author?.name?.charAt(0) ?? "A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{review.author?.name ?? "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
          <StarRating rating={review.rating} size={16} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{review.reviewText}</p>
        <div className="flex items-center justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpfulClick}
            className={cn(hasVoted && "text-primary")}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful ({review.helpfulCount ?? 0})
          </Button>
        </div>
      </div>
    </div>
  );
}