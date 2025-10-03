import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ToolsList } from "../components/ToolsList";
import { AddToolForm } from "../components/AddToolForm";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilterMobile } from "../components/CategoryFilterMobile";
import { Sidebar } from "../components/Sidebar";
import { UserToolsManager } from "../components/UserToolsManager";
import { DatabaseStats } from "../components/DatabaseStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Sparkles, Zap, Star, Rocket, Brain, Code, Palette } from "lucide-react";
import { motion } from "motion/react";
import { translations } from "../translations";
import { MainLayout } from "@/components/MainLayout";

type Language = "en" | "vi";
type ActiveTab = "browse" | "add" | "manage" | "stats";

export function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<ActiveTab>("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");
  const t = (key: keyof (typeof translations)["en"]) => translations[language][key] || translations["en"][key];

  const renderTabContent = () => {
    switch (activeTab) {
      case "add":
        return (
          <Card className="mx-auto max-w-4xl shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{t("addTool")}</CardTitle>
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
              <CardTitle className="text-2xl">{t("myTools")}</CardTitle>
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
              <CardTitle className="text-2xl">{t("stats")}</CardTitle>
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
                {t("title")}
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
                {t("subtitle")}
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
    <MainLayout initialLanguage={language} setLanguage={setLanguage} t={t}>
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
        {renderTabContent()}
      </div>
    </MainLayout>
  );
}