import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DatabaseStatsProps {
  language: "en" | "vi";
}

const translations = {
  en: {
    stats: "Database Statistics",
    totalTools: "Total AI Tools",
    categories: "Categories",
    freeTools: "Free Tools",
    freemiumTools: "Freemium Tools",
    paidTools: "Paid Tools",
    englishTools: "English Tools",
    vietnameseTools: "Vietnamese Tools",
    loading: "Loading stats...",
  },
  vi: {
    stats: "Thống kê cơ sở dữ liệu",
    totalTools: "Tổng số công cụ AI",
    categories: "Danh mục",
    freeTools: "Công cụ miễn phí",
    freemiumTools: "Công cụ Freemium",
    paidTools: "Công cụ trả phí",
    englishTools: "Công cụ tiếng Anh",
    vietnameseTools: "Công cụ tiếng Việt",
    loading: "Đang tải thống kê...",
  },
};

export function DatabaseStats({ language }: DatabaseStatsProps) {
  const stats = useQuery(api.aiTools.getToolStats);
  const t = translations[language];

  if (!stats) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t.stats}</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <p className="text-gray-500 text-sm mt-4">{t.loading}</p>
      </div>
    );
  }

  const statItems = [
    { label: t.totalTools, value: stats.total, color: "bg-blue-500", icon: "🤖" },
    { label: t.categories, value: stats.categories, color: "bg-purple-500", icon: "📂" },
    { label: t.freeTools, value: stats.byPricing.free, color: "bg-green-500", icon: "🆓" },
    { label: t.freemiumTools, value: stats.byPricing.freemium, color: "bg-yellow-500", icon: "⭐" },
    { label: t.paidTools, value: stats.byPricing.paid, color: "bg-red-500", icon: "💎" },
    { label: t.englishTools, value: stats.byLanguage.en, color: "bg-indigo-500", icon: "🇺🇸" },
    { label: t.vietnameseTools, value: stats.byLanguage.vi, color: "bg-pink-500", icon: "🇻🇳" },
  ];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t.stats}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{item.icon}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
