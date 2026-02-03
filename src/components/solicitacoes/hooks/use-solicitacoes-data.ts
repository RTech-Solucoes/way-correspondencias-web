import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { temasClient } from '@/api/temas/client';
import { areasClient } from '@/api/areas/client';
import { statusSolicitacaoClient } from '@/api/status-solicitacao/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';
import { PagedResponse } from '@/api/solicitacoes/types';
import { CategoriaEnum, TipoEnum } from '@/api/tipos/types';
import { CorrespondenciaFiltroRequest } from './use-solicitacoes-filters';
import { useSolicitacoesQuery } from './use-solicitacoes-query';

interface UseSolicitacoesDataOptions {
  pageSize?: number;
}

interface UseSolicitacoesDataDeps {
  currentPage: number;
  activeFilters: CorrespondenciaFiltroRequest;
  searchQuery: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

export function useSolicitacoesData(
  options: UseSolicitacoesDataOptions = {},
  deps: UseSolicitacoesDataDeps
) {
  const { pageSize = 10 } = options;
  const { currentPage, activeFilters, searchQuery, sortField, sortDirection } = deps;
  const searchParams = useSearchParams();

  // Estado dos dados auxiliares
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [statuses, setStatuses] = useState<{ idStatusSolicitacao: number; nmStatus: string; flAtivo?: string }[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const prefilledFilters = (() => {
    const idSolicitacaoParam = searchParams.get('idSolicitacao');
    return {
      idSolicitacao: idSolicitacaoParam ? Number(idSolicitacaoParam) : undefined,
    };
  })();

  // Refs para detectar mudança de filtros (melhor prática React Query)
  const prevFiltersRef = useRef(JSON.stringify(activeFilters));
  const prevSearchRef = useRef(debouncedSearchQuery);

  // Parâmetros da query - calcula página efetiva de forma síncrona
  const queryParams = useMemo(() => {
    const currentFiltersStr = JSON.stringify(activeFilters);
    const filtersChanged = prevFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
    
    // Página efetiva: 0 se filtros mudaram, senão usa currentPage
    const effectivePage = (filtersChanged || searchChanged) ? 0 : currentPage;
    
    // Atualiza refs para próxima comparação
    prevFiltersRef.current = currentFiltersStr;
    prevSearchRef.current = debouncedSearchQuery;
    
    const filtro = debouncedSearchQuery || undefined;
    const idStatusSolicitacao: number | undefined = activeFilters.status && activeFilters.status !== 'all' && activeFilters.status !== ''
      ? Number(activeFilters.status)
      : activeFilters.status === 'all' ? -1 : undefined;
    const idArea = activeFilters.area && activeFilters.area !== 'all'
      ? Number(activeFilters.area)
      : undefined;
    const idTema = activeFilters.tema && activeFilters.tema !== 'all'
      ? Number(activeFilters.tema)
      : undefined;
    const cdIdentificacao = activeFilters.identificacao || undefined;
    const nmResponsavel = activeFilters.nmResponsavel || undefined;
    const dtCriacaoInicio = activeFilters.dtCriacaoInicio ? `${activeFilters.dtCriacaoInicio}T00:00:00` : undefined;
    const dtCriacaoFim = activeFilters.dtCriacaoFim ? `${activeFilters.dtCriacaoFim}T23:59:59` : undefined;
    const flExigeCienciaGerenteRegul = activeFilters.flExigeCienciaGerenteRegul && activeFilters.flExigeCienciaGerenteRegul !== 'all'
      ? activeFilters.flExigeCienciaGerenteRegul
      : undefined;

    return {
      filtro,
      page: effectivePage,
      size: pageSize,
      idStatusSolicitacao,
      idArea,
      cdIdentificacao,
      idTema,
      nmResponsavel,
      dtCriacaoInicio,
      dtCriacaoFim,
      flExigeCienciaGerenteRegul,
      idSolicitacao: prefilledFilters.idSolicitacao,
      sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
    };
  }, [
    currentPage,
    activeFilters,
    debouncedSearchQuery,
    prefilledFilters.idSolicitacao,
    sortField,
    sortDirection,
    pageSize,
  ]);

  // Query principal
  const { data, isLoading, refetch } = useSolicitacoesQuery(queryParams);

  const loadSolicitacoes = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Funções de carregamento auxiliar
  const loadResponsaveis = useCallback(async () => {
    try {
      const response = await responsaveisClient.buscarPorFiltro({ size: 100 });
      setResponsaveis(response.content ?? []);
    } catch {
      // silently fail
    }
  }, []);

  const loadTemas = useCallback(async () => {
    try {
      const response = await temasClient.buscarPorFiltro({ size: 400 });
      setTemas(response.content ?? []);
    } catch {
      // silently fail
    }
  }, []);

  const loadAreas = useCallback(async () => {
    try {
      const response = await areasClient.buscarPorFiltro({ size: 100 });
      setAreas(response.content ?? []);
    } catch {
      // silently fail
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const response = await statusSolicitacaoClient.listarTodos(
        CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO,
        [TipoEnum.TODOS, TipoEnum.CORRESPONDENCIA]
      );
      setStatuses(response);
    } catch {
      // silently fail
    }
  }, []);

  // Carregar dados auxiliares na montagem
  useEffect(() => {
    loadStatuses();
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, [loadStatuses, loadResponsaveis, loadTemas, loadAreas]);

  // Extrai dados da resposta paginada
  const solicitacoes = useMemo(() => {
    if (data && typeof data === 'object' && 'content' in data) {
      return (data as PagedResponse<CorrespondenciaResponse>).content ?? [];
    }
    return (data as CorrespondenciaResponse[]) ?? [];
  }, [data]);

  const totalPages = useMemo(() => {
    if (data && typeof data === 'object' && 'totalPages' in data) {
      return (data as PagedResponse<CorrespondenciaResponse>).totalPages ?? 1;
    }
    return 1;
  }, [data]);

  const totalElements = useMemo(() => {
    if (data && typeof data === 'object' && 'totalElements' in data) {
      return (data as PagedResponse<CorrespondenciaResponse>).totalElements ?? 0;
    }
    return solicitacoes.length;
  }, [data, solicitacoes.length]);

  return {
    // Dados principais
    solicitacoes,
    totalPages,
    totalElements,

    // Dados auxiliares
    responsaveis,
    temas,
    areas,
    statuses,

    // UI State
    loading: isLoading,
    debouncedSearchQuery,

    // Funções
    loadSolicitacoes,
  };
}
