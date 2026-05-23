import "@/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { CookieProvider } from "@/context/CookieContext";
import { Toaster } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CookieBanner } from "@/components/CookieBanner";

const HomePage = lazy(() => import("@/pages/HomePage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <LoadingSpinner label="Chargement de la page..." />
  </div>
);

function App() {
  return (
    <ErrorProvider>
      <LanguageProvider>
        <CookieProvider>
          <div className="App">
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster richColors position="top-right" />
            <CookieBanner />
          </div>
        </CookieProvider>
      </LanguageProvider>
    </ErrorProvider>
  );
}

export default App;
