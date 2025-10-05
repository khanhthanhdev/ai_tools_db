import { useState } from "react";
import { ToolsList } from "../components/ToolsList";
import { SearchBar } from "../components/SearchBar";
import { SemanticSearchBar } from "../components/SemanticSearchBar";
import { CategoryFilterMobile } from "../components/CategoryFilterMobile";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Star, Rocket, Brain, Code, Palette, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "en" | "vi";
type SearchMode = "keyword" | "semantic";

const translations = {
  en: {
    title: "AI Tools Database",
    subtitle: "Discover and share the best AI tools",
    search: "Search AI tools...",
    categories: "Categories",
    pricing: "Pricing",
    all: "All",
    free: "Free",
    freemium: "Freemium",
    paid: "Paid",
    searchMode: "Search Mode",
    keywordSearch: "Keyword",
    semanticSearch: "Semantic",
    keywordDesc: "Traditional search",
    semanticDesc: "Natural language",
  },
  vi: {
    title: "Cơ sở dữ liệu công cụ AI",
    subtitle: "Khám phá và chia sẻ các công cụ AI tốt nhất",
    search: "Tìm kiếm công cụ AI...",
    categories: "Danh mục",
    pricing: "Giá cả",
    all: "Tất cả",
    free: "Miễn phí",
    freemium: "Freemium",
    paid: "Trả phí",
    searchMode: "Chế độ tìm kiếm",
    keywordSearch: "Từ khóa",
    semanticSearch: "Ngữ nghĩa",
    keywordDesc: "Tìm kiếm truyền thống",
    semanticDesc: "Ngôn ngữ tự nhiên",
  },
};

