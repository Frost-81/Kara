import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import "@/components/CookieBanner.css";

const COOKIE_CONSENT_KEY = "kara-cookie-consent";

type ConsentMode = "essential" | "all" | null;

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (mode: ConsentMode) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, mode || "essential");
    setIsVisible(false);
    
    // Here you can add logic to load analytics or other tracking scripts
    // based on the consent mode
    if (mode === "all") {
      // Load all tracking scripts
      loadAnalyticsScripts();
    }
  };

  const loadAnalyticsScripts = () => {
    // Add your analytics scripts here (Google Analytics, Hotjar, etc.)
    // Example: Google Analytics
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('consent', 'update', {'analytics_storage': 'granted'});
  };

  const handleManageCookies = () => {
    setIsVisible(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="cookie-banner"
      id="cookieBanner"
      aria-live="polite"
      aria-label={
        language === "fr"
          ? "Consentement aux cookies"
          : "Cookie consent"
      }
    >
      <div className="cookie-banner-container">
        <p className="cookie-banner-copy">
          {t.cookies.copy}
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-btn cookie-btn-secondary"
            id="cookieEssential"
            onClick={() => handleConsent("essential")}
            aria-label={t.cookies.essentialOnly}
          >
            {t.cookies.essentialOnly}
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn-primary"
            id="cookieAccept"
            onClick={() => handleConsent("all")}
            aria-label={t.cookies.accept}
          >
            {t.cookies.accept}
          </button>
        </div>
      </div>
    </aside>
  );
};

// Export function to manage cookies from other components (e.g., footer)
export const showCookieBanner = () => {
  const banner = document.getElementById("cookieBanner");
  if (banner) {
    (banner as HTMLElement).style.display = "flex";
  }
};

// Function to check current consent mode
export const getCookieConsent = (): ConsentMode => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return (consent as ConsentMode) || null;
};

// Function to reset cookie preferences
export const resetCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
};
