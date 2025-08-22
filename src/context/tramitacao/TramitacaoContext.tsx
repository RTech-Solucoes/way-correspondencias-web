'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";
import { TramitacaoResponse } from '@/api/tramitacao/types';
import { tramitacaoClient } from '@/api/tramitacao/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  solicitacao: string;
  responsavelOrigem: string;
  responsavelDestino: string;
  ativo: string;
}

export interface TramitacaoContextProps {
  tramitacoes: TramitacaoResponse[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  sortField: keyof TramitacaoResponse | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  totalElements: number;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  hasActiveFilters: boolean;
  loadTramitacoes: () => Promise<void>;
  handleSort: (field: keyof TramitacaoResponse) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

const TramitacaoContext = createContext<TramitacaoContextProps>({} as TramitacaoContextProps);

export const TramitacaoProvider = ({ children }: { children: ReactNode }) => {
  const [tramitacoes, setTramitacoes] = useState<TramitacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof TramitacaoResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<FiltersState>({
    solicitacao: '',
    responsavelOrigem: '',
    responsavelDestino: '',
    ativo: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (tramitacoes.length > 0 || activeFilters.solicitacao || activeFilters.responsavelOrigem || activeFilters.responsavelDestino || debouncedSearchQuery) {
      loadTramitacoes();
    }
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadTramitacoes = async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.solicitacao) filterParts.push(activeFilters.solicitacao);
      if (activeFilters.responsavelOrigem) filterParts.push(activeFilters.responsavelOrigem);
      if (activeFilters.responsavelDestino) filterParts.push(activeFilters.responsavelDestino);

      const filtro = filterParts.join(' ');

      const response = await tramitacaoClient.buscarPorFiltro({
        filtro: filtro || undefined,
        page: currentPage,
        size: 10,
        sort: sortField ? `${sortField},${sortDirection}` : undefined
      });

      setTramitacoes(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error("Erro ao carregar tramitações");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof TramitacaoResponse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      solicitacao: '',
      responsavelOrigem: '',
      responsavelDestino: '',
      ativo: ''
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <TramitacaoContext.Provider
      value={{
        tramitacoes,
        loading,
        searchQuery,
        setSearchQuery,
        showFilterModal,
        setShowFilterModal,
        sortField,
        sortDirection,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        filters,
        setFilters,
        activeFilters,
        hasActiveFilters,
        loadTramitacoes,
        handleSort,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </TramitacaoContext.Provider>
  );
};

export const useTramitacao = (): TramitacaoContextProps => {
  const context = useContext(TramitacaoContext);
  if (!context) {
    throw new Error('useTramitacao deve ser usado dentro de um TramitacaoProvider');
  }
  return context;
};

export default useTramitacao;