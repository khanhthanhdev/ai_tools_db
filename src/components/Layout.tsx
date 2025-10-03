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
    <div className="relative min-h-screen [--header-height:3rem] sm:[--header-height:4rem]">
      <div className="fixed inset-0 -z-10">
        <BeamsBackground intensity="medium" className="h-full w-full" />
      </div>

      <Toaster position="top-right" richColors />

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 sm:h-16 items-center justify-between px-3 sm:px-6 gap-4">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold truncate hidden sm:block">{t.title}</h1>
          </Link>

          {/* Navigation Pages - Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Button asChild variant={getVariant("/")} size="sm">
              <Link to="/">{t.browse}</Link>
            </Button>
            <Button asChild variant={getVariant("/about-us")} size="sm">
              <Link to="/about-us">{t.aboutUs}</Link>
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

          {/* Right side: Language & Auth */}
          <div className="flex items-center gap-1 sm:gap-2">
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

        {/* Mobile Navigation - Dropdown below logo */}
        <div className="md:hidden border-t bg-background/95">
          <div className="container px-3 py-2">
            <nav className="flex gap-1 justify-start overflow-x-auto scrollbar-hide">
              <Button asChild variant={getVariant("/")} size="sm" className="whitespace-nowrap text-xs h-8">
                <Link to="/">{t.browse}</Link>
              </Button>
              <Button asChild variant={getVariant("/about-us")} size="sm" className="whitespace-nowrap text-xs h-8">
                <Link to="/about-us">{t.aboutUs}</Link>
              </Button>
              <Authenticated>
                <Button asChild variant={getVariant("/add-tool")} size="sm" className="whitespace-nowrap text-xs h-8">
                  <Link to="/add-tool">{t.addTool}</Link>
                </Button>
                <Button asChild variant={getVariant("/my-tools")} size="sm" className="whitespace-nowrap text-xs h-8">
                  <Link to="/my-tools">{t.myTools}</Link>
                </Button>
                <Button asChild variant={getVariant("/stats")} size="sm" className="whitespace-nowrap text-xs h-8">
                  <Link to="/stats">{t.stats}</Link>
                </Button>
              </Authenticated>
            </nav>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-8rem)] flex-1">
        {children}
      </main>
    </div>
  );
}
