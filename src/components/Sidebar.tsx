import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

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
  const categories = useQuery(api.aiTools.getCategories, { language }) || [];

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
            className="h-9 w-full justify-start text-sm font-medium"
          >
            <span className="mr-2">🌟</span>
            {t.all}
          </Button>
          {pricingOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPricing === option.value ? "secondary" : "ghost"}
              onClick={() => handlePricingSelect(option.value)}
              className="h-9 w-full justify-start text-sm font-medium"
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
            className="h-9 w-full justify-start text-sm font-medium"
          >
            <span className="mr-2">📂</span>
            {t.all}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              onClick={() => handleCategorySelect(category)}
              className="h-9 w-full justify-start text-sm font-medium"
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
    <aside
      className={cn(
        "hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="h-full overflow-y-auto p-6">
        {content}
      </div>
    </aside>
  );
}
