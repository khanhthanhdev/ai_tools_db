import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ToolCard } from "../components/ToolCard";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { generateBreadcrumbStructuredData } from "../lib/structuredData";

type Language = "en" | "vi";

const translations = {
  en: {
    myFavourites: "My Favourites",
    manageFavourites: "Your favourite AI tools in one place",
    noFavourites: "No favourites yet",
    noFavouritesDescription: "Start exploring and favourite tools you love!",
    browseFavourites: "Browse Tools",
    loading: "Loading your favourites...",
  },
  vi: {
    myFavourites: "Yêu thích của tôi",
    manageFavourites: "Các công cụ AI yêu thích của bạn ở một nơi",
    noFavourites: "Chưa có yêu thích nào",
    noFavouritesDescription: "Bắt đầu khám phá và yêu thích các công cụ bạn thích!",
    browseFavourites: "Duyệt công cụ",
    loading: "Đang tải yêu thích của bạn...",
  },
};

export function FavouritesPage({ language }: { language: Language }) {
  const t = translations[language];
  const favouriteTools = useQuery(api.favourites.getUserFavourites);

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: language === "vi" ? "Trang chủ" : "Home", url: "/" },
    { name: t.myFavourites, url: "/favourites" },
  ]);

  if (favouriteTools === undefined) {
    return (
      <>
        <SEO
          title={language === "vi" ? "Yêu Thích Của Tôi" : "My Favourites"}
          description={language === "vi" 
            ? "Quản lý các công cụ AI yêu thích của bạn. Truy cập nhanh vào các công cụ bạn đã lưu."
            : "Manage your favourite AI tools. Quick access to the tools you've saved."}
          keywords={language === "vi"
            ? ["yêu thích", "công cụ đã lưu", "bookmark AI", "công cụ của tôi"]
            : ["favourites", "saved tools", "bookmarked AI", "my tools"]}
          language={language}
          structuredData={breadcrumbData}
        />
        <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <Card className="mx-auto max-w-7xl shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              {t.myFavourites}
            </CardTitle>
            <CardDescription>{t.manageFavourites}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t.loading}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={language === "vi" ? "Yêu Thích Của Tôi" : "My Favourites"}
        description={language === "vi" 
          ? "Quản lý các công cụ AI yêu thích của bạn. Truy cập nhanh vào các công cụ bạn đã lưu."
          : "Manage your favourite AI tools. Quick access to the tools you've saved."}
        keywords={language === "vi"
          ? ["yêu thích", "công cụ đã lưu", "bookmark AI", "công cụ của tôi"]
          : ["favourites", "saved tools", "bookmarked AI", "my tools"]}
        language={language}
        structuredData={breadcrumbData}
      />
      <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      <Card className="mx-auto max-w-7xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
            {t.myFavourites}
          </CardTitle>
          <CardDescription>{t.manageFavourites}</CardDescription>
        </CardHeader>
        <CardContent>
          {favouriteTools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="rounded-full bg-muted p-6 mb-4">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t.noFavourites}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t.noFavouritesDescription}
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                {t.browseFavourites}
              </a>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {favouriteTools.map((tool) => (
                <ToolCard 
                  key={tool._id} 
                  tool={tool} 
                  language={language}
                  isFavourited={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
