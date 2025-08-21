'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface SolicitacaoContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const SolicitacaoContext = createContext<SolicitacaoContextProps>({} as SolicitacaoContextProps);

export const SolicitacaoProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <SolicitacaoContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </SolicitacaoContext.Provider>
  );
};

export default function useSolicitacao() {
  const context = useContext(SolicitacaoContext);

  if (!context) {
    throw new Error("useSolicitacao must be used within a SolicitacaoProvider");
  }

  return context;
}
