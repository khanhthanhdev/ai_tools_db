import { useState, ReactElement } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { LanguageToggle } from "../components/LanguageToggle";
import BeamsBackground from "../components/kokonutui/beams-background";
import SocialButton, {
  SocialIcons,
  type SocialOption,
} from "../components/kokonutui/social-button";
import { Lightbulb, UsersRound, Rocket, Sparkles, MapPin } from "lucide-react";

type Language = "en" | "vi";

type MemberLinkType = keyof typeof SocialIcons;

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  location: string;
  focus: string;
  image: string;
  initials: string;
  links: { type: MemberLinkType; url: string }[];
};

type Translation = {
  pageBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionDescription: string;
  missionHighlights: string[];
  focusTitle: string;
  focusCards: {
    icon: ReactElement;
    title: string;
    description: string;
  }[];
  teamTitle: string;
  teamDescription: string;
  teamMembers: TeamMember[];
  calloutTitle: string;
  calloutDescription: string;
  primaryCta: string;
  secondaryCta: string;
};

const socialLabelMap: Record<Language, Record<MemberLinkType, (name: string) => string>> = {
  en: {
    twitter: (name) => `Follow ${name} on Twitter`,
    instagram: (name) => `Follow ${name} on Instagram`,
    linkedin: (name) => `Connect with ${name} on LinkedIn`,
    email: (name) => `Email ${name}`,
    website: (name) => `Visit ${name}'s site`,
    default: (name) => `Open ${name}'s link`,
  },
  vi: {
    twitter: (name) => `Theo dõi ${name} trên Twitter`,
    instagram: (name) => `Theo dõi ${name} trên Instagram`,
    linkedin: (name) => `Kết nối LinkedIn với ${name}`,
    email: (name) => `Gửi email cho ${name}`,
    website: (name) => `Xem trang của ${name}`,
    default: (name) => `Mở liên kết của ${name}`,
  },
};

