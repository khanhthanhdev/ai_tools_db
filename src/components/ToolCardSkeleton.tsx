import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

export function ToolCardSkeleton() {
  return (
    <Card className="w-full h-full min-h-[300px] sm:min-h-[340px] overflow-hidden border-2">
      <CardContent className="flex h-full flex-col !p-4 sm:!p-5 animate-pulse">
        {/* Logo + Name skeleton */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
          <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-8 w-8 rounded-full bg-muted" />
        </div>

        {/* Badges skeleton */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2 sm:mb-2.5">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>

        {/* Description skeleton */}
        <div className="flex-1 mb-2 sm:mb-2.5 space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-4/6" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3 min-h-[24px]">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-6 w-14 bg-muted rounded" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center mb-2 sm:mb-3">
          <div className="h-4 w-32 bg-muted rounded" />
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 h-9 sm:h-10 bg-muted rounded" />
          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolCardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
}
