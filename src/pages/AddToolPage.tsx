import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { SEO } from "../components/SEO";
import { generateBreadcrumbStructuredData } from "../lib/structuredData";

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

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: language === "vi" ? "Trang chủ" : "Home", url: "/" },
    { name: t.addTool, url: "/add-tool" },
  ]);

  return (
    <>
      <SEO
        title={language === "vi" ? "Thêm Công Cụ AI" : "Add AI Tool"}
        description={language === "vi" 
          ? "Đóng góp công cụ AI của bạn vào cơ sở dữ liệu của chúng tôi. Chia sẻ công cụ AI tuyệt vời với cộng đồng."
          : "Submit your AI tool to our database. Share amazing AI tools with the community."}
        keywords={language === "vi"
          ? ["thêm công cụ AI", "đóng góp công cụ", "gửi công cụ AI", "chia sẻ công cụ"]
          : ["submit AI tool", "add AI tool", "contribute tool", "share AI tool"]}
        language={language}
        structuredData={breadcrumbData}
      />
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
    </>
  );
}
