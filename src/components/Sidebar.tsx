import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPricing: string;
  onPricingChange: (pricing: string) => void;
  language: "en" | "vi";
  translations: any;
}

export function Sidebar({
  isOpen,
  onClose: _onClose,
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  language,
  translations: t,
}: SidebarProps) {
  const categories = useQuery(api.aiTools.getCategories, { language }) || [];

  const pricingOptions = [
    { value: "free", label: t.free, icon: "🆓" },
    { value: "paid", label: t.paid, icon: "💎" },
    { value: "freemium", label: t.freemium, icon: "⭐" },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-30 w-72 h-[calc(100vh-4rem)] bg-background border-r
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Pricing Section */}
          <div className="mb-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-3 px-2">
              {t.pricing}
            </h3>
            <div className="space-y-1">
              <Button
                variant={selectedPricing === "" ? "secondary" : "ghost"}
                onClick={() => onPricingChange("")}
                className="w-full justify-start text-sm h-8"
              >
                <span className="mr-2">🌟</span>
                {t.all}
              </Button>
              {pricingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPricing === option.value ? "secondary" : "ghost"}
                  onClick={() => onPricingChange(option.value)}
                  className="w-full justify-start text-sm h-8"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Categories Section */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3 px-2">
              {t.categories}
            </h3>
            <div className="space-y-1">
              <Button
                variant={selectedCategory === "" ? "secondary" : "ghost"}
                onClick={() => onCategoryChange("")}
                className="w-full justify-start text-sm h-8"
              >
                <span className="mr-2">📂</span>
                {t.all}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  onClick={() => onCategoryChange(category)}
                  className="w-full justify-start text-sm h-8"
                >
                  <span className="mr-2">🔧</span>
                  <span className="truncate">{category}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
