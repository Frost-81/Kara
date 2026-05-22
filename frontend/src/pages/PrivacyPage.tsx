import { LegalPageLayout } from "@/components/LegalPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const privacy = t.legal.privacy;

  return (
    <LegalPageLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">{privacy.title}</h1>
          <p className="text-teal-600 font-medium mb-2">{privacy.subtitle}</p>
          <p className="text-slate-500 text-sm mb-8">{privacy.lastUpdated}</p>

          <div className="space-y-6">
            {privacy.sections.map((section, index) => (
              <div key={`${section.heading}-${index}`}>
                <h2 className="font-semibold text-lg text-slate-900 mb-2">{section.heading}</h2>
                <div className="space-y-3 text-slate-600">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading}-${paragraphIndex}`} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="font-semibold text-slate-900">{privacy.responsible}</p>
            <p className="text-slate-600">{privacy.responsibleEntity}</p>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
