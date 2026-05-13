import { createContext, useContext, useState } from 'react';
import type { ProviderProps } from '@/types/provider';

interface GuestBannerContextType {
  dismissed: boolean;
  dismiss: () => void;
}

const GuestBannerContext = createContext<GuestBannerContextType | undefined>(undefined);

export const useGuestBanner = () => {
  const ctx = useContext(GuestBannerContext);
  if (!ctx) throw new Error('useGuestBanner must be used within GuestBannerProvider');
  return ctx;
};

const GuestBannerProvider = ({ children }: ProviderProps) => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <GuestBannerContext.Provider value={{ dismissed, dismiss: () => setDismissed(true) }}>
      {children}
    </GuestBannerContext.Provider>
  );
};

export default GuestBannerProvider;