const translations: Record<Language, Translation> = {
  en: {
    pageBadge: "Our Story",
    heroTitle: "Helping makers discover the right AI tools faster",
    heroSubtitle:
      "AI Tools Database is a curated directory built for product teams, researchers, and indie hackers who want a trustworthy signal in a sea of hype.",
    missionTitle: "Why we built it",
    missionDescription:
      "We believe great ideas deserve great tools. Our mission is to surface the most helpful AI products, document real-world use cases, and connect builders with the resources they need to ship.",
    missionHighlights: [
      "Curated submissions reviewed for quality and relevance",
      "Multilingual coverage to support global creators",
      "Actionable metadata like pricing, categories, and launch readiness",
    ],
    focusTitle: "What we focus on",
    focusCards: [
      {
        icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
        title: "Practical insights",
        description:
          "Every listing includes concise guidance, community context, and quick filters so you can evaluate tools in seconds.",
      },
      {
        icon: <UsersRound className="h-6 w-6 text-emerald-500" />,
        title: "Community-first",
        description:
          "Contributors can add, update, and manage their own tools. We highlight verified makers and active builders.",
      },
      {
        icon: <Rocket className="h-6 w-6 text-sky-500" />,
        title: "Rapid experimentation",
        description:
          "Filter by pricing, category, or launch status to assemble the perfect stack for your next experiment.",
      },
    ],
    teamTitle: "Meet the humans behind the database",
    teamDescription:
      "We are a small distributed crew of AI enthusiasts, designers, and founders. We ship fast, listen to feedback, and keep the catalog fresh.",
    teamMembers: [
      {
        name: "Thanh Nguyen",
        role: "Product & Partnerships",
        bio: "Keeps the roadmap focused on builders and maintains community curation standards.",
        location: "Ho Chi Minh City, Vietnam",
        focus: "Builder advocacy",
        image: "https://avatar.vercel.sh/thanh?text=TN",
        initials: "TN",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/thanhkt" },
          { type: "twitter", url: "https://twitter.com/thanhkt" },
          { type: "email", url: "mailto:hello@aitools.dev" },
        ],
      },
      {
        name: "Linh Pham",
        role: "Design Systems",
        bio: "Crafts the interface patterns, motion, and accessibility that make browsing tools feel effortless.",
        location: "Da Nang, Vietnam",
        focus: "Design ops",
        image: "https://avatar.vercel.sh/linh?text=LP",
        initials: "LP",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/linh-pham" },
          { type: "instagram", url: "https://www.instagram.com/linh.design" },
          { type: "email", url: "mailto:linh@aitools.dev" },
        ],
      },
      {
        name: "Minh Tran",
        role: "Data & Research",
        bio: "Tracks emerging AI launches and keeps metadata accurate across pricing, categories, and use cases.",
        location: "Hanoi, Vietnam",
        focus: "AI research",
        image: "https://avatar.vercel.sh/minh?text=MT",
        initials: "MT",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/minh-tran-ai" },
          { type: "website", url: "https://minhtran.ai" },
          { type: "email", url: "mailto:minh@aitools.dev" },
        ],
      },
    ],
    calloutTitle: "Want to get involved?",
    calloutDescription:
      "Share your favorite tool, suggest an improvement, or join the community shaping the next generation of AI workflows.",
    primaryCta: "Browse the tools",
    secondaryCta: "Submit a tool",
  },
  vi: {
    pageBadge: "Câu chuyện của chúng tôi",
    heroTitle: "Giúp bạn tìm đúng công cụ AI nhanh hơn",
    heroSubtitle:
      "AI Tools Database là thư mục được tuyển chọn dành cho đội ngũ sản phẩm, nhà nghiên cứu và indie hacker cần những gợi ý đáng tin cậy giữa biển thông tin.",
    missionTitle: "Vì sao chúng tôi xây dựng",
    missionDescription:
      "Chúng tôi tin rằng ý tưởng tốt xứng đáng có công cụ tốt. Sứ mệnh của chúng tôi là giới thiệu những sản phẩm AI hữu ích nhất, ghi lại trường hợp sử dụng thực tế và kết nối người làm sản phẩm với nguồn lực phù hợp.",
    missionHighlights: [
      "Bài gửi được tuyển chọn kỹ lưỡng về chất lượng và mức độ phù hợp",
      "Hỗ trợ đa ngôn ngữ để phục vụ cộng đồng sáng tạo toàn cầu",
      "Thông tin chi tiết như giá, danh mục và trạng thái ra mắt rõ ràng",
    ],
    focusTitle: "Trọng tâm của chúng tôi",
    focusCards: [
      {
        icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
        title: "Thông tin hữu ích",
        description:
          "Mỗi mục đều có hướng dẫn ngắn gọn, bối cảnh cộng đồng và bộ lọc nhanh để bạn đánh giá trong vài giây.",
      },
      {
        icon: <UsersRound className="h-6 w-6 text-emerald-500" />,
        title: "Cộng đồng là trước hết",
        description:
          "Người đóng góp có thể thêm, cập nhật và quản lý công cụ của họ. Chúng tôi tôn vinh những nhà sáng tạo tích cực.",
      },
      {
        icon: <Rocket className="h-6 w-6 text-sky-500" />,
        title: "Thử nghiệm nhanh",
        description:
          "Lọc theo giá, danh mục hoặc trạng thái ra mắt để xây dựng bộ công cụ hoàn hảo cho dự án tiếp theo.",
      },
    ],
    teamTitle: "Những con người đứng sau",
    teamDescription:
      "Chúng tôi là một nhóm nhỏ đam mê AI, thiết kế và khởi nghiệp. Chúng tôi lắng nghe phản hồi và luôn cập nhật thư viện.",
    teamMembers: [
      {
        name: "Thanh Nguyen",
        role: "Sản phẩm & Đối tác",
        bio: "Định hình lộ trình sản phẩm dựa trên nhu cầu builder và đảm bảo tiêu chuẩn tuyển chọn cộng đồng.",
        location: "TP. Hồ Chí Minh, Việt Nam",
        focus: "Kết nối cộng đồng",
        image: "https://avatar.vercel.sh/thanh?text=TN",
        initials: "TN",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/thanhkt" },
          { type: "twitter", url: "https://twitter.com/thanhkt" },
          { type: "email", url: "mailto:hello@aitools.dev" },
        ],
      },
      {
        name: "Linh Pham",
        role: "Hệ thống thiết kế",
        bio: "Thiết kế trải nghiệm, chuyển động và khả năng truy cập giúp việc khám phá công cụ trở nên mượt mà.",
        location: "Đà Nẵng, Việt Nam",
        focus: "Quy trình thiết kế",
        image: "https://avatar.vercel.sh/linh?text=LP",
        initials: "LP",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/linh-pham" },
          { type: "instagram", url: "https://www.instagram.com/linh.design" },
          { type: "email", url: "mailto:linh@aitools.dev" },
        ],
      },
      {
        name: "Minh Tran",
        role: "Dữ liệu & Nghiên cứu",
        bio: "Theo dõi các sản phẩm AI mới nhất và cập nhật dữ liệu về giá, danh mục cùng tình trạng ra mắt.",
        location: "Hà Nội, Việt Nam",
        focus: "Nghiên cứu AI",
        image: "https://avatar.vercel.sh/minh?text=MT",
        initials: "MT",
        links: [
          { type: "linkedin", url: "https://www.linkedin.com/in/minh-tran-ai" },
          { type: "website", url: "https://minhtran.ai" },
          { type: "email", url: "mailto:minh@aitools.dev" },
        ],
      },
    ],
    calloutTitle: "Muốn tham gia cùng chúng tôi?",
    calloutDescription:
      "Chia sẻ công cụ yêu thích, gợi ý cải tiến hoặc tham gia cộng đồng xây dựng quy trình AI tương lai.",
    primaryCta: "Khám phá công cụ",
    secondaryCta: "Gửi công cụ",
  },
};

