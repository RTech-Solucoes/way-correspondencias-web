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
import { SolicitacaoResponse, SolicitacaoFilterParams } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { temasClient } from '@/api/temas/client';
import { areasClient } from '@/api/areas/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  identificacao: string;
  responsavel: string;
  tema: string;
  area: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface SolicitacoesContextProps {
  solicitacoes: SolicitacaoResponse[];
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  areas: AreaResponse[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedSolicitacao: SolicitacaoResponse | null;
  setSelectedSolicitacao: Dispatch<SetStateAction<SolicitacaoResponse | null>>;
  showSolicitacaoModal: boolean;
  setShowSolicitacaoModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  solicitacaoToDelete: SolicitacaoResponse | null;
  setSolicitacaoToDelete: Dispatch<SetStateAction<SolicitacaoResponse | null>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  totalElements: number;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  hasActiveFilters: boolean;
  loadSolicitacoes: () => Promise<void>;
  loadResponsaveis: () => Promise<void>;
  loadTemas: () => Promise<void>;
  loadAreas: () => Promise<void>;
  handleEdit: (solicitacao: SolicitacaoResponse) => void;
  handleDelete: (solicitacao: SolicitacaoResponse) => void;
  confirmDelete: () => Promise<void>;
  handleSolicitacaoSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusText: (status: string) => string;
}

const SolicitacoesContext = createContext<SolicitacoesContextProps>({} as SolicitacoesContextProps);

export const SolicitacoesProvider = ({ children }: { children: ReactNode }) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoResponse | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [solicitacaoToDelete, setSolicitacaoToDelete] = useState<SolicitacaoResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<FiltersState>({
    identificacao: '',
    responsavel: '',
    tema: '',
    area: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadSolicitacoes();
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);

      if (activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const result = await solicitacoesClient.buscarPorCdIdentificacao(activeFilters.identificacao);
        setSolicitacoes([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else if (activeFilters.responsavel && !activeFilters.identificacao && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavel(parseInt(activeFilters.responsavel));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.tema && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorTema(parseInt(activeFilters.tema));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.area && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorArea(parseInt(activeFilters.area));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.status && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorStatus(activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.responsavel && activeFilters.status && !activeFilters.identificacao && !activeFilters.tema && !activeFilters.area && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavelEStatus(parseInt(activeFilters.responsavel), activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.dateFrom && activeFilters.dateTo && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorPeriodo(
          activeFilters.dateFrom + 'T00:00:00',
          activeFilters.dateTo + 'T23:59:59'
        );
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.identificacao) filterParts.push(activeFilters.identificacao);

        const params: SolicitacaoFilterParams = {
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 10,
        };
        const response = await solicitacoesClient.buscarPorFiltro(params);
        setSolicitacoes(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (error) {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const response = await responsaveisClient.buscarPorFiltro({ size: 100 });
      setResponsaveis(response.content);
    } catch (error) {
    }
  };

  const loadTemas = async () => {
    try {
      const response = await temasClient.buscarPorFiltro({ size: 100 });
      setTemas(response.content);
    } catch (error) {
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areasClient.buscarPorFiltro({ size: 100 });
      setAreas(response.content);
    } catch (error) {
    }
  };

  const handleEdit = (solicitacao: SolicitacaoResponse) => {
    setSelectedSolicitacao(solicitacao);
    setShowSolicitacaoModal(true);
  };

  const handleDelete = (solicitacao: SolicitacaoResponse) => {
    setSolicitacaoToDelete(solicitacao);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (solicitacaoToDelete) {
      try {
        await solicitacoesClient.deletar(solicitacaoToDelete.idSolicitacao);
        toast.success("Solicitação excluída com sucesso");
        loadSolicitacoes();
      } catch (error) {
        toast.error("Erro ao excluir solicitação");
      } finally {
        setShowDeleteDialog(false);
        setSolicitacaoToDelete(null);
      }
    }
  };

  const handleSolicitacaoSave = () => {
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
    loadSolicitacoes();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      identificacao: '',
      responsavel: '',
      tema: '',
      area: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'P':
        return 'secondary';
      case 'V':
      case 'T':
        return 'destructive';
      case 'A':
      case 'R':
      case 'O':
      case 'S':
        return 'default';
      case 'C':
        return 'default';
      case 'X':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'P':
        return 'Pré-análise';
      case 'V':
        return 'Vencido Regulatório';
      case 'A':
        return 'Em análise Área Técnica';
      case 'T':
        return 'Vencido Área Técnica';
      case 'R':
        return 'Análise Regulatória';
      case 'O':
        return 'Em Aprovação';
      case 'S':
        return 'Em Assinatura';
      case 'C':
        return 'Concluído';
      case 'X':
        return 'Arquivado';
      default:
        return status;
    }
  };

  return (
    <SolicitacoesContext.Provider
      value={{
        solicitacoes,
        responsaveis,
        temas,
        areas,
        loading,
        searchQuery,
        setSearchQuery,
        selectedSolicitacao,
        setSelectedSolicitacao,
        showSolicitacaoModal,
        setShowSolicitacaoModal,
        showFilterModal,
        setShowFilterModal,
        showDeleteDialog,
        setShowDeleteDialog,
        solicitacaoToDelete,
        setSolicitacaoToDelete,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        filters,
        setFilters,
        activeFilters,
        hasActiveFilters,
        loadSolicitacoes,
        loadResponsaveis,
        loadTemas,
        loadAreas,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleSolicitacaoSave,
        applyFilters,
        clearFilters,
        getStatusBadgeVariant,
        getStatusText
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
