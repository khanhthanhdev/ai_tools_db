interface LanguageToggleProps {
  language: "en" | "vi";
  onLanguageChange: (language: "en" | "vi") => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100/80 rounded-2xl p-2">
      <button
        onClick={() => onLanguageChange("en")}
        className={`px-4 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
          language === "en"
            ? "bg-white text-blue-600 shadow-lg transform scale-105"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange("vi")}
        className={`px-4 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
          language === "vi"
            ? "bg-white text-blue-600 shadow-lg transform scale-105"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
        }`}
      >
        VI
      </button>
    </div>
  );
}
