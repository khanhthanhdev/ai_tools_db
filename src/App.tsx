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
import { SlidersHorizontal } from "lucide-react";

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
            <div className="mb-12 text-center">
              <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
                {t.title}
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                {t.subtitle}
              </p>
                
              <Unauthenticated>
                <Card className="sign-in-form mx-auto mb-12 max-w-md shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-lg">{t.signInPrompt}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignInForm />
                  </CardContent>
                </Card>
              </Unauthenticated>
            </div>

            <div className="mb-12">
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
            </div>

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Toaster position="top-right" richColors />
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
