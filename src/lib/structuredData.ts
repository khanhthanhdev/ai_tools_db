// Generate structured data for SEO (JSON-LD format)

export function generateWebsiteStructuredData(language: "en" | "vi") {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: language === "vi" ? "Cơ Sở Dữ Liệu Công Cụ AI" : "AI Tools Database",
    alternateName: "AI Knowledge Cloud",
    description: language === "vi" 
      ? "Đám mây tri thức AI để khám phá và đề xuất các công cụ AI tốt nhất. Được tuyển chọn cho Thư viện Vin Uni."
      : "AI Knowledge Cloud for discovering and recommending the best AI tools. Curated for Vin Uni Library.",
    url: baseUrl,
    author: {
      "@type": "Person",
      name: "Tran Khanh Thanh",
      alternateName: ["khanhthanhdev", "thanhtran"],
      jobTitle: "AI Tools Curator",
      affiliation: {
        "@type": "Organization",
        name: "Vin Uni Library"
      }
    },
    keywords: "AI knowledge cloud, AI tool recommendation, Vin Uni Library, AI tools, artificial intelligence",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: language === "vi" ? "vi-VN" : "en-US",
  };
}

export function generateToolStructuredData(tool: {
  name: string;
  description: string;
  url: string;
  category: string;
  pricing: string;
  averageRating?: number;
  totalReviews?: number;
  logoUrl?: string;
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: tool.category,
    offers: {
      "@type": "Offer",
      price: tool.pricing === "free" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  if (tool.logoUrl) {
    structuredData.image = tool.logoUrl;
  }

  if (tool.averageRating && tool.totalReviews) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: tool.averageRating.toFixed(1),
      reviewCount: tool.totalReviews,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return structuredData;
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Tools Database",
    alternateName: "AI Knowledge Cloud",
    url: baseUrl,
    logo: `${baseUrl}/og-preview.png`,
    description: "AI Knowledge Cloud for discovering and recommending the best AI tools. Curated for Vin Uni Library.",
    founder: {
      "@type": "Person",
      name: "Tran Khanh Thanh",
      alternateName: ["khanhthanhdev", "thanhtran"],
      jobTitle: "AI Tools Curator & Developer"
    },
    keywords: "AI knowledge cloud, AI tool recommendation, Vin Uni Library",
    sameAs: [
      // Add your social media links here
      // "https://github.com/khanhthanhdev",
      // "https://linkedin.com/in/thanhtran",
    ],
  };
}
