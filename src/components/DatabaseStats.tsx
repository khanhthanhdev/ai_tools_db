import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { queryKeys } from "@/lib/queryKeys";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface DatabaseStatsProps {
  language: "en" | "vi";
}

const translations = {
  en: {
    stats: "Database Statistics",
    overview: "Quick overview of AI tools in the database",
    totalTools: "Total AI Tools",
    categories: "Categories",
    pricingDistribution: "Pricing Distribution",
    languageDistribution: "Language Distribution",
    freeTools: "Free",
    freemiumTools: "Freemium",
    paidTools: "Paid",
    englishTools: "English",
    vietnameseTools: "Vietnamese",
    loading: "Loading stats...",
    tools: "tools",
  },
  vi: {
    stats: "Thống kê cơ sở dữ liệu",
    overview: "Tổng quan về các công cụ AI trong cơ sở dữ liệu",
    totalTools: "Tổng số công cụ AI",
    categories: "Danh mục",
    pricingDistribution: "Phân bổ giá",
    languageDistribution: "Phân bổ ngôn ngữ",
    freeTools: "Miễn phí",
    freemiumTools: "Freemium",
    paidTools: "Trả phí",
    englishTools: "Tiếng Anh",
    vietnameseTools: "Tiếng Việt",
    loading: "Đang tải thống kê...",
    tools: "công cụ",
  },
};

const COLORS = {
  free: "hsl(142, 76%, 36%)",
  freemium: "hsl(48, 96%, 53%)",
  paid: "hsl(0, 84%, 60%)",
  en: "hsl(221, 83%, 53%)",
  vi: "hsl(330, 81%, 60%)",
};

export function DatabaseStats({ language }: DatabaseStatsProps) {
  const { data: stats, isLoading, isFetching } = useConvexQuery(
    api.aiTools.getToolStats, 
    {},
    { queryKey: queryKeys.tools.stats() }
  );
  const t = translations[language];

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t.stats}
              {/* Background refetch indicator */}
              {isFetching && !isLoading && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Updating...
                </span>
              )}
            </CardTitle>
            <CardDescription>{isLoading ? t.loading : t.overview}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pricingData = [
    { name: t.freeTools, value: stats.byPricing.free, fill: COLORS.free },
    {
      name: t.freemiumTools,
      value: stats.byPricing.freemium,
      fill: COLORS.freemium,
    },
    { name: t.paidTools, value: stats.byPricing.paid, fill: COLORS.paid },
  ];

  const languageData = [
    { name: t.englishTools, value: stats.byLanguage.en, fill: COLORS.en },
    { name: t.vietnameseTools, value: stats.byLanguage.vi, fill: COLORS.vi },
  ];

  const chartConfig = {
    free: { label: t.freeTools, color: COLORS.free },
    freemium: { label: t.freemiumTools, color: COLORS.freemium },
    paid: { label: t.paidTools, color: COLORS.paid },
    en: { label: t.englishTools, color: COLORS.en },
    vi: { label: t.vietnameseTools, color: COLORS.vi },
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">
              {t.totalTools}
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">
              {stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
            <p className="text-xs text-muted-foreground">{t.tools}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">
              {t.categories}
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">
              {stats.categories}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
            <p className="text-xs text-muted-foreground">{t.tools}</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">
              {t.languageDistribution}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-around px-4 pb-4 sm:p-6 sm:pt-0">
            <div className="text-center">
              <div
                className="text-xl sm:text-2xl font-bold"
                style={{ color: COLORS.en }}
              >
                {stats.byLanguage.en}
              </div>
              <p className="text-xs text-muted-foreground">{t.englishTools}</p>
            </div>
            <div className="text-center">
              <div
                className="text-xl sm:text-2xl font-bold"
                style={{ color: COLORS.vi }}
              >
                {stats.byLanguage.vi}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.vietnameseTools}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Pricing Distribution Bar Chart */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 sm:p-6 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              {t.pricingDistribution}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.freeTools}: {stats.byPricing.free} • {t.freemiumTools}:{" "}
              {stats.byPricing.freemium} • {t.paidTools}: {stats.byPricing.paid}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
            <ChartContainer
              config={chartConfig}
              className="h-[280px] sm:h-[320px] w-full"
            >
              <BarChart
                data={pricingData}
                margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {pricingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Language Distribution Pie Chart */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 sm:p-6 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              {t.languageDistribution}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.englishTools}: {stats.byLanguage.en} • {t.vietnameseTools}:{" "}
              {stats.byLanguage.vi}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
            <ChartContainer
              config={chartConfig}
              className="h-[280px] sm:h-[320px] w-full"
            >
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius="60%"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
