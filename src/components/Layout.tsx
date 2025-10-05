import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "./ui/button";
import BeamsBackground from "./kokonutui/beams-background";
import { SignInDialog } from "./SignInDialog";
import { useAuthActions } from "@convex-dev/auth/react";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type Language = "en" | "vi";

const translations = {
  en: {
    title: "AI Tools Database",
    addTool: "Add Tool",
    browse: "Browse",
    favourites: "Favourites",
    stats: "Statistics",
    aboutUs: "About Us",
    signInPrompt: "Sign in to add and manage AI tools",
    signIn: "Sign in",
    signOut: "Sign Out",
    signInDescription: "Sign in to add and manage AI tools",
    signInDescriptionVI: "Đăng nhập để thêm và quản lý công cụ AI",
  },
  vi: {
    title: "Cơ sở dữ liệu công cụ AI",
    addTool: "Thêm công cụ",
    browse: "Duyệt",
    favourites: "Yêu thích",
    stats: "Thống kê",
    aboutUs: "Giới thiệu",
    signInPrompt: "Đăng nhập để thêm và quản lý công cụ AI",
    signIn: "Đăng nhập",
    signOut: "Đăng Xuất",
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
  const { signOut } = useAuthActions();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getVariant = (path: string) => {
    return location.pathname === path ? "default" : "ghost";
  };

  const handleSignOut = () => {
    void signOut();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
              <Button asChild variant={getVariant("/favourites")} size="sm">
                <Link to="/favourites">{t.favourites}</Link>
              </Button>
              <Button asChild variant={getVariant("/stats")} size="sm">
                <Link to="/stats">{t.stats}</Link>
              </Button>
            </Authenticated>
          </nav>

          {/* Right side: Language & Auth */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Authenticated>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="shadow-sm">
                  {t.signOut}
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignInDialog language={language}>
                  <Button size="sm" className="shadow-sm">
                    {t.signIn}
                  </Button>
                </SignInDialog>
              </Unauthenticated>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>{t.title}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-3 mt-6">
                  <Button asChild variant={getVariant("/")} size="default" className="justify-start" onClick={closeMobileMenu}>
                    <Link to="/">{t.browse}</Link>
                  </Button>
                  <Button asChild variant={getVariant("/about-us")} size="default" className="justify-start" onClick={closeMobileMenu}>
                    <Link to="/about-us">{t.aboutUs}</Link>
                  </Button>
                  <Authenticated>
                    <Button asChild variant={getVariant("/add-tool")} size="default" className="justify-start" onClick={closeMobileMenu}>
                      <Link to="/add-tool">{t.addTool}</Link>
                    </Button>
                    <Button asChild variant={getVariant("/favourites")} size="default" className="justify-start" onClick={closeMobileMenu}>
                      <Link to="/favourites">{t.favourites}</Link>
                    </Button>
                    <Button asChild variant={getVariant("/stats")} size="default" className="justify-start" onClick={closeMobileMenu}>
                      <Link to="/stats">{t.stats}</Link>
                    </Button>
                    <div className="border-t pt-3 mt-3">
                      <Button onClick={() => { handleSignOut(); closeMobileMenu(); }} variant="outline" size="default" className="w-full">
                        {t.signOut}
                      </Button>
                    </div>
                  </Authenticated>
                  <Unauthenticated>
                    <div className="border-t pt-3 mt-3">
                      <SignInDialog language={language}>
                        <Button size="default" className="w-full">
                          {t.signIn}
                        </Button>
                      </SignInDialog>
                    </div>
                  </Unauthenticated>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-8rem)] flex-1">
        {children}
      </main>
    </div>
  );
}
