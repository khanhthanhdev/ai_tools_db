import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  language?: "en" | "vi";
  structuredData?: object;
}

export function SEO({
  title = "AI Knowledge Cloud - AI Knowledge Cloud & Tool Recommendation",
  description = "AI Knowledge Cloud for discovering and recommending the best AI tools. Curated by Tran Khanh Thanh (khanhthanhdev) for Vin Uni Library and the AI community.",
  keywords = ["AI knowledge cloud", "AI tool recommendation", "Vin Uni Library", "AI tools", "artificial intelligence", "AI database", "khanhthanhdev", "Tran Khanh Thanh"],
  image = "/og-preview.png",
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  language = "en",
  structuredData,
}: SEOProps) {
  const siteName = "AI Knowledge Cloud";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  const translations = {
    en: {
      siteName: "AI Knowledge Cloud",
      defaultDescription: "AI Knowledge Cloud for discovering and recommending the best AI tools. Curated by Tran Khanh Thanh (khanhthanhdev) for Vin Uni Library and the AI community.",
    },
    vi: {
      siteName: "Cơ Sở Dữ Liệu Công Cụ AI",
      defaultDescription: "Đám mây tri thức AI để khám phá và đề xuất các công cụ AI tốt nhất. Được tuyển chọn bởi Trần Khánh Thành (khanhthanhdev) cho Thư viện Vin Uni và cộng đồng AI.",
    },
  };

  const t = translations[language];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={t.siteName} />
      <meta property="og:locale" content={language === "vi" ? "vi_VN" : "en_US"} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="Tran Khanh Thanh (khanhthanhdev)" />
      <meta name="creator" content="thanhtran" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
