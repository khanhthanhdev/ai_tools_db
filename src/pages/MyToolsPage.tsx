import { UserToolsManager } from "../components/UserToolsManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type Language = "en" | "vi";

const translations = {
  en: {
    myTools: "My Tools",
    manageTools: "Manage your submitted AI tools",
  },
  vi: {
    myTools: "Công cụ của tôi",
    manageTools: "Quản lý các công cụ AI bạn đã gửi",
  },
};

export function MyToolsPage({ language }: { language: Language }) {
  const t = translations[language];

  return (
    <Card className="mx-auto max-w-7xl shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t.myTools}</CardTitle>
        <CardDescription>{t.manageTools}</CardDescription>
      </CardHeader>
      <CardContent>
        <UserToolsManager language={language} />
      </CardContent>
    </Card>
  );
}