import { DatabaseStats } from "../components/DatabaseStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { SEO } from "../components/SEO";
import { generateBreadcrumbStructuredData } from "../lib/structuredData";

type Language = "en" | "vi";

const translations = {
  en: {
    stats: "Statistics",
    insights: "Database statistics and insights",
  },
  vi: {
    stats: "Thống kê",
    insights: "Thống kê và thông tin chi tiết cơ sở dữ liệu",
  },
};

export function StatsPage({ language }: { language: Language }) {
  const t = translations[language];

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: language === "vi" ? "Trang chủ" : "Home", url: "/" },
    { name: t.stats, url: "/stats" },
  ]);

  return (
    <>
      <SEO
        title={language === "vi" ? "Thống Kê Công Cụ AI" : "AI Tools Statistics"}
        description={language === "vi" 
          ? "Xem thống kê và thông tin chi tiết về cơ sở dữ liệu công cụ AI. Khám phá xu hướng, danh mục phổ biến và nhiều hơn nữa."
          : "View statistics and insights about our AI tools database. Discover trends, popular categories, and more."}
        keywords={language === "vi"
          ? ["thống kê AI", "phân tích công cụ AI", "xu hướng AI", "dữ liệu AI"]
          : ["AI statistics", "AI tools analytics", "AI trends", "AI data"]}
        language={language}
        structuredData={breadcrumbData}
      />
      <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      <Card className="mx-auto max-w-7xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t.stats}</CardTitle>
          <CardDescription>{t.insights}</CardDescription>
        </CardHeader>
        <CardContent>
          <DatabaseStats language={language} />
        </CardContent>
      </Card>
    </div>
    </>
  );
}