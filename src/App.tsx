import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ToolsList } from "./components/ToolsList";
import { AddToolForm } from "./components/AddToolForm";
import { SearchBar } from "./components/SearchBar";
import { LanguageToggle } from "./components/LanguageToggle";
import { Sidebar } from "./components/Sidebar";
import { UserToolsManager } from "./components/UserToolsManager";
import { DatabaseStats } from "./components/DatabaseStats";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { SlidersHorizontal, Sparkles, Zap, Star, Rocket, Brain, Code, Palette } from "lucide-react";
import BeamsBackground from "./components/kokonutui/beams-background";
import { motion } from "motion/react";

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
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<ActiveTab>("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];

  const loadSampleData = useMutation(api.sampleData.seedSampleData);

  const handleLoadSampleData = async () => {
    try {
      void await loadSampleData();
    } catch (error) {
      console.error("Error loading sample data:", error);
    }
  };

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
            <div className="relative mb-12 text-center overflow-hidden">
              {/* Floating Icons and Shapes */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Sparkles Icon - Top Left */}
                <motion.div
                  className="absolute left-[5%] top-[10%]"
                  initial={{ opacity: 0, y: -50, rotate: -45 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0.6],
                    y: [0, 20, 0],
                    rotate: [-45, 0, -45]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeInOut"
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
                    y: [0, -15, 0]
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeInOut"
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
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    delay: 0.8,
                    ease: "easeInOut"
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
                    rotate: [45, -15, 45]
                  }}
                  transition={{ 
                    duration: 9,
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeInOut"
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
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 12,
                    repeat: Infinity,
                    delay: 0.6,
                    ease: "easeInOut"
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
                    y: [0, 15, 0]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    delay: 1,
                    ease: "easeInOut"
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
                    rotate: [-30, 15, -30]
                  }}
                  transition={{ 
                    duration: 11,
                    repeat: Infinity,
                    delay: 0.3,
                    ease: "easeInOut"
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
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 15,
                    repeat: Infinity,
                    delay: 0.7,
                    ease: "easeInOut"
                  }}
                />

                {/* Square Shape */}
                <motion.div
                  className="absolute left-[20%] bottom-[30%] h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20"
                  initial={{ opacity: 0, rotate: 45 }}
                  animate={{ 
                    opacity: [0, 0.5, 0.5, 0.2],
                    rotate: [45, 90, 135],
                    scale: [0.8, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 13,
                    repeat: Infinity,
                    delay: 0.9,
                    ease: "easeInOut"
                  }}
                />

                {/* Triangle Shape */}
                <motion.div
                  className="absolute left-[35%] top-[25%]"
                  initial={{ opacity: 0, y: -40, rotate: 0 }}
                  animate={{ 
                    opacity: [0, 0.4, 0.4, 0.2],
                    y: [-40, 10, 0],
                    rotate: [0, 120, 240, 360]
                  }}
                  transition={{ 
                    duration: 14,
                    repeat: Infinity,
                    delay: 1.2,
                    ease: "easeInOut"
                  }}
                >
                  <div className="h-0 w-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-teal-500/20" />
                </motion.div>
              </div>

              {/* Hero Content */}
              <motion.h1 
                className="relative mb-3 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1
                }}
              >
                {t.title}
              </motion.h1>
              <motion.p 
                className="relative mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.3
                }}
              >
                {t.subtitle}
              </motion.p>
                
              <Unauthenticated>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.5
                  }}
                >
                  <Card className="sign-in-form mx-auto mb-12 max-w-md shadow-sm">
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-lg">{t.signInPrompt}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SignInForm />
                    </CardContent>
                  </Card>
                </motion.div>
              </Unauthenticated>
            </div>

            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.6
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

            <div className="mb-10 flex items-center justify-center lg:hidden">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-4 py-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {language === "en" ? "Filters" : "Bộ lọc"}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-sm">
                  <SheetHeader className="text-left">
                    <SheetTitle>
                      {language === "en" ? "Refine results" : "Lọc kết quả"}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 max-h-[70vh] overflow-y-auto pb-8">
                    <Sidebar
                      isOpen={sidebarOpen}
                      onClose={() => setSidebarOpen(false)}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      selectedPricing={selectedPricing}
                      onPricingChange={setSelectedPricing}
                      language={language}
                      translations={t}
                      variant="mobile"
                      className="space-y-8"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">{t.title}</h1>
          </div>

          <Authenticated>
            <nav className="ml-auto hidden items-center gap-2 lg:flex">
              <Button
                onClick={() => setActiveTab("browse")}
                variant={activeTab === "browse" ? "default" : "ghost"}
                size="sm"
              >
                {t.browse}
              </Button>
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
            </nav>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </Authenticated>
          
          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <Button
                onClick={() => {
                  document.querySelector('.sign-in-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="shadow-sm"
              >
                Sign in
              </Button>
            </Unauthenticated>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <Authenticated>
          {mobileMenuOpen && (
            <div className="border-t lg:hidden">
              <div className="container py-2">
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => {
                      setActiveTab("browse");
                      setMobileMenuOpen(false);
                    }}
                    variant={activeTab === "browse" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                  >
                    {t.browse}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("add");
                      setMobileMenuOpen(false);
                    }}
                    variant={activeTab === "add" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                  >
                    {t.addTool}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("manage");
                      setMobileMenuOpen(false);
                    }}
                    variant={activeTab === "manage" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                  >
                    {t.myTools}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("stats");
                      setMobileMenuOpen(false);
                    }}
                    variant={activeTab === "stats" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                  >
                    {t.stats}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </header>

      <div className="flex flex-col lg:flex-row">
        {activeTab === "browse" && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPricing={selectedPricing}
            onPricingChange={setSelectedPricing}
            language={language}
            translations={t}
            variant="desktop"
          />
        )}

        <main className="min-h-[calc(100vh-4rem)] flex-1">
          <div className="container max-w-7xl px-4 py-8 sm:px-6">

            <Unauthenticated>
              <div className="mb-8 text-center">
                <Button
                  onClick={() => void handleLoadSampleData()}
                  variant="outline"
                  size="lg"
                >
                  {t.loadSample}
                </Button>
              </div>
            </Unauthenticated>

            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
