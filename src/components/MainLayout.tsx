import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import BeamsBackground from "./kokonutui/beams-background";
import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { translations } from "../translations";
import { SignInDialog } from "./SignInDialog";

type Language = "en" | "vi";

interface MainLayoutProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function MainLayout({ children, initialLanguage = "en" }: MainLayoutProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const seedData = useMutation(api.sampleData.seedSampleData);
  const { signOut } = useAuthActions();
  const t = (key: keyof (typeof translations)["en"]) => (translations[language] as typeof translations["en"])[key] || translations["en"][key];

  const handleSeedData = async () => {
    try {
      const result = await seedData();
      if (result === "Sample data already exists") {
        toast.info(t("dataExists"));
      } else {
        toast.success(t("dataLoaded"));
      }
    } catch {
      toast.error("Failed to load sample data.");
    }
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <BeamsBackground intensity="medium" className="h-full w-full" />
      </div>

      <Toaster position="top-right" richColors />

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 sm:h-16 items-center px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="hidden sm:inline-block">{t("title")}</span>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <Button asChild variant="ghost" size="sm" className="px-2 text-xs sm:text-sm">
              <Link to="/about-us">{t("aboutUs")}</Link>
            </Button>
            <Button onClick={() => void handleSeedData()} variant="outline" size="sm">
              {t("loadSample")}
            </Button>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Authenticated>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInDialog language={language}>
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </SignInDialog>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-8rem)] flex-1">
        <div className="container max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}