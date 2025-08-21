'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface SolicitacoesContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const SolicitacoesContext = createContext<SolicitacoesContextProps>({} as SolicitacoesContextProps);

export const SolicitacoesProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <SolicitacoesContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </SolicitacoesContext.Provider>
  );
};

export default function useSolicitacoes() {
  const context = useContext(SolicitacoesContext);

  if (!context) {
    throw new Error("useSolicitacoes must be used within a SolicitacoesProvider");
  }

  return context;
}
