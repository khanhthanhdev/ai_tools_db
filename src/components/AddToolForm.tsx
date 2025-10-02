import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { X, AlertCircle, Loader2, Sparkles, Link2, FileText, Tag, DollarSign, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import useDebounce from "../hooks/use-debounce";

interface AddToolFormProps {
  language: "en" | "vi";
  onClose: () => void;
}

const translations = {
  en: {
    addTool: "Add New AI Tool",
    name: "Tool Name",
    description: "Description",
    url: "Website URL",
    category: "Category",
    tags: "Tags (comma separated)",
    pricing: "Pricing Model",
    logoUrl: "Logo URL (optional)",
    free: "Free",
    freemium: "Freemium",
    paid: "Paid",
    submit: "Add Tool",
    cancel: "Cancel",
    submitting: "Adding Tool...",
    success: "Tool added successfully and is now live!",
    error: "Error adding tool",
    checkingDuplicate: "Checking for duplicates...",
    duplicateFound: "This tool already exists in our database",
    validationError: "Please check your input",
    nameRequired: "Tool name is required",
    descriptionRequired: "Description is required",
    urlRequired: "Website URL is required",
    categoryRequired: "Category is required",
    invalidUrl: "Please enter a valid URL (must start with http:// or https://)",
    urlInUse: "This URL is already registered",
    saving: "Saving to database...",
    saved: "Successfully saved to database!",
  },
  vi: {
    addTool: "Thêm công cụ AI mới",
    name: "Tên công cụ",
    description: "Mô tả",
    url: "URL trang web",
    category: "Danh mục",
    tags: "Thẻ (phân cách bằng dấu phẩy)",
    pricing: "Mô hình giá",
    logoUrl: "URL logo (tùy chọn)",
    free: "Miễn phí",
    freemium: "Freemium",
    paid: "Trả phí",
    submit: "Thêm công cụ",
    cancel: "Hủy",
    submitting: "Đang thêm công cụ...",
    success: "Công cụ đã được thêm thành công và hiện đã có sẵn!",
    error: "Lỗi khi thêm công cụ",
    checkingDuplicate: "Đang kiểm tra trùng lặp...",
    duplicateFound: "Công cụ này đã tồn tại trong cơ sở dữ liệu của chúng tôi",
    validationError: "Vui lòng kiểm tra thông tin nhập vào",
    nameRequired: "Tên công cụ là bắt buộc",
    descriptionRequired: "Mô tả là bắt buộc",
    urlRequired: "URL trang web là bắt buộc",
    categoryRequired: "Danh mục là bắt buộc",
    invalidUrl: "Vui lòng nhập URL hợp lệ (phải bắt đầu bằng http:// hoặc https://)",
    urlInUse: "URL này đã được đăng ký",
    saving: "Đang lưu vào cơ sở dữ liệu...",
    saved: "Đã lưu thành công vào cơ sở dữ liệu!",
  },
};

export function AddToolForm({ language, onClose }: AddToolFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: "",
    tags: "",
    pricing: "free" as "free" | "freemium" | "paid",
    logoUrl: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debounce name and URL for duplicate checking (wait 400ms after user stops typing)
  const debouncedName = useDebounce(formData.name.trim(), 400);
  const debouncedUrl = useDebounce(formData.url.trim(), 400);

  const trimmedName = debouncedName;
  const trimmedUrl = debouncedUrl;

  const duplicateArgs = useMemo(() => {
    // Only check if we have at least 2 characters for name or a URL
    if ((!trimmedName || trimmedName.length < 2) && !trimmedUrl) {
      return "skip" as const;
    }

    return {
      name: trimmedName || "",
      url: trimmedUrl || "",
    };
  }, [trimmedName, trimmedUrl]);
  
  const addTool = useMutation(api.aiTools.addTool);
  const checkDuplicate = useQuery(api.aiTools.checkDuplicate, duplicateArgs);
  const isCheckingDuplicate = duplicateArgs !== "skip" && checkDuplicate === undefined;
  
  // Separate checking states for better UX
  const isTypingName = formData.name.trim() !== debouncedName;
  const isTypingUrl = formData.url.trim() !== debouncedUrl;
  
  const duplicateInfo = useMemo(() => {
    if (!checkDuplicate) {
      return {
        isDuplicate: false,
        nameDuplicate: false,
        urlDuplicate: false,
        nameMessage: undefined as string | undefined,
        urlMessage: undefined as string | undefined,
        existingNameTool: undefined as string | undefined,
        existingUrlTool: undefined as string | undefined,
        fallbackReason: undefined as string | undefined,
      };
    }

    const reason = checkDuplicate.reason;
    const reasonLower = reason?.toLowerCase() ?? "";

    const urlDuplicate = Boolean(
      checkDuplicate.urlDuplicate ?? (reasonLower.includes("url") && !!trimmedUrl)
    );
    const nameDuplicate = Boolean(
      checkDuplicate.nameDuplicate ?? (reasonLower.includes("name") && !!trimmedName)
    );

    const urlMessage =
      checkDuplicate.urlDuplicateReason ??
      (urlDuplicate ? reason : undefined);
    const nameMessage =
      checkDuplicate.nameDuplicateReason ??
      (nameDuplicate ? reason : undefined);

    const existingUrlTool =
      checkDuplicate.existingUrlTool ??
      (urlDuplicate ? checkDuplicate.existingTool : undefined);
    const existingNameTool =
      checkDuplicate.existingNameTool ??
      (nameDuplicate ? checkDuplicate.existingTool : undefined);

    return {
      isDuplicate: Boolean(checkDuplicate.isDuplicate),
      nameDuplicate,
      urlDuplicate,
      nameMessage,
      urlMessage,
      existingNameTool,
      existingUrlTool,
      fallbackReason: reason,
    };
  }, [checkDuplicate, trimmedName, trimmedUrl]);

  const hasNameDuplicate = duplicateInfo.nameDuplicate;
  const hasUrlDuplicate = duplicateInfo.urlDuplicate;
  
  // Show spinner when either typing or checking
  const isCheckingNameDuplicate = isTypingName || (isCheckingDuplicate && Boolean(trimmedName) && trimmedName.length >= 2);
  const isCheckingUrlDuplicate = isTypingUrl || (isCheckingDuplicate && Boolean(trimmedUrl));
  
  const t = translations[language];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = t.nameRequired;
    }
    if (!formData.description.trim()) {
      errors.description = t.descriptionRequired;
    }
    if (!formData.url.trim()) {
      errors.url = t.urlRequired;
    } else {
      try {
        const url = new URL(formData.url.trim());
        // Check if URL uses http or https protocol
        if (!url.protocol.match(/^https?:$/)) {
          errors.url = t.invalidUrl;
        }
      } catch {
        errors.url = t.invalidUrl;
      }
    }
    if (!formData.category.trim()) {
      errors.category = t.categoryRequired;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t.validationError);
      return;
    }
    
    // Check duplicates on the actual current values (not debounced) before submitting
    if (duplicateInfo.isDuplicate) {
      const duplicateMessages = [
        duplicateInfo.urlDuplicate && duplicateInfo.urlMessage
          ? `${duplicateInfo.urlMessage}${duplicateInfo.existingUrlTool ? `: "${duplicateInfo.existingUrlTool}"` : ""}`
          : null,
        duplicateInfo.nameDuplicate && duplicateInfo.nameMessage
          ? `${duplicateInfo.nameMessage}${duplicateInfo.existingNameTool ? `: "${duplicateInfo.existingNameTool}"` : ""}`
          : null,
      ].filter(Boolean);

      toast.error(t.duplicateFound, {
        description: duplicateMessages.join(" • ") || duplicateInfo.fallbackReason,
        duration: 5000,
      });
      return;
    }
    
    // Wait for duplicate check to complete if still checking
    if (isCheckingDuplicate) {
      toast.info(t.checkingDuplicate, {
        description: "Please wait while we verify your submission...",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Show saving feedback
    const savingToast = toast.loading(t.saving);
    
    try {
      const result = await addTool({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        category: formData.category.trim(),
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        language,
        logoUrl: formData.logoUrl.trim() || undefined,
      });
      
      // Dismiss loading toast and show success
      toast.dismiss(savingToast);
      toast.success(t.saved, {
        description: result.message,
        duration: 4000,
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        url: "",
        category: "",
        tags: "",
        pricing: "free",
        logoUrl: "",
      });
      setValidationErrors({});
      
      onClose();
    } catch (error) {
      toast.dismiss(savingToast);
      const errorMessage = (error as Error).message;
      toast.error(t.error, {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto border-2 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="relative overflow-hidden">
          {/* Header gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5" />
          
          <div className="relative flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">
                    {t.addTool}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share an amazing AI tool with the community
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 ml-2 hover:bg-destructive/10 hover:text-destructive rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress indicator */}
          <motion.div 
            className="mt-4 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Quick & Easy
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Instant Publish
            </Badge>
          </motion.div>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-8">
          {/* Section 1: Basic Info */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</div>
              <span>Basic Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t.name} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`transition-all ${(validationErrors.name || hasNameDuplicate) ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    placeholder="e.g., ChatGPT, Midjourney"
                  />
                  {isCheckingNameDuplicate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  )}
                  {formData.name && !validationErrors.name && !hasNameDuplicate && !isCheckingNameDuplicate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {hasNameDuplicate && !validationErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {duplicateInfo.nameMessage ?? t.duplicateFound}
                      {duplicateInfo.existingNameTool ? `: "${duplicateInfo.existingNameTool}"` : ""}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="url" className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="w-4 h-4 text-primary" />
                  {t.url} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="url"
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className={`transition-all ${(validationErrors.url || hasUrlDuplicate) ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    placeholder="https://example.com"
                  />
                  {isCheckingUrlDuplicate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
                      title="Checking URL..."
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  )}
                  {formData.url && !validationErrors.url && !hasUrlDuplicate && !isCheckingUrlDuplicate && (() => {
                    try {
                      const url = new URL(formData.url.trim());
                      return url.protocol.match(/^https?:$/);
                    } catch {
                      return false;
                    }
                  })() && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      title="URL is valid and available"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.url && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.url}
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {hasUrlDuplicate && !validationErrors.url && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>{t.urlInUse}</strong>
                          {duplicateInfo.existingUrlTool && (
                            <span className="block mt-1">
                              Already used by: <span className="font-semibold">"{duplicateInfo.existingUrlTool}"</span>
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              {t.description} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`transition-all resize-none ${validationErrors.description ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
              placeholder="Describe what this AI tool does and how it helps users..."
            />
            <div className="flex justify-between items-center">
              <AnimatePresence>
                {validationErrors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.description}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.description.length} characters
              </p>
            </div>
          </motion.div>

          {/* Section 2: Categorization */}
          <motion.div 
            className="space-y-6 pt-6 border-t"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</div>
              <span>Categorization & Pricing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-primary" />
                  {t.category} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={`transition-all ${validationErrors.category ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    placeholder="e.g., Writing & Content, Image Generation"
                  />
                  {formData.category && !validationErrors.category && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.category && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.category}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricing" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {t.pricing} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.pricing} onValueChange={(value) => handleInputChange("pricing", value)}>
                  <SelectTrigger className="transition-all focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        <span>🆓</span>
                        <span>{t.free}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="freemium">
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span>{t.freemium}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <span>💎</span>
                        <span>{t.paid}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Additional Details */}
          <motion.div 
            className="space-y-6 pt-6 border-t"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</div>
              <span>Additional Details (Optional)</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {t.tags}
                </Label>
                <Input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="transition-all focus-visible:ring-primary"
                  placeholder="AI, Machine Learning, Automation, Creative"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  {formData.tags && (
                    <Badge variant="secondary" className="text-xs">
                      {formData.tags.split(',').filter(t => t.trim()).length} tags
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  {t.logoUrl}
                </Label>
                <div className="relative">
                  <Input
                    id="logoUrl"
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    className="transition-all focus-visible:ring-primary"
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.logoUrl && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Provide a direct link to the tool's logo image</p>
              </div>
            </div>
          </motion.div>

          {/* Duplicate Warning */}
          <AnimatePresence>
            {duplicateInfo.isDuplicate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-2">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold text-base">{t.duplicateFound}</p>
                      {duplicateInfo.urlDuplicate && (
                        <p className="text-sm opacity-90">
                          {duplicateInfo.urlMessage ?? t.duplicateFound}
                          {duplicateInfo.existingUrlTool ? `: "${duplicateInfo.existingUrlTool}"` : ""}
                        </p>
                      )}
                      {duplicateInfo.nameDuplicate && (
                        <p className="text-sm opacity-90">
                          {duplicateInfo.nameMessage ?? t.duplicateFound}
                          {duplicateInfo.existingNameTool ? `: "${duplicateInfo.existingNameTool}"` : ""}
                        </p>
                      )}
                      {!duplicateInfo.urlDuplicate && !duplicateInfo.nameDuplicate && duplicateInfo.fallbackReason && (
                        <p className="text-sm opacity-90">{duplicateInfo.fallbackReason}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Actions */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 pt-8 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || duplicateInfo.isDuplicate || Object.keys(validationErrors).length > 0}
              className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t.submit}
                  </>
                )}
              </span>
              {!isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="sm:w-32 h-12 border-2"
              size="lg"
            >
              {t.cancel}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}
