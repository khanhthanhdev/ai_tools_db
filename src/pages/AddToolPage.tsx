import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type Language = "en" | "vi";

const AddToolForm = lazy(() =>
  import("../components/AddToolForm").then((module) => ({ default: module.AddToolForm }))
);

const translations = {
  en: {
    addTool: "Add Tool",
    shareTool: "Share an amazing AI tool with the community",
  },
  vi: {
    addTool: "Thêm công cụ",
    shareTool: "Chia sẻ một công cụ AI tuyệt vời với cộng đồng",
  },
};

export function AddToolPage({ language }: { language: Language }) {
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      <Card className="mx-auto max-w-4xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t.addTool}</CardTitle>
          <CardDescription>{t.shareTool}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-6 text-center">Loading...</div>}>
            <AddToolForm language={language} onClose={() => navigate("/")} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
