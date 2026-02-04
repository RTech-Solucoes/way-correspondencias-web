'use client';

import { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { ObrigacaoResponse } from '@/api/obrigacao/types';
import { FiltersState } from '@/components/obrigacoes/hooks/use-obrigacoes';

interface ObrigacoesUIContextType {
  // Estados de modais
  showObrigacaoModal: boolean;
  setShowObrigacaoModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  
  // Estados relacionados a obrigações
  obrigacaoToDelete: ObrigacaoResponse | null;
  setObrigacaoToDelete: Dispatch<SetStateAction<ObrigacaoResponse | null>>;
  
  // Filtros
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  
  // Funções de callback
  loadObrigacoes: () => Promise<void>;
}

const ObrigacoesUIContext = createContext<ObrigacoesUIContextType | undefined>(undefined);

interface ObrigacoesUIProviderProps {
  children: ReactNode;
  value: ObrigacoesUIContextType;
}

export function ObrigacoesUIProvider({ children, value }: ObrigacoesUIProviderProps) {
  return (
    <ObrigacoesUIContext.Provider value={value}>
      {children}
    </ObrigacoesUIContext.Provider>
  );
}

export function useObrigacoesUI() {
  const context = useContext(ObrigacoesUIContext);
  if (context === undefined) {
    throw new Error('useObrigacoesUI must be used within an ObrigacoesUIProvider');
  }
  return context;
}
