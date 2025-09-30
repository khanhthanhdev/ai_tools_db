import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{t.addTool}</h3>
          <p className="text-gray-600">Share an amazing AI tool with the community</p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-gray-400 hover:text-gray-600 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t.name} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., ChatGPT, Midjourney"
            />
            {validationErrors.name && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t.url} *
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.url ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {validationErrors.url && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.url}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.description} *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
              validationErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Describe what this AI tool does and how it helps users..."
          />
          {validationErrors.description && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t.category} *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Writing & Content, Image Generation"
            />
            {validationErrors.category && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.category}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t.pricing} *
            </label>
            <select
              value={formData.pricing}
              onChange={(e) => handleInputChange("pricing", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="free">{t.free}</option>
              <option value="freemium">{t.freemium}</option>
              <option value="paid">{t.paid}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.tags}
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            placeholder="AI, Machine Learning, Automation, Creative"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="mt-2 text-sm text-gray-500">Separate tags with commas. Maximum 10 tags.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.logoUrl}
          </label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => handleInputChange("logoUrl", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {checkDuplicate?.isDuplicate && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-red-800 font-medium">
                  {t.duplicateFound}
                </p>
                <p className="text-red-700 text-sm">
                  {checkDuplicate.reason}: "{checkDuplicate.existingTool}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || checkDuplicate?.isDuplicate || Object.keys(validationErrors).length > 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t.submitting}
              </div>
            ) : (
              t.submit
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
