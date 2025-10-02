import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Badge } from "./ui/badge";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CategoryFilterMobileProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPricing: string;
  onPricingChange: (pricing: string) => void;
  language: "en" | "vi";
  translations: any;
}

export function CategoryFilterMobile({
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  language,
  translations: t,
}: CategoryFilterMobileProps) {
  const categories = useQuery(api.aiTools.getCategories, { language }) || [];

  const pricingOptions = [
    { value: "", label: t.all, icon: "🌟" },
    { value: "free", label: t.free, icon: "🆓" },
    { value: "freemium", label: t.freemium, icon: "⭐" },
    { value: "paid", label: t.paid, icon: "💎" },
  ];

  return (
    <div className="space-y-4 lg:hidden">
      {/* Pricing Filter */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          {t.pricing}
        </h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {pricingOptions.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge
                  variant={selectedPricing === option.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 whitespace-nowrap",
                    selectedPricing === option.value && "shadow-md"
                  )}
                  onClick={() => onPricingChange(option.value)}
                >
                  <span className="mr-1.5">{option.icon}</span>
                  {option.label}
                </Badge>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Categories Filter */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          {t.categories}
        </h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Badge
                variant={selectedCategory === "" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 whitespace-nowrap",
                  selectedCategory === "" && "shadow-md"
                )}
                onClick={() => onCategoryChange("")}
              >
                <span className="mr-1.5">📂</span>
                {t.all}
              </Badge>
            </motion.div>
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 1) * 0.05 }}
              >
                <Badge
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 whitespace-nowrap",
                    selectedCategory === category && "shadow-md"
                  )}
                  onClick={() => onCategoryChange(category)}
                >
                  <span className="mr-1.5">🔧</span>
                  {category}
                </Badge>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
