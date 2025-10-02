import { Input } from "./ui/input";
import { Search, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import useDebounce from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

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
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  },
  badge: {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15,
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

  const pricingOptions = [
    { value: "", label: t.all, icon: "🌟" },
    { value: "free", label: t.free, icon: "🆓" },
    { value: "freemium", label: t.freemium, icon: "⭐" },
    { value: "paid", label: t.paid, icon: "💎" },
  ];

  const hasActiveFilters = selectedCategory || selectedPricing;
  const showSuggestions = isFocused && searchTerm.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Container */}
      <div className="relative">
        {/* Search Input with Gradient Border Effect */}
        <div className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused 
            ? "shadow-2xl shadow-primary/20" 
            : "shadow-lg"
        )}>
          {/* Gradient Background Glow */}
          <div className={cn(
            "absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300",
            isFocused && "opacity-20"
          )} />
          
          {/* Search Input Container */}
          <div className="relative bg-background rounded-2xl border">
            <div className="flex items-center gap-3 p-2">
              {/* Clickable Icon */}
              <button
                type="button"
                className="pl-3 pr-1 cursor-pointer transition-all hover:scale-110 active:scale-95"
                onClick={() => document.getElementById("search-tools")?.focus()}
                aria-label="Focus search"
              >
                <AnimatePresence mode="wait">
                  {searchTerm.length > 0 ? (
                    <motion.div
                      key="sparkles"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Input */}
              <Input
                id="search-tools"
                type="text"
                placeholder={language === "en" ? "Search amazing AI tools..." : "Tìm kiếm công cụ AI tuyệt vời..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
                autoComplete="off"
              />

              {/* Clear Button */}
              {searchTerm && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="pr-2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSearchChange("")}
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              className="mt-4 overflow-hidden rounded-xl border bg-card shadow-lg"
              variants={ANIMATION_VARIANTS.container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="p-6 space-y-5">
                {/* Popular Searches */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {language === "en" ? "Popular Searches" : "Tìm kiếm phổ biến"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["ChatGPT", "Midjourney", "Notion AI", "Stable Diffusion", "Claude"].map((term) => (
                      <motion.div
                        key={term}
                        variants={ANIMATION_VARIANTS.badge}
                        initial="hidden"
                        animate="show"
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 hover:bg-secondary/80"
                          onClick={() => {
                            onSearchChange(term);
                            setIsFocused(false);
                          }}
                        >
                          <Search className="h-3 w-3 mr-1.5" />
                          {term}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Filters - Pricing */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {t.pricing}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pricingOptions.map((option) => (
                      <motion.div
                        key={option.value}
                        variants={ANIMATION_VARIANTS.badge}
                        initial="hidden"
                        animate="show"
                      >
                        <Badge
                          variant={selectedPricing === option.value ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                            selectedPricing === option.value && "shadow-md"
                          )}
                          onClick={() => {
                            onPricingChange(option.value);
                            setIsFocused(false);
                          }}
                        >
                          <span className="mr-1.5">{option.icon}</span>
                          {option.label}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-2 py-1 rounded bg-muted font-mono text-[10px]">ESC</kbd>
                      {language === "en" ? "to close" : "để đóng"}
                    </span>
                    <span>
                      {language === "en" ? "Start typing to search" : "Nhập để tìm kiếm"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Chips */}
        <AnimatePresence>
          {hasActiveFilters && !showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">
                {language === "en" ? "Active filters:" : "Bộ lọc đang dùng:"}
              </span>
              
              {selectedCategory && (
                <motion.div variants={ANIMATION_VARIANTS.badge}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 transition-all hover:bg-secondary/80"
                    onClick={() => onCategoryChange("")}
                  >
                    {selectedCategory}
                    <X className="h-3 w-3" />
                  </Badge>
                </motion.div>
              )}
              
              {selectedPricing && (
                <motion.div variants={ANIMATION_VARIANTS.badge}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 transition-all hover:bg-secondary/80"
                    onClick={() => onPricingChange("")}
                  >
                    {pricingOptions.find(p => p.value === selectedPricing)?.icon}
                    {pricingOptions.find(p => p.value === selectedPricing)?.label}
                    <X className="h-3 w-3" />
                  </Badge>
                </motion.div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCategoryChange("");
                  onPricingChange("");
                }}
                className="h-7 text-xs"
              >
                {language === "en" ? "Clear all" : "Xóa tất cả"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Status */}
        <AnimatePresence>
          {debouncedSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center"
            >
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-pulse">●</span>
                {language === "en" ? "Searching..." : "Đang tìm kiếm..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
