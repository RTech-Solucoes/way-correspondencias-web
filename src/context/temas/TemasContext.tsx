'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface TemasContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const TemasContext = createContext<TemasContextProps>({} as TemasContextProps);

export const TemasProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <TemasContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </TemasContext.Provider>
  );
};

export default function useTemas() {
  const context = useContext(TemasContext);

  if (!context) {
    throw new Error("useTemas must be used within a TemasProvider");
  }

  return context;
}
