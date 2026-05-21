import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import translations, { type Language, type Translation } from "@/translations";

export type { Language };

type LanguageContextType = {
  language: Language;
  t: Translation;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "en" ? "en" : "fr";
  });

  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const value = useMemo(
    () => ({
      language,
      t: translations[language],
      toggleLanguage,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
