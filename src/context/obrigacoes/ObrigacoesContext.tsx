'use client'

import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState, useCallback, useEffect} from "react";
import { ObrigacaoResponse, ObrigacaoFiltroRequest} from '@/api/obrigacao/types';
import obrigacaoClient from '@/api/obrigacao/client';

interface FiltersState {
  titulo: string;
  responsavel: string;
  contrato: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  idStatusObrigacao: string;
  idAreaAtribuida: string;
  dtLimiteInicio: string;
  dtLimiteFim: string;
  dtInicioInicio: string;
  dtInicioFim: string;
  idTema: string;
  idTipoClassificacao: string;
  idTipoPeriodicidade: string;
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
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  loadObrigacoes: () => Promise<void>;
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
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FiltersState>({
    titulo: '',
    responsavel: '',
    contrato: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    idStatusObrigacao: '',
    idAreaAtribuida: '',
    dtLimiteInicio: '',
    dtLimiteFim: '',
    dtInicioInicio: '',
    dtInicioFim: '',
    idTema: '',
    idTipoClassificacao: '',
    idTipoPeriodicidade: '',
  });

  const handleSort = useCallback((field: string) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection]);

  const loadObrigacoes = useCallback(async () => {
    setLoading(true);
    try {
      const filtro: ObrigacaoFiltroRequest = {
        filtro: searchQuery || null,
        idStatusSolicitacao: filters.idStatusObrigacao ? parseInt(filters.idStatusObrigacao) : null,
        idAreaAtribuida: filters.idAreaAtribuida ? parseInt(filters.idAreaAtribuida) : null,
        dtLimiteInicio: filters.dtLimiteInicio || null,
        dtLimiteFim: filters.dtLimiteFim || null,
        dtInicioInicio: filters.dtInicioInicio || null,
        dtInicioFim: filters.dtInicioFim || null,
        idTema: filters.idTema ? parseInt(filters.idTema) : null,
        idTipoClassificacao: filters.idTipoClassificacao ? parseInt(filters.idTipoClassificacao) : null,
        idTipoPeriodicidade: filters.idTipoPeriodicidade ? parseInt(filters.idTipoPeriodicidade) : null,
        page: currentPage,
        size: 8,
        sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
      };

      const response = await obrigacaoClient.buscarLista(filtro);
      setObrigacoes(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Erro ao carregar obrigações:', error);
      setObrigacoes([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    loadObrigacoes();
  }, [loadObrigacoes]);

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
        sortField,
        sortDirection,
        handleSort,
        loadObrigacoes,
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

