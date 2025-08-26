'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import { SolicitacaoResponse } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';

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
  setSolicitacoes: Dispatch<SetStateAction<SolicitacaoResponse[]>>;
  responsaveis: ResponsavelResponse[];
  setResponsaveis: Dispatch<SetStateAction<ResponsavelResponse[]>>;
  temas: TemaResponse[];
  setTemas: Dispatch<SetStateAction<TemaResponse[]>>;
  areas: AreaResponse[];
  setAreas: Dispatch<SetStateAction<AreaResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
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
  setTotalPages: Dispatch<SetStateAction<number>>;
  totalElements: number;
  setTotalElements: Dispatch<SetStateAction<number>>;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  setActiveFilters: Dispatch<SetStateAction<FiltersState>>;
  expandedRows: Set<number>;
  setExpandedRows: Dispatch<SetStateAction<Set<number>>>;
  sortField: keyof SolicitacaoResponse | null;
  setSortField: Dispatch<SetStateAction<keyof SolicitacaoResponse | null>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>;
  hasActiveFilters: boolean;
  handleEdit: (solicitacao: SolicitacaoResponse) => void;
  handleDelete: (solicitacao: SolicitacaoResponse) => void;
  handleSolicitacaoSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  getStatusText: (status: string) => string;
  toggleRowExpansion: (solicitacaoId: number) => void;
  handleSort: (field: keyof SolicitacaoResponse) => void;
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<keyof SolicitacaoResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleEdit = (solicitacao: SolicitacaoResponse) => {
    setSelectedSolicitacao(solicitacao);
    setShowSolicitacaoModal(true);
  };

  const handleDelete = (solicitacao: SolicitacaoResponse) => {
    setSolicitacaoToDelete(solicitacao);
    setShowDeleteDialog(true);
  };

  const handleSolicitacaoSave = () => {
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
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

  const getStatusBadgeVariant = (status: string | number): "default" | "secondary" | "destructive" | "outline" => {
    const statusStr = status?.toString()?.toUpperCase();
    switch (statusStr) {
      case 'P':
      case '1':
        return 'secondary';
      case 'V':
      case 'T':
      case '2':
      case '4':
        return 'destructive';
      case 'A':
      case 'R':
      case 'O':
      case 'S':
      case '3':
      case '5':
      case '6':
      case '7':
        return 'default';
      case 'C':
      case '8':
        return 'outline';
      case 'X':
      case '9':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string | number) => {
    const statusStr = status?.toString()?.toUpperCase();
    switch (statusStr) {
      case 'P':
      case '1':
        return 'Pré-análise';
      case 'V':
      case '2':
        return 'Vencido Regulatório';
      case 'A':
      case '3':
        return 'Em análise Área Técnica';
      case 'T':
      case '4':
        return 'Vencido Área Técnica';
      case 'R':
      case '5':
        return 'Análise Regulatória';
      case 'O':
      case '6':
        return 'Em Aprovação';
      case 'S':
      case '7':
        return 'Em Assinatura';
      case 'C':
      case '8':
        return 'Concluído';
      case 'X':
      case '9':
        return 'Arquivado';
      default:
        return status?.toString() || 'N/A';
    }
  };

  const toggleRowExpansion = (solicitacaoId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(solicitacaoId)) {
      newExpandedRows.delete(solicitacaoId);
    } else {
      newExpandedRows.add(solicitacaoId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (field: keyof SolicitacaoResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  };

  return (
    <SolicitacoesContext.Provider
      value={{
        solicitacoes,
        setSolicitacoes,
        responsaveis,
        setResponsaveis,
        temas,
        setTemas,
        areas,
        setAreas,
        loading,
        setLoading,
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
        setTotalPages,
        totalElements,
        setTotalElements,
        filters,
        setFilters,
        activeFilters,
        setActiveFilters,
        expandedRows,
        setExpandedRows,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        hasActiveFilters,
        handleEdit,
        handleDelete,
        handleSolicitacaoSave,
        applyFilters,
        clearFilters,
        getStatusBadgeVariant,
        getStatusText,
        toggleRowExpansion,
        handleSort,
      }}
    >
      {children}
    </SolicitacoesContext.Provider>
  );
};

export const useSolicitacoes = () => {
  const context = useContext(SolicitacoesContext);
  if (!context) {
    throw new Error('useSolicitacoes must be used within a SolicitacoesProvider');
  }
  return context;
};
