'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AnimationContextType = {
    hasAnimated: boolean;
    setHasAnimated: (value: boolean) => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <AnimationContext.Provider value={{ hasAnimated, setHasAnimated }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}
