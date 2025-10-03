import { useState } from 'react';
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
  totalReviews?: number;
  onRatingChange?: (rating: number) => void;
  isEditable?: boolean;
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  className,
  showCount = false,
  totalReviews = 0,
  onRatingChange,
  isEditable = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const currentRating = hoverRating > 0 ? hoverRating : rating;

  const fullStars = Math.floor(currentRating);
  const halfStar = !isEditable && currentRating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  const handleMouseOver = (index: number) => {
    if (isEditable) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (isEditable && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, i) => {
        const starIndex = i + 1;
        const isFull = starIndex <= currentRating;

        if (isEditable) {
          return (
            <Star
              key={`star-${i}`}
              size={size}
              className={cn(
                "cursor-pointer transition-colors",
                isFull ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              )}
              onMouseOver={() => handleMouseOver(starIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starIndex)}
            />
          )
        }

        // Display only logic
        return (
          <Star
            key={`full-${i}`}
            size={size}
            className={cn(
              starIndex <= fullStars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
            )}
          />
        )
      })}
      {showCount && (
        <span className="text-xs text-muted-foreground ml-1">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}