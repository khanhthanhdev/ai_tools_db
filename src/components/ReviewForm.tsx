import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { StarRating } from "./ui/star-rating";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ReviewFormProps {
  toolId: Id<"aiTools">;
  existingReview?: Doc<"reviews"> | null;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ toolId, existingReview, onReviewSubmitted }: ReviewFormProps) {
  const { userId } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReview = useMutation(api.reviews.createReview);
  const updateReview = useMutation(api.reviews.updateReview);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText ?? "");
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview({
          reviewId: existingReview._id,
          rating,
          reviewText,
        });
        toast.success("Review updated successfully!");
      } else {
        await createReview({
          toolId,
          rating,
          reviewText,
        });
        toast.success("Review submitted successfully!");
      }
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReview ? "Edit Your Review" : "Write a Review"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Your Rating</label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              isEditable={true}
              size={24}
            />
          </div>
          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-muted-foreground mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onReviewSubmitted}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (existingReview ? "Update Review" : "Submit Review")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}