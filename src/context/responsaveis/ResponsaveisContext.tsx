'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface ResponsaveisContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const ResponsaveisContext = createContext<ResponsaveisContextProps>({} as ResponsaveisContextProps);

export const ResponsaveisProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <ResponsaveisContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </ResponsaveisContext.Provider>
  );
};

export default function useResponsaveis() {
  const context = useContext(ResponsaveisContext);

  if (!context) {
    throw new Error("useResponsaveis must be used within a ResponsaveisProvider");
  }

  return context;
}
