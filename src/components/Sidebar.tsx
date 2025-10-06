import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useConvexQuery } from "@/hooks/useConvexQuery";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPricing: string;
  onPricingChange: (pricing: string) => void;
  language: "en" | "vi";
  translations: any;
  variant?: "desktop" | "mobile";
  className?: string;
}

export function Sidebar({
  isOpen: _isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  language,
  translations: t,
  variant = "desktop",
  className,
}: SidebarProps) {
  const { data: categories = [] } = useConvexQuery(
    api.aiTools.getCategories,
    { language },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change frequently
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    }
  );

  const pricingOptions = [
    { value: "free", label: t.free, icon: "🆓" },
    { value: "paid", label: t.paid, icon: "💎" },
    { value: "freemium", label: t.freemium, icon: "⭐" },
  ];

  const handlePricingSelect = (value: string) => {
    onPricingChange(value);
    if (variant === "mobile") {
      onClose?.();
    }
  };

  const handleCategorySelect = (value: string) => {
    onCategoryChange(value);
    if (variant === "mobile") {
      onClose?.();
    }
  };

  const content = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t.pricing}
        </h3>
        <div className="space-y-1">
          <Button
            variant={selectedPricing === "" ? "secondary" : "ghost"}
            onClick={() => handlePricingSelect("")}
            className="h-9 w-full !justify-start text-left text-sm font-medium"
          >
            <span className="mr-2">🌟</span>
            {t.all}
          </Button>
          {pricingOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPricing === option.value ? "secondary" : "ghost"}
              onClick={() => handlePricingSelect(option.value)}
              className="h-9 w-full !justify-start text-left text-sm font-medium"
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t.categories}
        </h3>
        <div className="space-y-1">
          <Button
            variant={selectedCategory === "" ? "secondary" : "ghost"}
            onClick={() => handleCategorySelect("")}
            className="h-9 w-full !justify-start text-left text-sm font-medium"
          >
            <span className="mr-2">📂</span>
            {t.all}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              onClick={() => handleCategorySelect(category)}
              className="h-9 w-full !justify-start text-left text-sm font-medium"
            >
              <span className="mr-2">🔧</span>
              <span className="truncate">{category}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-8", className)}>
        {content}
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.4 }
      }}
      className={cn(
        "hidden lg:block fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-64 z-40 overflow-hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg",
        className,
      )}
    >
      <div className="h-full overflow-y-auto p-6">
        {content}
      </div>
    </motion.aside>
  );
}
