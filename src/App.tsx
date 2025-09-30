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
          <Card className="max-w-4xl mx-auto mx-4 sm:mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">{t.addTool}</CardTitle>
              <CardDescription className="text-gray-600">
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
          <Card className="max-w-7xl mx-auto mx-4 sm:mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">{t.myTools}</CardTitle>
              <CardDescription className="text-gray-600">
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
          <Card className="max-w-7xl mx-auto mx-4 sm:mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">{t.stats}</CardTitle>
              <CardDescription className="text-gray-600">
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
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {t.title}
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {t.subtitle}
              </p>
                
              <Unauthenticated>
                <Card className="mb-12 max-w-md mx-auto mx-4 sm:mx-auto sign-in-form">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-800">{t.signInPrompt}</CardTitle>
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
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
        <div className="h-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{t.title}</h1>
              </div>

              <Authenticated>
                <nav className="hidden lg:flex items-center gap-1">
                                    <Button
                    onClick={() => setActiveTab("browse")}
                    variant={activeTab === "browse" ? "default" : "ghost"}
                    size="sm"
                    className="text-sm font-medium text-gray-800 hover:text-gray-900"
                  >
                    {t.browse}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("add")}
                    variant={activeTab === "add" ? "default" : "ghost"}
                    size="sm"
                    className="text-sm font-medium text-gray-800 hover:text-gray-900"
                  >
                    {t.addTool}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("manage")}
                    variant={activeTab === "manage" ? "default" : "ghost"}
                    size="sm"
                    className="text-sm font-medium text-gray-800 hover:text-gray-900"
                  >
                    {t.myTools}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("stats")}
                    variant={activeTab === "stats" ? "default" : "ghost"}
                    size="sm"
                    className="text-sm font-medium text-gray-800 hover:text-gray-900"
                  >
                    {t.stats}
                  </Button>
                </nav>

                {/* Mobile Menu Button */}
                <Button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 text-gray-800 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </Authenticated>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <LanguageToggle language={language} onLanguageChange={setLanguage} />
                <Authenticated>
                  <SignOutButton />
                </Authenticated>
                <Unauthenticated>
                  <button
                    onClick={() => {
                      // Scroll to sign in form
                      document.querySelector('.sign-in-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-base bg-blue-600 text-white border-2 border-blue-600 font-semibold hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="hidden sm:inline">Sign in</span>
                    <span className="sm:hidden">Sign in</span>
                  </button>
                </Unauthenticated>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <Authenticated>
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-white/95 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => {
                      setActiveTab("browse");
                      setMobileMenuOpen(false);
                    }}
                    variant={activeTab === "browse" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start text-sm font-medium text-gray-800 hover:text-gray-900"
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
                    className="justify-start text-sm font-medium text-gray-800 hover:text-gray-900"
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
                    className="justify-start text-sm font-medium text-gray-800 hover:text-gray-900"
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
                    className="justify-start text-sm font-medium text-gray-800 hover:text-gray-900"
                  >
                    {t.stats}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </header>

      <div className="flex min-h-[calc(100vh-5rem)]">
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
          />
        )}

        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-12 py-8">

            <Unauthenticated>
              <div className="mb-8 text-center">
                <Button
                  onClick={() => void handleLoadSampleData()}
                  variant="outline"
                  className="px-8 py-3 text-lg"
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
