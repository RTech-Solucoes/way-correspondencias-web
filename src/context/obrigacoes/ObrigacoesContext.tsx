'use client'

import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";
import {ObrigacaoContratualResponse} from '@/api/obrigacao-contratual/types';

interface FiltersState {
  titulo: string;
  responsavel: string;
  contrato: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface ObrigacoesContextProps {
  obrigacoes: ObrigacaoContratualResponse[];
  setObrigacoes: Dispatch<SetStateAction<ObrigacaoContratualResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedObrigacao: ObrigacaoContratualResponse | null;
  setSelectedObrigacao: Dispatch<SetStateAction<ObrigacaoContratualResponse | null>>;
  showObrigacaoModal: boolean;
  setShowObrigacaoModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  obrigacaoToDelete: ObrigacaoContratualResponse | null;
  setObrigacaoToDelete: Dispatch<SetStateAction<ObrigacaoContratualResponse | null>>;
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
  const [obrigacoes, setObrigacoes] = useState<ObrigacaoContratualResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoContratualResponse | null>(null);
  const [showObrigacaoModal, setShowObrigacaoModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [obrigacaoToDelete, setObrigacaoToDelete] = useState<ObrigacaoContratualResponse | null>(null);
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

