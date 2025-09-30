import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Doc } from "../../convex/_generated/dataModel";

interface UserToolsManagerProps {
  language: "en" | "vi";
}

const translations = {
  en: {
    myTools: "My AI Tools",
    noTools: "No tools submitted yet",
    noToolsDesc: "You haven't submitted any AI tools yet. Click 'Add Tool' to get started!",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this tool?",
    deleting: "Deleting...",
    deleted: "Tool deleted successfully",
    editing: "Edit Tool",
    updating: "Updating...",
    updated: "Tool updated successfully",
    cancel: "Cancel",
    save: "Save Changes",
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
  },
  vi: {
    myTools: "Công cụ AI của tôi",
    noTools: "Chưa có công cụ nào được gửi",
    noToolsDesc: "Bạn chưa gửi công cụ AI nào. Nhấp 'Thêm công cụ' để bắt đầu!",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    confirmDelete: "Bạn có chắc chắn muốn xóa công cụ này?",
    deleting: "Đang xóa...",
    deleted: "Đã xóa công cụ thành công",
    editing: "Chỉnh sửa công cụ",
    updating: "Đang cập nhật...",
    updated: "Đã cập nhật công cụ thành công",
    cancel: "Hủy",
    save: "Lưu thay đổi",
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
  },
};

export function UserToolsManager({ language }: UserToolsManagerProps) {
  const [editingTool, setEditingTool] = useState<Doc<"aiTools"> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: "",
    tags: "",
    pricing: "free" as "free" | "freemium" | "paid",
    logoUrl: "",
  });

  const userTools = useQuery(api.aiTools.getUserTools) || [];
  const updateTool = useMutation(api.aiTools.updateTool);
  const deleteTool = useMutation(api.aiTools.deleteTool);

  const t = translations[language];

  const handleEdit = (tool: Doc<"aiTools">) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category: tool.category,
      tags: tool.tags.join(", "),
      pricing: tool.pricing,
      logoUrl: tool.logoUrl || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    setIsUpdating(true);
    const updatingToast = toast.loading(t.updating);

    try {
      await updateTool({
        toolId: editingTool._id,
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      });

      toast.dismiss(updatingToast);
      toast.success(t.updated);
      setEditingTool(null);
    } catch (error) {
      toast.dismiss(updatingToast);
      toast.error((error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!confirm(t.confirmDelete)) return;

    const deletingToast = toast.loading(t.deleting);

    try {
      await deleteTool({ toolId: toolId as any });
      toast.dismiss(deletingToast);
      toast.success(t.deleted);
    } catch (error) {
      toast.dismiss(deletingToast);
      toast.error((error as Error).message);
    }
  };

  if (userTools.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{t.noTools}</h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">{t.noToolsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.myTools}</h2>

      {editingTool && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{t.editing}</h3>
          <form onSubmit={(e) => { void handleUpdate(e); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.name}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.url}</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pricing}</label>
                <select
                  value={formData.pricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">{t.free}</option>
                  <option value="freemium">{t.freemium}</option>
                  <option value="paid">{t.paid}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.tags}</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.logoUrl}</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? t.updating : t.save}
              </button>
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {userTools.map((tool) => (
          <div key={tool._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base pr-2">{tool.name}</h3>
              <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                <button
                  onClick={() => handleEdit(tool)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={t.edit}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => { void handleDelete(tool._id); }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.delete}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tool.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{tool.category}</span>
              <span className="text-xs text-gray-500">
                {new Date(tool._creationTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
