import { useCallback, useMemo, useState } from 'react';
import { AreaResponse } from '@/api/areas/types';
import { TemaResponse } from '@/api/temas/types';
import { formatDateBr } from '@/utils/utils';

export interface CorrespondenciaFiltroRequest {
  identificacao: string;
  responsavel: string;
  tema: string;
  area: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  nmResponsavel: string;
  dtCriacaoInicio: string;
  dtCriacaoFim: string;
  flExigeCienciaGerenteRegul: string;
  page: number;
  size: number;
}

export const initialFilters: CorrespondenciaFiltroRequest = {
  identificacao: '',
  responsavel: '',
  tema: '',
  area: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  nmResponsavel: '',
  dtCriacaoInicio: '',
  dtCriacaoFim: '',
  flExigeCienciaGerenteRegul: 'all',
  page: 0,
  size: 10,
};

interface UseSolicitacoesFiltersDeps {
  statuses: { idStatusSolicitacao: number; nmStatus: string; flAtivo?: string }[];
  areas: AreaResponse[];
  temas: TemaResponse[];
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  defaultFilters?: Partial<CorrespondenciaFiltroRequest>;
}

export function useSolicitacoesFilters(deps: UseSolicitacoesFiltersDeps) {
  const { statuses, areas, temas, sortField, sortDirection, defaultFilters } = deps;

  const filtrosPadrao = useMemo<CorrespondenciaFiltroRequest>(() => {
    return {
      ...initialFilters,
      ...defaultFilters,
    };
  }, [defaultFilters]);

  // Estado de busca
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(0);

  // Estado de filtros
  const [filters, setFilters] = useState<CorrespondenciaFiltroRequest>(filtrosPadrao);
  const [activeFilters, setActiveFilters] = useState<CorrespondenciaFiltroRequest>(filtrosPadrao);

  // Estado do modal de filtros
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(activeFilters).some(([key, value]) => {
      if (key === 'flExigeCienciaGerenteRegul') {
        return value !== 'all' && value !== '';
      }
      return value !== '';
    });
  }, [activeFilters]);

  // Handlers de filtros
  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(filtrosPadrao);
    setActiveFilters(filtrosPadrao);
    setCurrentPage(0);
    setShowFilterModal(false);
  }, [filtrosPadrao]);

  // Filtros aplicados para exibição
  const filtrosAplicados = useMemo(() => {
    return [
      ...(searchQuery ? [{
        key: 'search',
        label: 'Busca',
        value: searchQuery,
        color: 'blue' as const,
        onRemove: () => setSearchQuery('')
      }] : []),
      ...(activeFilters.identificacao ? [{
        key: 'identificacao',
        label: 'Identificação',
        value: activeFilters.identificacao,
        color: 'orange' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, identificacao: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.status && activeFilters.status !== '' ? [{
        key: 'status',
        label: 'Status',
        value: activeFilters.status === 'all'
          ? 'Todos'
          : (statuses.find(s => s.idStatusSolicitacao.toString() === activeFilters.status)?.nmStatus || activeFilters.status),
        color: 'purple' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, status: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.area && activeFilters.area !== 'all' ? [{
        key: 'area',
        label: 'Área',
        value: areas.find(a => a.idArea.toString() === activeFilters.area)?.nmArea || activeFilters.area,
        color: 'green' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, area: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.tema && activeFilters.tema !== 'all' ? [{
        key: 'tema',
        label: 'Tema',
        value: temas.find(t => t.idTema.toString() === activeFilters.tema)?.nmTema || activeFilters.tema,
        color: 'indigo' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, tema: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.nmResponsavel ? [{
        key: 'nmResponsavel',
        label: 'Nome do Responsável',
        value: activeFilters.nmResponsavel,
        color: 'yellow' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, nmResponsavel: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.dtCriacaoInicio ? [{
        key: 'dtCriacaoInicio',
        label: 'Data Criação (Início)',
        value: formatDateBr(activeFilters.dtCriacaoInicio),
        color: 'pink' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, dtCriacaoInicio: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.dtCriacaoFim ? [{
        key: 'dtCriacaoFim',
        label: 'Data Criação (Fim)',
        value: formatDateBr(activeFilters.dtCriacaoFim),
        color: 'pink' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, dtCriacaoFim: '' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.flExigeCienciaGerenteRegul && activeFilters.flExigeCienciaGerenteRegul !== 'all' ? [{
        key: 'flExigeCienciaGerenteRegul',
        label: 'Exige Ciência do Gerente',
        value: activeFilters.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : 'Não, apenas ciência',
        color: 'blue' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, flExigeCienciaGerenteRegul: 'all' };
          setActiveFilters(newFilters);
          setFilters(newFilters);
        }
      }] : [])
    ];
  }, [searchQuery, activeFilters, statuses, areas, temas]);

  // Parâmetros de filtro para exportação
  const exportFilterParams = useMemo(() => ({
    filtro: searchQuery || undefined,
    idStatusSolicitacao: activeFilters.status && activeFilters.status !== 'all' ? Number(activeFilters.status) : undefined,
    idArea: activeFilters.area && activeFilters.area !== 'all' ? Number(activeFilters.area) : undefined,
    idTema: activeFilters.tema && activeFilters.tema !== 'all' ? Number(activeFilters.tema) : undefined,
    cdIdentificacao: activeFilters.identificacao || undefined,
    nmResponsavel: activeFilters.nmResponsavel || undefined,
    dtCriacaoInicio: activeFilters.dtCriacaoInicio ? `${activeFilters.dtCriacaoInicio}T00:00:00` : undefined,
    dtCriacaoFim: activeFilters.dtCriacaoFim ? `${activeFilters.dtCriacaoFim}T23:59:59` : undefined,
    sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
  }), [searchQuery, activeFilters, sortField, sortDirection]);

  return {
    // Busca
    searchQuery,
    setSearchQuery,

    // Paginação
    currentPage,
    setCurrentPage,

    // Filtros
    filters,
    setFilters,
    activeFilters,
    setActiveFilters,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    filtrosAplicados,
    exportFilterParams,

    // Modal Filtros
    showFilterModal,
    setShowFilterModal,
  };
}
