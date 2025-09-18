'use client'

import {createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useState} from "react";
import {SolicitacaoResponse} from '@/api/solicitacoes/types';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import {TemaResponse} from '@/api/temas/types';
import {AreaResponse} from '@/api/areas/types';
import {StatusSolicPrazoTemaForUI} from '@/api/status-prazo-tema/types';
import {statusSolicPrazoTemaClient} from '@/api/status-prazo-tema/client';
import { statusList } from "@/api/status-solicitacao/types";

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
  getStatusBadgeBg: (status: string) => string;
  getStatusText: (status: string) => string;
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

    if (statusStr?.includes('VENCIDO') || statusStr === 'T' || statusStr === '2' || statusStr === '4') {
      return 'destructive';
    }

    if (statusStr?.includes('CONCLUÍDO') || statusStr?.includes('ARQUIVADO') || statusStr === 'C' || statusStr === 'X' || statusStr === '8' || statusStr === '9') {
      return 'outline';
    }

    if (statusStr?.includes('PRÉ') || statusStr === 'P' || statusStr === '1') {
      return 'secondary';
    }

    return 'default';
  };

  const getStatusBadgeBg = (status: string | number): string => {
    const statusStr = status?.toString()?.toUpperCase();

    if (statusStr?.includes('VENCIDO') || statusStr === 'T' || statusStr === '2' || statusStr === '4') {
      return '#a80000';
    }

    if (statusStr?.includes('CONCLUÍDO') || statusStr?.includes('ARQUIVADO') || statusStr === 'C' || statusStr === 'X' || statusStr === '8' || statusStr === '9') {
      return '#008000';
    }

    if (statusStr?.includes('PRÉ') || statusStr === 'P' || statusStr === '1') {
      return '#b68500';
    }

    return '#1447e6';
  };

  const getStatusText = (status: string | number) => {

    const statusStr = status?.toString()?.toUpperCase();
    switch (statusStr) {
      case 'P':
      case '1':
        return statusList.PRE_ANALISE.label;
      case 'V':
      case '2':
        return statusList.VENCIDO_REGULATORIO.label;
      case 'A':
      case '3':
        return statusList.EM_ANALISE_AREA_TECNICA.label;
      case 'T':
      case '4':
        return statusList.VENCIDO_AREA_TECNICA.label;
      case 'R':
      case '5':
        return statusList.ANALISE_REGULATORIA.label;
      case 'O':
      case '6':
        return statusList.EM_APROVACAO.label;
      case 'S':
      case '7':
        return statusList.EM_ASSINATURA_DIRETORIA.label;
      case 'C':
      case '8':
        return statusList.CONCLUIDO.label;
      case 'X':
      case '9':
        return statusList.ARQUIVADO.label;
      default:
        return status?.toString() || 'N/A';
    }
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
        getStatusBadgeBg,
        getStatusText,
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
