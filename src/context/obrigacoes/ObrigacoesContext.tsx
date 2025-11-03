'use client'

import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";
import { ObrigacaoResponse} from '@/api/obrigacao/types';

interface FiltersState {
  titulo: string;
  responsavel: string;
  contrato: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface ObrigacoesContextProps {
  obrigacoes: ObrigacaoResponse[];
  setObrigacoes: Dispatch<SetStateAction<ObrigacaoResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedObrigacao: ObrigacaoResponse | null;
  setSelectedObrigacao: Dispatch<SetStateAction<ObrigacaoResponse | null>>;
  showObrigacaoModal: boolean;
  setShowObrigacaoModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  obrigacaoToDelete: ObrigacaoResponse | null;
  setObrigacaoToDelete: Dispatch<SetStateAction<ObrigacaoResponse | null>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;
  totalElements: number;
  setTotalElements: Dispatch<SetStateAction<number>>;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}

const ObrigacoesContext = createContext<ObrigacoesContextProps | undefined>(undefined);

export function ObrigacoesProvider({children}: { children: ReactNode }) {
  const [obrigacoes, setObrigacoes] = useState<ObrigacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoResponse | null>(null);
  const [showObrigacaoModal, setShowObrigacaoModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [obrigacaoToDelete, setObrigacaoToDelete] = useState<ObrigacaoResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    titulo: '',
    responsavel: '',
    contrato: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  return (
    <ObrigacoesContext.Provider
      value={{
        obrigacoes,
        setObrigacoes,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        selectedObrigacao,
        setSelectedObrigacao,
        showObrigacaoModal,
        setShowObrigacaoModal,
        showFilterModal,
        setShowFilterModal,
        showDeleteDialog,
        setShowDeleteDialog,
        obrigacaoToDelete,
        setObrigacaoToDelete,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        totalElements,
        setTotalElements,
        filters,
        setFilters,
      }}
    >
      {children}
    </ObrigacoesContext.Provider>
  );
}

export function useObrigacoes() {
  const context = useContext(ObrigacoesContext);
  if (context === undefined) {
    throw new Error('useObrigacoes must be used within an ObrigacoesProvider');
  }
  return context;
}

