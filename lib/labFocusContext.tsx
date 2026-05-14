'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LabFocusContextType {
  focusedId: number | null;
  setFocusedId: (id: number | null) => void;
  handleFocus: (id: number) => void;
  handleUnfocus: () => void;
  isLabFocused: boolean;
}

const LabFocusContext = createContext<LabFocusContextType | null>(null);

export function LabFocusProvider({ children }: { children: ReactNode }) {
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const handleFocus = useCallback((id: number) => {
    setFocusedId(id);
  }, []);

  const handleUnfocus = useCallback(() => {
    setFocusedId(null);
  }, []);

  return (
    <LabFocusContext.Provider
      value={{
        focusedId,
        setFocusedId,
        handleFocus,
        handleUnfocus,
        isLabFocused: focusedId !== null,
      }}
    >
      {children}
    </LabFocusContext.Provider>
  );
}

export function useLabFocus() {
  const context = useContext(LabFocusContext);
  if (!context) {
    return {
      focusedId: null,
      setFocusedId: () => {},
      handleFocus: () => {},
      handleUnfocus: () => {},
      isLabFocused: false,
    };
  }
  return context;
}
