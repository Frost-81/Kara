import { LegalPageLayout } from "@/components/LegalPageLayout";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMetadata } from "@/hooks/usePageMetadata";

export default function TermsPage() {
  usePageMetadata({
    title: "Conditions d'utilisation | Kara Immobilier Service",
    description: "Consultez les conditions d'utilisation applicables au site Kara Immobilier Service.",
    path: "/terms",
  });

  const { t } = useLanguage();
  const terms = t.legal.terms;

  return (
    <LegalPageLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">{terms.title}</h1>
          <p className="text-teal-600 font-medium mb-2">{terms.subtitle}</p>
          <p className="text-slate-500 text-sm mb-8">{terms.lastUpdate}</p>

          <div className="space-y-6">
            {terms.sections.map((section, index) => (
              <div key={`${section.title}-${index}`}>
                <h2 className="font-semibold text-lg text-slate-900 mb-2">{section.title}</h2>
                <p className="text-slate-600 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
