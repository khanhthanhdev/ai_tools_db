import { ReactElement } from "react";
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
import BeamsBackground from "../components/kokonutui/beams-background";
import SocialButton, {
  SocialIcons,
  type SocialOption,
} from "../components/kokonutui/social-button";
import { Lightbulb, UsersRound, Rocket, Sparkles, MapPin } from "lucide-react";
import { SEO } from "../components/SEO";
import { generateOrganizationStructuredData } from "../lib/structuredData";

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

const socialLabelMap: Record<
  Language,
  Record<MemberLinkType, (name: string) => string>
> = {
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
    heroTitle: "AI Knowledge Cloud for Vietnam",
    heroSubtitle:
      "A curated AI tools directory built for students, researchers, and innovators. Browse, share, and discover AI tools with semantic search to accelerate AI adoption in Vietnam.",
    missionTitle: "Why we built it",
    missionDescription:
      "We believe AI should be accessible to everyone. Our mission is to create a knowledge hub where the Vietnamese community can discover, share, and learn about AI tools that drive innovation and research.",
    missionHighlights: [
      "Semantic search powered by vector embeddings for intelligent discovery",
      "Community-driven submissions from students and researchers",
      "Bilingual support (English/Vietnamese) for local accessibility",
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
    teamTitle: "Meet the team",
    teamDescription:
      "A collaboration between Vin University Library and CECS students passionate about making AI accessible to the Vietnamese community.",
    teamMembers: [
      {
        name: "Tony Tin",
        role: "Director of Vin University Library",
        bio: "Provides strategic direction and ensures the platform aligns with academic research and knowledge sharing goals.",
        location: "Hanoi, Vietnam",
        focus: "Project Manager",
        image: "https://avatar.vercel.sh/tonytin?text=TT",
        initials: "TT",
        links: [
          { type: "email", url: "mailto:tony.tin@vinuni.edu.vn" },
          { type: "website", url: "https://vinuni.edu.vn/library" },
          { type: "linkedin", url: "https://www.linkedin.com/in/tonytin/" },
        ],
      },
      {
        name: "Thanh Tran",
        role: "CECS Student - Technical Lead",
        bio: "Leads development, architecture design, and coding. Manages the roadmap and coordinates the team.",
        location: "Hanoi, Vietnam",
        focus: "Software Engineer",
        image: "https://avatar.vercel.sh/thanhtran?text=TT",
        initials: "TT",
        links: [
          {
            type: "linkedin",
            url: "https://www.linkedin.com/in/khanhthanhdev",
          },
          { type: "email", url: "mailto:25thanh.tk@vinuni.edu.vn" },
          {
            type: "website",
            url: "https://www.khanhthanhdev.me/",
          },
        ],
      },
      {
        name: "Han Nguyen",
        role: "CECS Student - UI/UX Designer",
        bio: "Designs the user experience, interface patterns, and visual identity that make discovering AI tools intuitive and delightful.",
        location: "Hanoi, Vietnam",
        focus: "Product Design",
        image: "https://avatar.vercel.sh/hannguyen?text=HN",
        initials: "HN",
        links: [{ type: "email", url: "mailto:han.n@vinuni.edu.vn" }],
      },
    ],
    calloutTitle: "Want to contribute?",
    calloutDescription:
      "Share your favorite AI tool, suggest improvements, or join us in building Vietnam's premier AI knowledge hub.",
    primaryCta: "Browse the tools",
    secondaryCta: "Submit a tool",
  },
  vi: {
    pageBadge: "Câu chuyện của chúng tôi",
    heroTitle: "Đám Mây Tri Thức AI cho Việt Nam",
    heroSubtitle:
      "Thư mục công cụ AI được tuyển chọn dành cho sinh viên, nhà nghiên cứu và người đổi mới. Khám phá, chia sẻ công cụ AI với tìm kiếm ngữ nghĩa để thúc đẩy AI tại Việt Nam.",
    missionTitle: "Vì sao chúng tôi xây dựng",
    missionDescription:
      "Chúng tôi tin rằng AI nên dễ tiếp cận với mọi người. Sứ mệnh của chúng tôi là tạo ra trung tâm tri thức nơi cộng đồng Việt Nam có thể khám phá, chia sẻ và học hỏi về các công cụ AI thúc đẩy đổi mới và nghiên cứu.",
    missionHighlights: [
      "Tìm kiếm ngữ nghĩa được hỗ trợ bởi vector embeddings",
      "Nội dung do cộng đồng sinh viên và nhà nghiên cứu đóng góp",
      "Hỗ trợ song ngữ (Tiếng Anh/Tiếng Việt) cho khả năng tiếp cận địa phương",
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
    teamTitle: "Đội ngũ của chúng tôi",
    teamDescription:
      "Sự hợp tác giữa Thư viện Đại học Vin và sinh viên CECS đam mê làm cho AI dễ tiếp cận với cộng đồng Việt Nam.",
    teamMembers: [
      {
        name: "Tony Tin",
        role: "Giám đốc Thư viện Đại học Vin",
        bio: "Cung cấp định hướng chiến lược và đảm bảo nền tảng phù hợp với mục tiêu nghiên cứu học thuật và chia sẻ tri thức.",
        location: "Hà Nội, Việt Nam",
        focus: "Quản lí dự án",
        image: "https://avatar.vercel.sh/tonytin?text=TT",
        initials: "TT",
        links: [
          { type: "email", url: "mailto:tony.tin@vinuni.edu.vn" },
          { type: "website", url: "https://vinuni.edu.vn/library" },
          { type: "linkedin", url: "https://www.linkedin.com/in/tonytin/" },
        ],
      },
      {
        name: "Thanh Tran",
        role: "Sinh viên CECS - Phụ trách kĩ thuật",
        bio: "Dẫn dắt phát triển, thiết kế kiến trúc và triển khai kỹ thuật. Quản lý lộ trình và điều phối nhóm.",
        location: "Hà Nội, Việt Nam",
        focus: "Kĩ sư phần mềm",
        image: "https://avatar.vercel.sh/thanhtran?text=TT",
        initials: "TT",
        links: [
          {
            type: "linkedin",
            url: "https://www.linkedin.com/in/khanhthanhdev",
          },
          { type: "email", url: "mailto:25thanh.tk@vinuni.edu.vn" },
          {
            type: "website",
            url: "https://www.khanhthanhdev.me/",
          },
        ],
      },
      {
        name: "Han Nguyen",
        role: "Sinh viên CECS - Thiết kế UI/UX",
        bio: "Thiết kế trải nghiệm người dùng, giao diện và bản sắc thị giác giúp việc khám phá công cụ AI trở nên trực quan và thú vị.",
        location: "Hà Nội, Việt Nam",
        focus: "Thiết kế sản phẩm",
        image: "https://avatar.vercel.sh/hannguyen?text=HN",
        initials: "HN",
        links: [{ type: "email", url: "mailto:han.n@vinuni.edu.vn" }],
      },
    ],
    calloutTitle: "Muốn đóng góp?",
    calloutDescription:
      "Chia sẻ công cụ AI yêu thích, đề xuất cải tiến, hoặc tham gia xây dựng trung tâm tri thức AI hàng đầu của Việt Nam.",
    primaryCta: "Khám phá công cụ",
    secondaryCta: "Gửi công cụ",
  },
};

type AboutUsPageProps = {
  language?: Language;
};

export function AboutUsPage({ language = "en" }: AboutUsPageProps) {
  const t = translations[language];

  const buildSocialOptions = (member: TeamMember): SocialOption[] =>
    member.links.map((link) => {
      const icon = SocialIcons[link.type] ?? SocialIcons.default;
      const labelBuilder =
        socialLabelMap[language][link.type] ?? socialLabelMap[language].default;
      return {
        icon,
        label: labelBuilder(member.name),
        href: link.url,
      };
    });

  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      <SEO
        title={
          language === "vi"
            ? "Về Chúng Tôi - Trần Khánh Thành"
            : "About Us - Tran Khanh Thanh"
        }
        description={
          language === "vi"
            ? "Tìm hiểu về Trần Khánh Thành (khanhthanhdev), người sáng lập AI Tools Database. Đám mây tri thức AI được tuyển chọn cho Thư viện Vin Uni."
            : "Learn about Tran Khanh Thanh (khanhthanhdev), founder of AI Tools Database. AI Knowledge Cloud curated for Vin Uni Library."
        }
        keywords={
          language === "vi"
            ? [
                "Trần Khánh Thành",
                "khanhthanhdev",
                "thanhtran",
                "Thư viện Vin Uni",
                "đám mây tri thức AI",
                "đề xuất công cụ AI",
              ]
            : [
                "Tran Khanh Thanh",
                "khanhthanhdev",
                "thanhtran",
                "Vin Uni Library",
                "AI knowledge cloud",
                "AI tool recommendation",
              ]
        }
        language={language}
        structuredData={organizationData}
      />
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10">
          <BeamsBackground intensity="subtle" className="h-full w-full" />
        </div>

        <main className="container mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-xs sm:text-sm"
            >
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
                  <div
                    key={highlight}
                    className="flex items-start gap-3 text-sm sm:text-base"
                  >
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
                  <div
                    key={card.title}
                    className="flex gap-4 rounded-lg bg-muted/40 p-4"
                  >
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                      {card.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                {t.teamTitle}
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                {t.teamDescription}
              </p>
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
                        <span className="text-muted-foreground">
                          {member.location}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className="border-dashed px-2 py-1 text-[0.7rem] uppercase tracking-wide"
                      >
                        {member.focus}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto flex justify-center pb-6 pt-0">
                    <SocialButton
                      label={language === "en" ? "Connect" : "Kết nối"}
                      interaction="click"
                      options={buildSocialOptions(member)}
                      className="w-full justify-center border-2 border-primary bg-white !text-primary shadow-sm hover:bg-primary hover:!text-primary-foreground sm:w-auto"
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
            <h2 className="text-2xl font-semibold sm:text-3xl">
              {t.calloutTitle}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {t.calloutDescription}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link to="/">{t.primaryCta}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/add-tool">{t.secondaryCta}</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
