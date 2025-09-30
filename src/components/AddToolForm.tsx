import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Alert, AlertDescription } from "./ui/alert";
import { X, AlertCircle, Loader2 } from "lucide-react";

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
    invalidUrl: "Please enter a valid URL",
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
    invalidUrl: "Vui lòng nhập URL hợp lệ",
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
  
  const addTool = useMutation(api.aiTools.addTool);
  const checkDuplicate = useQuery(
    api.aiTools.checkDuplicate,
    formData.name.trim() && formData.url.trim()
      ? { name: formData.name.trim(), url: formData.url.trim() }
      : "skip"
  );
  
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
        new URL(formData.url);
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
    
    if (checkDuplicate?.isDuplicate) {
      toast.error(`${t.duplicateFound}: ${checkDuplicate.existingTool}`);
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl mb-2">{t.addTool}</CardTitle>
            <p className="text-muted-foreground">Share an amazing AI tool with the community</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t.name} *
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={validationErrors.name ? 'border-destructive' : ''}
                placeholder="e.g., ChatGPT, Midjourney"
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">{validationErrors.name}</p>
              )}
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="url">
                {t.url} *
              </Label>
              <Input
                id="url"
                type="url"
                required
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className={validationErrors.url ? 'border-destructive' : ''}
                placeholder="https://example.com"
              />
              {validationErrors.url && (
                <p className="text-sm text-destructive">{validationErrors.url}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t.description} *
            </Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={validationErrors.description ? 'border-destructive' : ''}
              placeholder="Describe what this AI tool does and how it helps users..."
            />
            {validationErrors.description && (
              <p className="text-sm text-destructive">{validationErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">
                {t.category} *
              </Label>
              <Input
                id="category"
                type="text"
                required
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={validationErrors.category ? 'border-destructive' : ''}
                placeholder="e.g., Writing & Content, Image Generation"
              />
              {validationErrors.category && (
                <p className="text-sm text-destructive">{validationErrors.category}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricing">
                {t.pricing} *
              </Label>
              <Select value={formData.pricing} onValueChange={(value) => handleInputChange("pricing", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">{t.free}</SelectItem>
                  <SelectItem value="freemium">{t.freemium}</SelectItem>
                  <SelectItem value="paid">{t.paid}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">
              {t.tags}
            </Label>
            <Input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="AI, Machine Learning, Automation, Creative"
            />
            <p className="text-sm text-muted-foreground">Separate tags with commas. Maximum 10 tags.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">
              {t.logoUrl}
            </Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {checkDuplicate?.isDuplicate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium">{t.duplicateFound}</p>
                  <p className="text-sm">{checkDuplicate.reason}: "{checkDuplicate.existingTool}"</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || checkDuplicate?.isDuplicate || Object.keys(validationErrors).length > 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
