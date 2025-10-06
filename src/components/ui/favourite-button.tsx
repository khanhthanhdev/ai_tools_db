import { Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useConvexMutation } from "@/hooks/useConvexMutation";
import { queryKeys } from "@/lib/queryKeys";
import { updateCache, rollbackCache, cacheUtils } from "@/lib/cacheInvalidation";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  toolId: Id<"aiTools">;
  className?: string;
  isFavourited?: boolean;
}

export function FavouriteButton({ toolId, className, isFavourited: isFavouritedProp }: FavouriteButtonProps) {
  const { data: user } = useConvexQuery(api.auth.loggedInUser, {});
  const queryClient = useQueryClient();
  
  // Only query if not provided as prop (for backwards compatibility)
  const { data: isFavouritedQuery } = useConvexQuery(
    api.favourites.isFavourited, 
    isFavouritedProp === undefined ? { toolId } : "skip"
  );
  const isFavourited = isFavouritedProp ?? isFavouritedQuery;
  
  // Use TanStack Query mutation with optimistic updates
  const toggleFavourite = useConvexMutation(api.favourites.toggleFavourite, {
    // Optimistic update: immediately update UI before mutation completes
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.favourites.ids() });
      await queryClient.cancelQueries({ queryKey: queryKeys.favourites.isFavourited(variables.toolId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.favourites.list() });
      
      // Snapshot the previous state for rollback
      const previousFavouriteIds = cacheUtils.getCacheState<Id<"aiTools">[]>(
        queryClient,
        queryKeys.favourites.ids()
      );
      const previousIsFavourited = cacheUtils.getCacheState<boolean>(
        queryClient,
        queryKeys.favourites.isFavourited(variables.toolId)
      );
      const previousFavouritesList = cacheUtils.getCacheState<any[]>(
        queryClient,
        queryKeys.favourites.list()
      );
      
      // Determine new state (toggle current state)
      const currentIsFavourited = isFavourited ?? false;
      const newIsFavourited = !currentIsFavourited;
      
      // Optimistically update cache
      updateCache.toggleFavourite(queryClient, variables.toolId, newIsFavourited);
      
      // Return context for rollback
      return {
        previousState: {
          favouriteIds: previousFavouriteIds || [],
          isFavourited: previousIsFavourited ?? false,
          favouritesList: previousFavouritesList,
        },
      };
    },
    
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousState) {
        rollbackCache.favouriteToggle(
          queryClient,
          variables.toolId,
          context.previousState
        );
      }
      toast.error("Failed to update favourites.");
    },
    
    // Show success message and ensure cache is consistent
    onSuccess: (result, variables) => {
      if (result) {
        toast.success("Tool added to favourites.");
      } else {
        toast.info("Tool removed from favourites.");
      }
    },
    
    // Always refetch to ensure consistency with server state
    onSettled: (_data, _error, variables) => {
      // Invalidate queries to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.favourites.ids() });
      queryClient.invalidateQueries({ queryKey: queryKeys.favourites.isFavourited(variables.toolId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.favourites.list() });
    },
  });

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("You must be logged in to favourite a tool.");
      return;
    }

    // Trigger mutation with optimistic update
    toggleFavourite.mutate({ toolId });
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