import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, Mail, Lock, User } from "lucide-react";

interface SignInDialogProps {
  children: React.ReactNode;
  language?: "en" | "vi";
}

const translations = {
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    name: "Full Name",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    namePlaceholder: "Enter your full name",
    signInButton: "Sign In",
    signUpButton: "Create Account",
    continueAsGuest: "Continue as Guest",
    or: "or",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    signInSuccess: "Successfully signed in!",
    signUpSuccess: "Account created successfully!",
    guestSuccess: "Signed in as guest!",
    signInError: "Failed to sign in. Please check your credentials.",
    signUpError: "Failed to create account. Email may already be in use.",
    guestError: "Failed to sign in as guest.",
  },
  vi: {
    signIn: "Đăng Nhập",
    signUp: "Đăng Ký",
    email: "Email",
    password: "Mật Khẩu",
    name: "Họ Tên",
    emailPlaceholder: "Nhập email của bạn",
    passwordPlaceholder: "Nhập mật khẩu",
    namePlaceholder: "Nhập họ tên của bạn",
    signInButton: "Đăng Nhập",
    signUpButton: "Tạo Tài Khoản",
    continueAsGuest: "Tiếp Tục Với Tư Cách Khách",
    or: "hoặc",
    signingIn: "Đang đăng nhập...",
    creatingAccount: "Đang tạo tài khoản...",
    signInSuccess: "Đăng nhập thành công!",
    signUpSuccess: "Tạo tài khoản thành công!",
    guestSuccess: "Đã đăng nhập với tư cách khách!",
    signInError: "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.",
    signUpError: "Tạo tài khoản thất bại. Email có thể đã được sử dụng.",
    guestError: "Đăng nhập khách thất bại.",
  },
};

export function SignInDialog({ children, language = "en" }: SignInDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Sign In Form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");

  const { signIn } = useAuthActions();
  
  const t = (key: keyof typeof translations.en) => 
    translations[language][key] || translations.en[key];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn("password", {
        email: signInEmail,
        password: signInPassword,
        flow: "signIn",
      });
      toast.success(t("signInSuccess"));
      setOpen(false);
      setSignInEmail("");
      setSignInPassword("");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(t("signInError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn("password", {
        email: signUpEmail,
        password: signUpPassword,
        name: signUpName,
        flow: "signUp",
      });
      toast.success(t("signUpSuccess"));
      setOpen(false);
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpName("");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(t("signUpError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signIn("anonymous");
      toast.success(t("guestSuccess"));
      setOpen(false);
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      toast.error(t("guestError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === "signin" ? t("signIn") : t("signUp")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "signin" 
              ? "Welcome back! Sign in to your account"
              : "Create an account to get started"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
            <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <form onSubmit={(e) => void handleSignIn(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("email")}
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="auth-input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("password")}
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="auth-input-field"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("signingIn")}
                  </>
                ) : (
                  t("signInButton")
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={(e) => void handleSignUp(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("name")}
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="auth-input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("email")}
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="auth-input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("password")}
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className="auth-input-field"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("creatingAccount")}
                  </>
                ) : (
                  t("signUpButton")
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("or")}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => void handleAnonymousSignIn()}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            t("continueAsGuest")
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
