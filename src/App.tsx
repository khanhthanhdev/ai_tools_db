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
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
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
          <Card className="max-w-7xl mx-auto">
            <CardHeader>
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
          <Card className="max-w-7xl mx-auto">
            <CardHeader>
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
            <div className="text-center mb-16">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-tight">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
                  {t.subtitle}
                </p>
                
                <Unauthenticated>
                  <Card className="mb-16 max-w-lg mx-auto">
                    <CardHeader>
                      <CardTitle className="text-xl">{t.signInPrompt}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SignInForm />
                    </CardContent>
                  </Card>
                </Unauthenticated>
              </div>
            </div>

            <div className="mb-16">
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
      
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
                  <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>

              <Authenticated>
                <nav className="hidden lg:flex items-center gap-2 bg-muted/50 backdrop-blur-sm rounded-xl p-2 border">
                  <Button
                    onClick={() => setActiveTab("browse")}
                    variant={activeTab === "browse" ? "default" : "ghost"}
                    className="px-6 py-3 rounded-lg text-base font-semibold"
                  >
                    {t.browse}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("add")}
                    variant={activeTab === "add" ? "default" : "ghost"}
                    className="px-6 py-3 rounded-lg text-base font-semibold"
                  >
                    {t.addTool}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("manage")}
                    variant={activeTab === "manage" ? "default" : "ghost"}
                    className="px-6 py-3 rounded-lg text-base font-semibold"
                  >
                    {t.myTools}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("stats")}
                    variant={activeTab === "stats" ? "default" : "ghost"}
                    className="px-6 py-3 rounded-lg text-base font-semibold"
                  >
                    {t.stats}
                  </Button>
                </nav>
              </Authenticated>
              
              <div className="flex items-center gap-4">
                <LanguageToggle language={language} onLanguageChange={setLanguage} />
                <Authenticated>
                  <SignOutButton />
                </Authenticated>
              </div>
            </div>
          </div>
        </div>
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

        <main className="flex-1 transition-all duration-300">
          <div className="px-6 lg:px-12 py-12">
            <Authenticated>
              <div className="lg:hidden mb-8">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  <Button
                    onClick={() => setActiveTab("browse")}
                    variant={activeTab === "browse" ? "default" : "outline"}
                    className="px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    {t.browse}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("add")}
                    variant={activeTab === "add" ? "default" : "outline"}
                    className="px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    {t.addTool}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("manage")}
                    variant={activeTab === "manage" ? "default" : "outline"}
                    className="px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    {t.myTools}
                  </Button>
                  <Button
                    onClick={() => setActiveTab("stats")}
                    variant={activeTab === "stats" ? "default" : "outline"}
                    className="px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    {t.stats}
                  </Button>
                </div>
              </div>
            </Authenticated>

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
