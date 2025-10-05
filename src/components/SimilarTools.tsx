import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { Skeleton } from "./ui/skeleton";
import { translations } from "@/translations";

interface SimilarToolsProps {
  toolId: Id<"aiTools">;
  language: "en" | "vi";
}

export function SimilarTools({ toolId, language }: SimilarToolsProps) {
  const similarTools = useQuery(api.aiTools.getSimilarTools, { 
    toolId, 
    limit: 5 
  });

  const t = translations[language];

  // Loading state
  if (similarTools === undefined) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          {t.similarTools}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </section>
    );
  }

  // Hide section if no similar tools found or no embeddings
  if (!similarTools || similarTools.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        {t.similarTools}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {similarTools.map((tool) => (
          <ToolCard
            key={tool._id}
            tool={tool}
            language={language}
            showScore={true}
          />
        ))}
      </div>
    </section>
  );
}