export function AboutUsPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const buildSocialOptions = (member: TeamMember): SocialOption[] =>
    member.links.map((link) => {
      const icon = SocialIcons[link.type] ?? SocialIcons.default;
      const labelBuilder = socialLabelMap[language][link.type] ?? socialLabelMap[language].default;
      return {
        icon,
        label: labelBuilder(member.name),
        href: link.url,
      };
    });

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <BeamsBackground intensity="subtle" className="h-full w-full" />
      </div>

      {/* <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span>AI Tools Database</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">{language === "en" ? "Home" : "Trang chủ"}</Link>
            </Button>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header> */}

      <main className="container mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs sm:text-sm">
            {t.pageBadge}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/">{t.primaryCta}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/">{t.secondaryCta}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="border-primary/10 bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                {t.missionTitle}
              </CardTitle>
              <CardDescription>{t.missionDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {t.missionHighlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{highlight}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t.focusTitle}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "These pillars keep the database opinionated and useful."
                  : "Những trọng tâm giúp thư viện luôn hữu ích."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {t.focusCards.map((card) => (
                <div key={card.title} className="flex gap-4 rounded-lg bg-muted/40 p-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                    {card.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t.teamTitle}</h2>
            <p className="text-sm text-muted-foreground sm:text-base">{t.teamDescription}</p>
          </div>
          <Separator className="bg-primary/30" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.teamMembers.map((member) => (
              <Card
                key={member.name}
                className="flex h-full flex-col bg-background/80 shadow-sm"
              >
                <CardHeader className="flex flex-col items-center space-y-4 text-center">
                  <Avatar className="h-20 w-20 border border-primary/40 shadow-sm">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="font-medium text-primary">
                      {member.role}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-sm text-muted-foreground">
                  <p>{member.bio}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-primary/80" />
                      <span className="text-muted-foreground">{member.location}</span>
                    </span>
                    <Badge variant="outline" className="border-dashed px-2 py-1 text-[0.7rem] uppercase tracking-wide">
                      {member.focus}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto flex justify-center pb-6 pt-0">
                  <SocialButton
                    label={language === "en" ? "Connect" : "Kết nối"}
                    interaction="click"
                    options={buildSocialOptions(member)}
                    className="w-full justify-center sm:w-auto"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center shadow-sm">
          <div className="flex justify-center pb-4">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold sm:text-3xl">{t.calloutTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t.calloutDescription}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/">{t.primaryCta}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/">{t.secondaryCta}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
