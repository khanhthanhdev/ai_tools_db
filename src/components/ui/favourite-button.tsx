import { Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  toolId: Id<"aiTools">;
  className?: string;
}

export function FavouriteButton({ toolId, className }: FavouriteButtonProps) {
  const user = useQuery(api.auth.loggedInUser);
  const isFavourited = useQuery(api.favourites.isFavourited, { toolId });
  const toggleFavourite = useMutation(api.favourites.toggleFavourite);

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("You must be logged in to favourite a tool.");
      return;
    }

    try {
      const result = await toggleFavourite({ toolId });
      if (result) {
        toast.success("Tool added to favourites.");
      } else {
        toast.info("Tool removed from favourites.");
      }
    } catch {
      toast.error("Failed to update favourites.");
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "absolute top-2 right-2 z-10",
        "inline-flex items-center justify-center",
        "h-10 w-10 rounded-md",
        "text-sm font-medium",
        "transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => { void handleFavouriteClick(e); }}
    >
      <Heart
        className={cn(
          "h-5 w-5 text-gray-500 transition-colors duration-200",
          isFavourited && "fill-red-500 text-red-500"
        )}
      />
    </button>
  );
}