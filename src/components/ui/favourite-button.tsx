import { Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  toolId: Id<"aiTools">;
  className?: string;
}

export function FavouriteButton({ toolId, className }: FavouriteButtonProps) {
  const { userId } = useAuth();
  const isFavourited = useQuery(api.favourites.isFavourited, { toolId });
  const toggleFavourite = useMutation(api.favourites.toggleFavourite);

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
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
    } catch (error) {
      toast.error("Failed to update favourites.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("absolute top-2 right-2 z-10", className)}
      onClick={handleFavouriteClick}
    >
      <Heart
        className={cn(
          "h-5 w-5 text-gray-500 transition-colors duration-200",
          isFavourited && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
}