export function BrowsePage({ language }: { language: Language }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword");

  const t = translations[language];

  return (
    <div className="relative flex">
      {/* Sidebar - Fixed space on the left (desktop only) */}
      <Sidebar
        isOpen={false}
        onClose={() => {}}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPricing={selectedPricing}
        onPricingChange={setSelectedPricing}
        language={language}
        translations={t}
        variant="desktop"
      />
      
      {/* Main Content Area - Centered in remaining space */}
      <div className="flex-1 w-full lg:ml-64">
        {/* Hero Section with decorative elements */}
        <div className="relative mb-8 sm:mb-12 text-center overflow-hidden">
        {/* Floating Icons and Shapes */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {/* Sparkles Icon - Top Left */}
          <motion.div
            className="absolute left-[5%] top-[10%]"
            initial={{ opacity: 0, y: -50, rotate: -45 }}
            animate={{
              opacity: [0, 1, 1, 0.6],
              y: [0, 20, 0],
              rotate: [-45, 0, -45],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0.2,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-8 w-8 text-yellow-500/60" />
          </motion.div>

          {/* Brain Icon - Top Right */}
          <motion.div
            className="absolute right-[8%] top-[15%]"
            initial={{ opacity: 0, scale: 0, rotate: 45 }}
            animate={{
              opacity: [0, 1, 1, 0.7],
              scale: [0.8, 1.2, 1],
              rotate: [45, 0, 45],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 0.4,
              ease: "easeInOut",
            }}
          >
            <Brain className="h-10 w-10 text-purple-500/50" />
          </motion.div>

          {/* Zap Icon - Middle Left */}
          <motion.div
            className="absolute left-[10%] top-[45%]"
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0.5],
              x: [-50, 0, 10, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 0.8,
              ease: "easeInOut",
            }}
          >
            <Zap className="h-7 w-7 text-blue-500/60" />
          </motion.div>

          {/* Rocket Icon - Middle Right */}
          <motion.div
            className="absolute right-[12%] top-[50%]"
            initial={{ opacity: 0, y: 50, rotate: 45 }}
            animate={{
              opacity: [0, 1, 1, 0.6],
              y: [50, -20, 0],
              rotate: [45, -15, 45],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut",
            }}
          >
            <Rocket className="h-9 w-9 text-pink-500/50" />
          </motion.div>

          {/* Star Icon - Bottom Left */}
          <motion.div
            className="absolute left-[15%] bottom-[20%]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0.8, 0.5],
              scale: [0, 1.5, 1, 1.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              delay: 0.6,
              ease: "easeInOut",
            }}
          >
            <Star className="h-6 w-6 text-amber-500/60 fill-amber-500/30" />
          </motion.div>

          {/* Code Icon - Bottom Right */}
          <motion.div
            className="absolute right-[10%] bottom-[25%]"
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0.6],
              x: [50, -10, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut",
            }}
          >
            <Code className="h-8 w-8 text-green-500/50" />
          </motion.div>

          {/* Palette Icon - Top Center */}
          <motion.div
            className="absolute left-[48%] top-[5%]"
            initial={{ opacity: 0, y: -30, rotate: -30 }}
            animate={{
              opacity: [0, 0.7, 0.7, 0.4],
              y: [-30, 10, 0],
              rotate: [-30, 15, -30],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              delay: 0.3,
              ease: "easeInOut",
            }}
          >
            <Palette className="h-7 w-7 text-rose-500/50" />
          </motion.div>

          {/* Geometric Shapes */}
          {/* Circle Shape */}
          <motion.div
            className="absolute right-[20%] top-[20%] h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0.3],
              scale: [0, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0.7,
              ease: "easeInOut",
            }}
          />

          {/* Square Shape */}
          <motion.div
            className="absolute left-[20%] bottom-[30%] h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20"
            initial={{ opacity: 0, rotate: 45 }}
            animate={{
              opacity: [0, 0.5, 0.5, 0.2],
              rotate: [45, 90, 135],
              scale: [0.8, 1.1, 0.9],
            }}
            transition={{
              duration: 13,
              repeat: Infinity,
              delay: 0.9,
              ease: "easeInOut",
            }}
          />

          {/* Triangle Shape */}
          <motion.div
            className="absolute left-[35%] top-[25%]"
            initial={{ opacity: 0, y: -40, rotate: 0 }}
            animate={{
              opacity: [0, 0.4, 0.4, 0.2],
              y: [-40, 10, 0],
              rotate: [0, 120, 240, 360],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              delay: 1.2,
              ease: "easeInOut",
            }}
          >
            <div className="h-0 w-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-teal-500/20" />
          </motion.div>
        </div>

        {/* Hero Content */}
        <motion.h1
          className="relative mb-2 sm:mb-3 text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1,
          }}
        >
          {t.title}
        </motion.h1>
        <motion.p
          className="relative mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg text-muted-foreground px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
        >
          {t.subtitle}
        </motion.p>
      </div>

      <motion.div
        className="mb-8 container max-w-7xl px-3 sm:px-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.6,
        }}
      >
        {/* Search Mode Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t.searchMode}:
          </span>
          <div className="flex gap-2">
            <Button
              variant={searchMode === "keyword" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("keyword")}
              className={cn(
                "gap-2 transition-all",
                searchMode === "keyword" && "shadow-md"
              )}
            >
              <Search className="h-4 w-4" />
              <span>{t.keywordSearch}</span>
            </Button>
            <Button
              variant={searchMode === "semantic" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("semantic")}
              className={cn(
                "gap-2 transition-all",
                searchMode === "semantic" && "bg-purple-600 hover:bg-purple-700 shadow-md"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>{t.semanticSearch}</span>
            </Button>
          </div>
        </div>

        {/* Search Bar - Conditional Rendering with Animation */}
        <AnimatePresence mode="wait">
          {searchMode === "keyword" ? (
            <motion.div
              key="keyword-search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedPricing={selectedPricing}
                onPricingChange={setSelectedPricing}
                language={language}
                translations={t}
              />
            </motion.div>
          ) : (
            <motion.div
              key="semantic-search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SemanticSearchBar
                language={language}
                category={selectedCategory}
                pricing={selectedPricing as "free" | "freemium" | "paid" | undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Category Filter - Horizontal scrolling below search (keyword mode only) */}
      {searchMode === "keyword" && (
        <motion.div
          className="mb-8 container max-w-7xl px-3 sm:px-6 lg:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.7,
          }}
        >
          <CategoryFilterMobile
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPricing={selectedPricing}
            onPricingChange={setSelectedPricing}
            language={language}
            translations={t}
          />
        </motion.div>
      )}

      {/* Main Content with Tools List (keyword mode only) */}
      {searchMode === "keyword" && (
        <main className="min-h-[calc(100vh-8rem)]">
          <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
            <ToolsList
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedPricing={selectedPricing}
              language={language}
            />
          </div>
        </main>
      )}
      </div>
    </div>
  );
}