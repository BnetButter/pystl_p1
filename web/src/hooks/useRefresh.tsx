import React, { createContext, useContext, useState, ReactNode } from 'react';

type RefreshContextType = {
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  callRefresh: () => void;
};

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

type RefreshProviderProps = {
  children: ReactNode;
};

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [refresh, setRefresh] = useState<boolean>(false);

  const callRefresh = () => setRefresh(prev => !prev);

  return (
    <RefreshContext.Provider value={{ refresh, setRefresh, callRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = (): RefreshContextType => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
