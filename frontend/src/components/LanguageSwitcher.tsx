import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
      data-testid="language-switcher"
    >
      <Globe className="w-4 h-4" />
      {language === "fr" ? "EN" : "FR"}
    </button>
  );
};
