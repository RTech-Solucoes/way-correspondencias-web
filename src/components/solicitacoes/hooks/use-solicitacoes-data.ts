import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import correspondenciaClient from '@/api/correspondencia/client';
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
import { FiltersState } from './use-solicitacoes-filters';

interface UseSolicitacoesDataOptions {
  initialData?: PagedResponse<CorrespondenciaResponse> | null;
  pageSize?: number;
}

interface UseSolicitacoesDataDeps {
  currentPage: number;
  activeFilters: FiltersState;
  searchQuery: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

export function useSolicitacoesData(
  options: UseSolicitacoesDataOptions = {},
  deps: UseSolicitacoesDataDeps
) {
  const { initialData, pageSize = 10 } = options;
  const { currentPage, activeFilters, searchQuery, sortField, sortDirection } = deps;
  const searchParams = useSearchParams();

  // Estado dos dados principais
  const [solicitacoes, setSolicitacoes] = useState<CorrespondenciaResponse[]>(initialData?.content || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements || 0);

  // Estado dos dados auxiliares
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [statuses, setStatuses] = useState<{ idStatusSolicitacao: number; nmStatus: string; flAtivo?: string }[]>([]);

  // Estado de UI
  const [loading, setLoading] = useState(!initialData);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const prefilledFilters = (() => {
    const idSolicitacaoParam = searchParams.get('idSolicitacao');
    return {
      idSolicitacao: idSolicitacaoParam ? Number(idSolicitacaoParam) : undefined,
    };
  })();

  // Função principal de carregamento
  const loadSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);

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

      const response = await correspondenciaClient.buscarPorFiltro({
        filtro,
        page: currentPage,
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
      });

      if (response && typeof response === 'object' && 'content' in response) {
        const paginatedResponse = response as unknown as PagedResponse<CorrespondenciaResponse>;
        setSolicitacoes(paginatedResponse.content ?? []);
        setTotalPages(paginatedResponse.totalPages ?? 1);
        setTotalElements(paginatedResponse.totalElements ?? 0);
      } else {
        setSolicitacoes((response as CorrespondenciaResponse[]) ?? []);
        setTotalPages(1);
        setTotalElements((response ?? []).length);
      }
    } catch {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    activeFilters,
    debouncedSearchQuery,
    prefilledFilters.idSolicitacao,
    sortField,
    sortDirection,
    pageSize,
  ]);

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
    loading,
    debouncedSearchQuery,

    // Funções
    loadSolicitacoes,
  };
}
