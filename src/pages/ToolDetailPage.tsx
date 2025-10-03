import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ToolCard } from "../components/ToolCard";
import { Skeleton } from "../components/ui/skeleton";
import { ReviewsSection } from "../components/ReviewsSection";
import { MainLayout } from "@/components/MainLayout";

export function ToolDetailPage() {
  const { toolId } = useParams<{ toolId: Id<"aiTools"> }>();
  const tool = useQuery(api.aiTools.getToolById, { toolId: toolId! });

  return (
    <MainLayout>
      {tool === undefined && <Skeleton className="w-full h-64" />}
      {tool === null && <div>Tool not found</div>}
      {tool && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ToolCard tool={tool} language="en" />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{tool.name}</h1>
            <p className="text-muted-foreground mb-6">{tool.description}</p>
            <ReviewsSection toolId={tool._id} />
          </div>
        </div>
      )}
    </MainLayout>
  );
}