import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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
  onClose,
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  language,
  translations: t,
}: SidebarProps) {
  const categories = useQuery(api.aiTools.getCategories, { language }) || [];

  const pricingOptions = [
    { value: "free", label: t.free, icon: "🆓", color: "text-emerald-600" },
    { value: "paid", label: t.paid, icon: "💎", color: "text-blue-600" },
    { value: "freemium", label: t.freemium, icon: "⭐", color: "text-amber-600" },
  ];

  const categoryIcons: Record<string, string> = {
    "Writing & Content": "✍️",
    "Image Generation": "🎨",
    "Code & Development": "💻",
    "Video & Audio": "🎬",
    "Business & Productivity": "📊",
    "Data & Analytics": "📈",
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-20 left-0 z-30 w-80 h-[calc(100vh-5rem)] bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-80
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full overflow-y-auto">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-10 lg:hidden">
            <h3 className="text-2xl font-bold text-gray-900">Filters</h3>
            <button
              onClick={onClose}
              className="p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Pricing Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-900">
                {t.pricing}
              </h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onPricingChange("")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPricing === ""
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌟</span>
                  <span>{t.all}</span>
                </div>
              </button>
              {pricingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onPricingChange(option.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedPricing === option.value
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-900">
                {t.categories}
              </h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange("")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === ""
                    ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-2 border-purple-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📂</span>
                  <span>{t.all}</span>
                </div>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-2 border-purple-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{categoryIcons[category] || "🔧"}</span>
                    <span className="truncate">{category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
