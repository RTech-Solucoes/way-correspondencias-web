'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface AreasContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const AreasContext = createContext<AreasContextProps>({} as AreasContextProps);

export const AreasProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <AreasContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </AreasContext.Provider>
  );
};

export default function useAreas() {
  const context = useContext(AreasContext);

  if (!context) {
    throw new Error("useAreas must be used within a AreasProvider");
  }

  return context;
}
