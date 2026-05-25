import { ArrowLeft, Building2 } from "lucide-react";
import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type LegalPageLayoutProps = {
  children: ReactNode;
};

export function LegalPageLayout({ children }: LegalPageLayoutProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 text-left"
            >
              <Building2 className="w-8 h-8 text-teal-500" />
              <span className="font-heading text-xl font-bold">Kara Immobilier Service</span>
            </button>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t.nav.services === "Services" ? "Back" : "Retour"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
