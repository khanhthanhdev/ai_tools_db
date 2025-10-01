import { Input } from "./ui/input";
import { Search, X, Sparkles, Filter, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import useDebounce from "@/hooks/use-debounce";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPricing: string;
  onPricingChange: (pricing: string) => void;
  language: "en" | "vi";
  translations: any;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  },
} as const;

export function SearchBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  language,
  translations: t,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const pricingOptions = [
    { value: "", label: t.all, icon: "🌟", color: "default" as const },
    { value: "free", label: t.free, icon: "🆓", color: "success" as const },
    { value: "freemium", label: t.freemium, icon: "⭐", color: "warning" as const },
    { value: "paid", label: t.paid, icon: "💎", color: "secondary" as const },
  ];

  useEffect(() => {
    setShowSuggestions(isFocused && searchTerm.length === 0);
  }, [isFocused, searchTerm]);

  const hasActiveFilters = selectedCategory || selectedPricing;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Search Label */}
        <label
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block"
          htmlFor="search-tools"
        >
          {language === "en" ? "Search AI Tools" : "Tìm kiếm công cụ AI"}
        </label>

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <AnimatePresence mode="wait">
              {searchTerm.length > 0 ? (
                <motion.div
                  key="sparkles"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Input
            id="search-tools"
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-12 pr-12 h-14 text-base shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-lg"
            autoComplete="off"
          />

          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search Results Count Indicator */}
          <AnimatePresence>
            {debouncedSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-6 left-0 text-xs text-muted-foreground"
              >
                {language === "en" ? "Searching..." : "Đang tìm kiếm..."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Filters & Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border rounded-lg shadow-lg z-50"
              variants={ANIMATION_VARIANTS.container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="space-y-4">
                {/* Pricing Quick Filters */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {t.pricing}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pricingOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={selectedPricing === option.value ? option.color : "outline"}
                        className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 hover:shadow-sm"
                        onClick={() => {
                          onPricingChange(option.value);
                          setIsFocused(false);
                        }}
                      >
                        <span className="mr-1">{option.icon}</span>
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        ESC
                      </kbd>
                      {language === "en" ? "to close" : "để đóng"}
                    </span>
                    <span>
                      {language === "en" ? "Start typing to search" : "Bắt đầu nhập để tìm kiếm"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Indicator */}
        <AnimatePresence>
          {hasActiveFilters && !isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {selectedCategory && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-all hover:bg-secondary/80"
                  onClick={() => onCategoryChange("")}
                >
                  {selectedCategory}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              {selectedPricing && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-all hover:bg-secondary/80"
                  onClick={() => onPricingChange("")}
                >
                  {pricingOptions.find(p => p.value === selectedPricing)?.icon}{" "}
                  {pricingOptions.find(p => p.value === selectedPricing)?.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCategoryChange("");
                  onPricingChange("");
                }}
                className="h-6 px-2 text-xs"
              >
                {language === "en" ? "Clear all" : "Xóa tất cả"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
