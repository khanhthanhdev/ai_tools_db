import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageToggle } from "./LanguageToggle";
import { SignOutButton } from "../SignOutButton";
import { SignInForm } from "../SignInForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import BeamsBackground from "./kokonutui/beams-background";
import React from "react";

type Language = "en" | "vi";

const translations = {
  en: {
    title: "AI Tools Database",
    addTool: "Add Tool",
    browse: "Browse",
    myTools: "My Tools",
    stats: "Statistics",
    aboutUs: "About Us",
    signInPrompt: "Sign in to add and manage AI tools",
    signIn: "Sign in",
    signInDescription: "Sign in to add and manage AI tools",
    signInDescriptionVI: "Đăng nhập để thêm và quản lý công cụ AI",
  },
  vi: {
    title: "Cơ sở dữ liệu công cụ AI",
    addTool: "Thêm công cụ",
    browse: "Duyệt",
    myTools: "Công cụ của tôi",
    stats: "Thống kê",
    aboutUs: "Giới thiệu",
    signInPrompt: "Đăng nhập để thêm và quản lý công cụ AI",
    signIn: "Đăng nhập",
    signInDescription: "Sign in to add and manage AI tools",
    signInDescriptionVI: "Đăng nhập để thêm và quản lý công cụ AI",
  },
};

export function Layout({
  children,
  language,
  setLanguage,
}: {
  children: React.ReactNode;
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const location = useLocation();
  const t = translations[language];

  const getVariant = (path: string) => {
    return location.pathname === path ? "default" : "ghost";
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
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold truncate">{t.title}</h1>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            <Button asChild variant={getVariant("/")} size="sm">
              <Link to="/">{t.browse}</Link>
            </Button>
            <Authenticated>
              <Button asChild variant={getVariant("/add-tool")} size="sm">
                <Link to="/add-tool">{t.addTool}</Link>
              </Button>
              <Button asChild variant={getVariant("/my-tools")} size="sm">
                <Link to="/my-tools">{t.myTools}</Link>
              </Button>
              <Button asChild variant={getVariant("/stats")} size="sm">
                <Link to="/stats">{t.stats}</Link>
              </Button>
            </Authenticated>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <Button asChild variant="ghost" size="sm" className="px-2 text-xs sm:text-sm">
              <Link to="/about-us">{t.aboutUs}</Link>
            </Button>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-sm text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4">
                    {t.signIn}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.signInPrompt}</DialogTitle>
                    <DialogDescription>
                      {language === "en"
                        ? t.signInDescription
                        : t.signInDescriptionVI}
                    </DialogDescription>
                  </DialogHeader>
                  <SignInForm />
                </DialogContent>
              </Dialog>
            </Unauthenticated>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <Authenticated>
        <div className="sticky top-12 sm:top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <div className="container px-3 sm:px-6">
            <nav className="flex gap-1 justify-center overflow-x-auto py-2 scrollbar-hide">
              <Button asChild variant={getVariant("/")} size="sm" className="whitespace-nowrap flex-shrink-0">
                <Link to="/">📂 {t.browse}</Link>
              </Button>
              <Button asChild variant={getVariant("/add-tool")} size="sm" className="whitespace-nowrap flex-shrink-0">
                <Link to="/add-tool">➕ {t.addTool}</Link>
              </Button>
              <Button asChild variant={getVariant("/my-tools")} size="sm" className="whitespace-nowrap flex-shrink-0">
                <Link to="/my-tools">🛠️ {t.myTools}</Link>
              </Button>
              <Button asChild variant={getVariant("/stats")} size="sm" className="whitespace-nowrap flex-shrink-0">
                <Link to="/stats">📊 {t.stats}</Link>
              </Button>
            </nav>
          </div>
        </div>
      </Authenticated>

      <main className="min-h-[calc(100vh-8rem)] flex-1">
        {children}
      </main>
    </div>
  );
}