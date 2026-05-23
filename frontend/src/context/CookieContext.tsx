import { createContext, useContext, useState, ReactNode } from 'react';

type CookieContextType = {
  isBannerVisible: boolean;
  showBanner: () => void;
  hideBanner: () => void;
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const CookieProvider = ({ children }: { children: ReactNode }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const showBanner = () => setIsBannerVisible(true);
  const hideBanner = () => setIsBannerVisible(false);

  return (
    <CookieContext.Provider value={{ isBannerVisible, showBanner, hideBanner }}>
      {children}
    </CookieContext.Provider>
  );
};

export const useCookieContext = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
};
