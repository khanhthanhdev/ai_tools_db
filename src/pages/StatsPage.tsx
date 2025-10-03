import { DatabaseStats } from "../components/DatabaseStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

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

  return (
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
  );
}