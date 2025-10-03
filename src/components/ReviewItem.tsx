import { Doc } from "../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { StarRating } from "./ui/star-rating";
import { Button } from "./ui/button";
import { ThumbsUp } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewItemProps {
  review: Doc<"reviews"> & { author: Doc<"users"> | null };
}

export function ReviewItem({ review }: ReviewItemProps) {
  const { userId } = useAuth();
  const toggleVote = useMutation(api.reviews.toggleReviewVote);
  const hasVoted = useQuery(api.reviews.hasUserVotedReview, { reviewId: review._id });

  const handleHelpfulClick = async () => {
    if (!userId) {
      toast.error("You must be logged in to vote.");
      return;
    }
    try {
      await toggleVote({ reviewId: review._id });
    } catch (error) {
      toast.error("Failed to vote.");
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b">
      <Avatar>
        <AvatarImage src={review.author?.imageUrl} />
        <AvatarFallback>
          {review.author?.fullName?.charAt(0) ?? "A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{review.author?.fullName ?? "Anonymous"}</span>
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