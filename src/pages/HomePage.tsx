import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "../SignInForm";
import { SignOutButton } from "../SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ToolsList } from "../components/ToolsList";
import { AddToolForm } from "../components/AddToolForm";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilterMobile } from "../components/CategoryFilterMobile";
import { LanguageToggle } from "../components/LanguageToggle";
import { Sidebar } from "../components/Sidebar";
import { UserToolsManager } from "../components/UserToolsManager";
import { DatabaseStats } from "../components/DatabaseStats";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Sparkles, Zap, Star, Rocket, Brain, Code, Palette } from "lucide-react";
import BeamsBackground from "../components/kokonutui/beams-background";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

type Language = "en" | "vi";
type ActiveTab = "browse" | "add" | "manage" | "stats";

const translations = {
  en: {
    title: "AI Tools Database",
    subtitle: "Discover and share the best AI tools",
    search: "Search AI tools...",
    addTool: "Add Tool",
    browse: "Browse",
    categories: "Categories",
    pricing: "Pricing",
    all: "All",
    free: "Free",
    freemium: "Freemium",
    paid: "Paid",
    signInPrompt: "Sign in to add tools",
    welcome: "Welcome back",
    loadSample: "Load Sample Data",
    myTools: "My Tools",
    stats: "Statistics",
    dataLoaded: "Sample data loaded successfully!",
    dataExists: "Sample data already exists",
    aboutUs: "About Us",
  },
  vi: {
    title: "Cơ sở dữ liệu công cụ AI",
    subtitle: "Khám phá và chia sẻ các công cụ AI tốt nhất",
    search: "Tìm kiếm công cụ AI...",
    addTool: "Thêm công cụ",
    browse: "Duyệt",
    categories: "Danh mục",
    pricing: "Giá cả",
    all: "Tất cả",
    free: "Miễn phí",
    freemium: "Freemium",
    paid: "Trả phí",
    signInPrompt: "Đăng nhập để thêm công cụ",
    welcome: "Chào mừng trở lại",
    loadSample: "Tải dữ liệu mẫu",
    myTools: "Công cụ của tôi",
    stats: "Thống kê",
    dataLoaded: "Đã tải dữ liệu mẫu thành công!",
    dataExists: "Dữ liệu mẫu đã tồn tại",
    aboutUs: "Giới thiệu",
  },
};

export function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<ActiveTab>("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");

  const t = translations[language];

  const renderTabContent = () => {
    switch (activeTab) {
      case "add":
        return (
          <Card className="mx-auto max-w-4xl shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{t.addTool}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Share an amazing AI tool with the community"
                  : "Chia sẻ một công cụ AI tuyệt vời với cộng đồng"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddToolForm language={language} onClose={() => setActiveTab("browse")} />
            </CardContent>
          </Card>
        );
      case "manage":
        return (
          <Card className="mx-auto max-w-7xl shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{t.myTools}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Manage your submitted AI tools"
                  : "Quản lý các công cụ AI bạn đã gửi"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserToolsManager language={language} />
            </CardContent>
          </Card>
        );
      case "stats":
        return (
          <Card className="mx-auto max-w-7xl shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{t.stats}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Database statistics and insights"
                  : "Thống kê và thông tin chi tiết cơ sở dữ liệu"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabaseStats language={language} />
            </CardContent>
          </Card>
        );
      default:
        return (
          <>
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
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.6,
              }}
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

            {/* Mobile Category Filter - Horizontal scrolling below search */}
            <motion.div
              className="mb-8 lg:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

            <ToolsList
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedPricing={selectedPricing}
              language={language}
            />
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Beams Background */}
      <div className="fixed inset-0 -z-10">
        <BeamsBackground intensity="medium" className="h-full w-full" />
      </div>

      <Toaster position="top-right" richColors />

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 sm:h-16 items-center px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold truncate">{t.title}</h1>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            <Button
              onClick={() => setActiveTab("browse")}
              variant={activeTab === "browse" ? "default" : "ghost"}
              size="sm"
            >
              {t.browse}
            </Button>
            <Authenticated>
              <Button
                onClick={() => setActiveTab("add")}
                variant={activeTab === "add" ? "default" : "ghost"}
                size="sm"
              >
                {t.addTool}
              </Button>
              <Button
                onClick={() => setActiveTab("manage")}
                variant={activeTab === "manage" ? "default" : "ghost"}
                size="sm"
              >
                {t.myTools}
              </Button>
              <Button
                onClick={() => setActiveTab("stats")}
                variant={activeTab === "stats" ? "default" : "ghost"}
                size="sm"
              >
                {t.stats}
              </Button>
            </Authenticated>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="px-2 text-xs sm:text-sm"
            >
              <Link to="/about-us">{t.aboutUs}</Link>
            </Button>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-sm text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4">
                    Sign in
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.signInPrompt}</DialogTitle>
                    <DialogDescription>
                      {language === "en"
                        ? "Sign in to add and manage AI tools"
                        : "Đăng nhập để thêm và quản lý công cụ AI"}
                    </DialogDescription>
                  </DialogHeader>
                  <SignInForm />
                </DialogContent>
              </Dialog>
            </Unauthenticated>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation - Only visible on small screens and when authenticated */}
      <Authenticated>
        <div className="sticky top-12 sm:top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <div className="container px-3 sm:px-6">
            <nav className="flex gap-1 justify-center overflow-x-auto py-2 scrollbar-hide">
              <Button
                onClick={() => setActiveTab("browse")}
                variant={activeTab === "browse" ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                📂 {t.browse}
              </Button>
              <Button
                onClick={() => setActiveTab("add")}
                variant={activeTab === "add" ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                ➕ {t.addTool}
              </Button>
              <Button
                onClick={() => setActiveTab("manage")}
                variant={activeTab === "manage" ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                🛠️ {t.myTools}
              </Button>
              <Button
                onClick={() => setActiveTab("stats")}
                variant={activeTab === "stats" ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                📊 {t.stats}
              </Button>
            </nav>
          </div>
        </div>
      </Authenticated>

      <div className="flex flex-col lg:flex-row">
        {activeTab === "browse" && (
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
        )}

        <main className="min-h-[calc(100vh-8rem)] flex-1">
          <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
