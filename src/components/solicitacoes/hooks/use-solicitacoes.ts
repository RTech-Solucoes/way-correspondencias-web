import { useEffect, useMemo, useState, useRef } from 'react';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { PagedResponse } from '@/api/solicitacoes/types';
import { useSolicitacoesData } from './use-solicitacoes-data';
import { useSolicitacoesFilters } from './use-solicitacoes-filters';
import { useSolicitacoesModals } from './use-solicitacoes-modals';
import { useSolicitacoesHandlers } from './use-solicitacoes-handlers';

export type { FiltersState } from './use-solicitacoes-filters';

interface UseSolicitacoesOptions {
  pageSize?: number;
}

export function useSolicitacoes(options: UseSolicitacoesOptions = {}) {
  const { pageSize = 10 } = options;

  // Permissões
  const { canInserirSolicitacao, canAtualizarSolicitacao, canDeletarSolicitacao } = usePermissoes();

  // Hook de handlers primeiro (para ter sortField e sortDirection)
  // Precisamos criar estados temporários aqui para evitar dependências circulares
  const [tempSortField, setTempSortField] = useState<string | null>(null);
  const [tempSortDirection, setTempSortDirection] = useState<'asc' | 'desc'>('asc');

  // Hook de filtros (precisa de statuses, areas, temas - inicialmente vazios)
  const filtersHook = useSolicitacoesFilters({
    statuses: [],
    areas: [],
    temas: [],
    sortField: tempSortField,
    sortDirection: tempSortDirection,
  });

  // Refs para rastrear mudanças nos filtros e busca (usados no useEffect de carregamento)
  const prevActiveFiltersRef = useRef<string>(JSON.stringify(filtersHook.activeFilters));
  const prevSearchQueryRef = useRef<string>(filtersHook.searchQuery);

  // Hook de dados
  const dataHook = useSolicitacoesData(
    { pageSize },
    {
      currentPage: filtersHook.currentPage,
      activeFilters: filtersHook.activeFilters,
      searchQuery: filtersHook.searchQuery,
      sortField: tempSortField,
      sortDirection: tempSortDirection,
    }
  );

  // Hook de modais
  const modalsHook = useSolicitacoesModals({
    loadSolicitacoes: dataHook.loadSolicitacoes,
  });

  // Hook de handlers
  const handlersHook = useSolicitacoesHandlers({
    loadSolicitacoes: dataHook.loadSolicitacoes,
    setSelectedSolicitacao: modalsHook.setSelectedSolicitacao,
    setShowSolicitacaoModal: modalsHook.setShowSolicitacaoModal,
    setSolicitacaoToDelete: modalsHook.setSolicitacaoToDelete,
    setShowDeleteDialog: modalsHook.setShowDeleteDialog,
    solicitacaoToDelete: modalsHook.solicitacaoToDelete,
    detalhesCorrespondencia: modalsHook.detalhesCorrespondencia,
    setCurrentPage: filtersHook.setCurrentPage,
  });

  // Sincronizar sortField e sortDirection
  useEffect(() => {
    setTempSortField(handlersHook.sortField);
    setTempSortDirection(handlersHook.sortDirection);
  }, [handlersHook.sortField, handlersHook.sortDirection]);

  // Re-calcular filtros aplicados com os dados carregados
  const filtrosAplicadosCompletos = useMemo(() => {
    const { searchQuery, activeFilters } = filtersHook;
    const { statuses, areas, temas } = dataHook;

    return [
      ...(searchQuery ? [{
        key: 'search',
        label: 'Busca',
        value: searchQuery,
        color: 'blue' as const,
        onRemove: () => filtersHook.setSearchQuery('')
      }] : []),
      ...(activeFilters.identificacao ? [{
        key: 'identificacao',
        label: 'Identificação',
        value: activeFilters.identificacao,
        color: 'orange' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, identificacao: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
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
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.area && activeFilters.area !== 'all' ? [{
        key: 'area',
        label: 'Área',
        value: areas.find(a => a.idArea.toString() === activeFilters.area)?.nmArea || activeFilters.area,
        color: 'green' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, area: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.tema && activeFilters.tema !== 'all' ? [{
        key: 'tema',
        label: 'Tema',
        value: temas.find(t => t.idTema.toString() === activeFilters.tema)?.nmTema || activeFilters.tema,
        color: 'indigo' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, tema: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.nmResponsavel ? [{
        key: 'nmResponsavel',
        label: 'Nome do Responsável',
        value: activeFilters.nmResponsavel,
        color: 'yellow' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, nmResponsavel: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.dtCriacaoInicio ? [{
        key: 'dtCriacaoInicio',
        label: 'Data Criação Início',
        value: activeFilters.dtCriacaoInicio,
        color: 'pink' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, dtCriacaoInicio: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.dtCriacaoFim ? [{
        key: 'dtCriacaoFim',
        label: 'Data Criação Fim',
        value: activeFilters.dtCriacaoFim,
        color: 'pink' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, dtCriacaoFim: '' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : []),
      ...(activeFilters.flExigeCienciaGerenteRegul && activeFilters.flExigeCienciaGerenteRegul !== 'all' ? [{
        key: 'flExigeCienciaGerenteRegul',
        label: 'Exige Ciência do Gerente',
        value: activeFilters.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : 'Não, apenas ciência',
        color: 'blue' as const,
        onRemove: () => {
          const newFilters = { ...activeFilters, flExigeCienciaGerenteRegul: 'all' };
          filtersHook.setActiveFilters(newFilters);
          filtersHook.setFilters(newFilters);
        }
      }] : [])
    ];
  }, [filtersHook, dataHook.statuses, dataHook.areas, dataHook.temas, dataHook.responsaveis, dataHook.solicitacoes]);

  // Parâmetros de filtro para exportação
  const exportFilterParams = useMemo(() => ({
    filtro: filtersHook.searchQuery || undefined,
    idStatusSolicitacao: filtersHook.activeFilters.status && filtersHook.activeFilters.status !== 'all' 
      ? Number(filtersHook.activeFilters.status) : undefined,
    idArea: filtersHook.activeFilters.area && filtersHook.activeFilters.area !== 'all' 
      ? Number(filtersHook.activeFilters.area) : undefined,
    idTema: filtersHook.activeFilters.tema && filtersHook.activeFilters.tema !== 'all' 
      ? Number(filtersHook.activeFilters.tema) : undefined,
    cdIdentificacao: filtersHook.activeFilters.identificacao || undefined,
    nmResponsavel: filtersHook.activeFilters.nmResponsavel || undefined,
    dtCriacaoInicio: filtersHook.activeFilters.dtCriacaoInicio 
      ? `${filtersHook.activeFilters.dtCriacaoInicio}T00:00:00` : undefined,
    dtCriacaoFim: filtersHook.activeFilters.dtCriacaoFim 
      ? `${filtersHook.activeFilters.dtCriacaoFim}T23:59:59` : undefined,
    sort: handlersHook.sortField 
      ? `${handlersHook.sortField},${handlersHook.sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
  }), [filtersHook.searchQuery, filtersHook.activeFilters, handlersHook.sortField, handlersHook.sortDirection]);

  // Ordenação local das solicitações
  const sortedSolicitacoes = useMemo(() => {
    const { solicitacoes } = dataHook;
    const { sortField, sortDirection, getStatusText, getByPath } = handlersHook;

    if (!solicitacoes || solicitacoes.length === 0) return [];
    const sorted = [...solicitacoes];

    if (sortField) {
      sorted.sort((a: CorrespondenciaResponse, b: CorrespondenciaResponse) => {
        let aValue: string | number | null;
        let bValue: string | number | null;

        switch (sortField) {
          case 'nmTema':
            aValue = a.nmTema || a?.tema?.nmTema || '';
            bValue = b.nmTema || b?.tema?.nmTema || '';
            break;

          case 'flStatus':
            aValue = a.statusSolicitacao?.nmStatus || getStatusText(a.statusCodigo?.toString() || '') || '';
            bValue = b.statusSolicitacao?.nmStatus || getStatusText(b.statusCodigo?.toString() || '') || '';
            break;

          default:
            aValue = getByPath(a, sortField) as string | number | null;
            bValue = getByPath(b, sortField) as string | number | null;
            break;
        }

        if (aValue === bValue) return 0;
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const cmp = aValue.localeCompare(bValue, 'pt-BR', { numeric: true, sensitivity: 'base' });
          return sortDirection === 'asc' ? cmp : -cmp;
        }

        const cmp = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return sorted;
  }, [dataHook.solicitacoes, handlersHook.sortField, handlersHook.sortDirection, handlersHook.getStatusText, handlersHook.getByPath]);

  // Effect para carregar solicitações
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Verifica se filtros ou busca mudaram
    const currentFiltersStr = JSON.stringify(filtersHook.activeFilters);
    const filtersChanged = prevActiveFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchQueryRef.current !== dataHook.debouncedSearchQuery;

    if (filtersChanged || searchChanged) {
      prevActiveFiltersRef.current = currentFiltersStr;
      prevSearchQueryRef.current = dataHook.debouncedSearchQuery;

      // Se os filtros mudaram e não estamos na página 0, reseta para página 0
      // O useEffect será disparado novamente quando currentPage mudar
      if (!isInitialMountRef.current && filtersHook.currentPage !== 0) {
        filtersHook.setCurrentPage(0);
        return;
      }
    }

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }

    dataHook.loadSolicitacoes();
  }, [
    dataHook.loadSolicitacoes,
    filtersHook.currentPage, 
    filtersHook.hasActiveFilters, 
    filtersHook.activeFilters,
    filtersHook.setCurrentPage,
    dataHook.debouncedSearchQuery, 
    handlersHook.sortField
  ]);

  return {
    // Dados principais
    solicitacoes: dataHook.solicitacoes,
    sortedSolicitacoes,
    totalPages: dataHook.totalPages,
    totalElements: dataHook.totalElements,

    // Dados auxiliares
    responsaveis: dataHook.responsaveis,
    temas: dataHook.temas,
    areas: dataHook.areas,
    statuses: dataHook.statuses,

    // UI State
    loading: dataHook.loading,
    searchQuery: filtersHook.searchQuery,
    setSearchQuery: filtersHook.setSearchQuery,
    currentPage: filtersHook.currentPage,
    setCurrentPage: filtersHook.setCurrentPage,

    // Filtros
    filters: filtersHook.filters,
    setFilters: filtersHook.setFilters,
    activeFilters: filtersHook.activeFilters,
    setActiveFilters: filtersHook.setActiveFilters,
    hasActiveFilters: filtersHook.hasActiveFilters,
    applyFilters: filtersHook.applyFilters,
    clearFilters: filtersHook.clearFilters,
    filtrosAplicados: filtrosAplicadosCompletos,
    exportFilterParams,

    // Modal Solicitação
    selectedSolicitacao: modalsHook.selectedSolicitacao,
    showSolicitacaoModal: modalsHook.showSolicitacaoModal,
    setShowSolicitacaoModal: modalsHook.setShowSolicitacaoModal,

    // Modal Filtros
    showFilterModal: filtersHook.showFilterModal,
    setShowFilterModal: filtersHook.setShowFilterModal,

    // Modal Detalhes
    showDetalhesModal: modalsHook.showDetalhesModal,
    detalhesCorrespondencia: modalsHook.detalhesCorrespondencia,
    detalhesAnexos: modalsHook.detalhesAnexos,

    // Modal Tramitação
    showTramitacaoModal: modalsHook.showTramitacaoModal,
    tramitacaoSolicitacaoId: modalsHook.tramitacaoSolicitacaoId,

    // Modal Delete
    showDeleteDialog: modalsHook.showDeleteDialog,
    setShowDeleteDialog: modalsHook.setShowDeleteDialog,
    solicitacaoToDelete: modalsHook.solicitacaoToDelete,

    // Permissões
    canInserirSolicitacao,
    canAtualizarSolicitacao,
    canDeletarSolicitacao,

    // Ordenação
    sortField: handlersHook.sortField,
    sortDirection: handlersHook.sortDirection,

    // Handlers
    loadSolicitacoes: dataHook.loadSolicitacoes,
    handleSort: handlersHook.handleSort,
    handleEdit: handlersHook.handleEdit,
    handleDelete: handlersHook.handleDelete,
    confirmDelete: handlersHook.confirmDelete,
    onSolicitacaoSave: modalsHook.onSolicitacaoSave,
    handleOpenCreateSolicitacao: modalsHook.handleOpenCreateSolicitacao,
    handleCloseSolicitacaoModal: modalsHook.handleCloseSolicitacaoModal,
    handleTramitacoes: modalsHook.handleTramitacoes,
    handleCloseTramitacaoModal: modalsHook.handleCloseTramitacaoModal,
    openDetalhes: modalsHook.openDetalhes,
    handleCloseDetalhesModal: modalsHook.handleCloseDetalhesModal,
    enviarDevolutiva: handlersHook.enviarDevolutiva,

    // Status helpers
    getStatusBadgeVariant: handlersHook.getStatusBadgeVariant,
    getStatusBadgeBg: handlersHook.getStatusBadgeBg,
    getStatusText: handlersHook.getStatusText,

    // Helpers
    getJoinedNmAreas: handlersHook.getJoinedNmAreas,
  };
}
