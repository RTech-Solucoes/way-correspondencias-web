import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import concessionariaClient from '@/api/concessionaria/client';
import {
  ConcessionariaFilterParams,
  ConcessionariaRequest,
  ConcessionariaResponse,
  isUnicaConcessionariaAtiva,
} from '@/api/concessionaria/types';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useConcessionariasQuery,
  useConfiguracoesConcessionariasQueries,
  useCreateConcessionaria,
  useDeleteConcessionaria,
  useToggleConcessionariaStatus,
  useUpdateConcessionaria,
} from './use-concessionarias-query';

export type ConcessionariaFiltersState = Record<string, never>;

const initialFilters: ConcessionariaFiltersState = {};

const normalizeCodigoConcessionaria = (value: string) => value.replace(/\s+/g, '').toLowerCase();

export function useConcessionarias(pageSize = 10) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<keyof ConcessionariaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<ConcessionariaFiltersState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<ConcessionariaFiltersState>(initialFilters);
  const [selectedConcessionaria, setSelectedConcessionaria] = useState<ConcessionariaResponse | null>(null);
  const [concessionariaToDelete, setConcessionariaToDelete] = useState<ConcessionariaResponse | null>(null);
  const [concessionariaToToggleStatus, setConcessionariaToToggleStatus] = useState<ConcessionariaResponse | null>(null);
  const [concessionariaToDesativar, setConcessionariaToDesativar] = useState<ConcessionariaResponse | null>(null);
  const [concessionariaToConfigure, setConcessionariaToConfigure] = useState<ConcessionariaResponse | null>(null);
  const [showConcessionariaModal, setShowConcessionariaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDesativarModal, setShowDesativarModal] = useState(false);
  const [showConfiguracaoModal, setShowConfiguracaoModal] = useState(false);
  const [showConfigurarAgoraDialog, setShowConfigurarAgoraDialog] = useState(false);
  const [concessionariaRecemCriada, setConcessionariaRecemCriada] = useState<ConcessionariaResponse | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const hasActiveFilters = searchQuery.trim() !== '';
  const prevFiltersRef = useRef(JSON.stringify(activeFilters));
  const prevSearchRef = useRef(debouncedSearchQuery);

  const queryParams = useMemo<ConcessionariaFilterParams>(() => {
    const currentFiltersStr = JSON.stringify(activeFilters);
    const filtersChanged = prevFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
    const effectivePage = filtersChanged || searchChanged ? 0 : currentPage;

    prevFiltersRef.current = currentFiltersStr;
    prevSearchRef.current = debouncedSearchQuery;

    const filtro = debouncedSearchQuery.trim() || undefined;

    return {
      filtro,
      page: effectivePage,
      size: pageSize,
      sort: sortField ? `${sortField},${sortDirection}` : undefined,
    };
  }, [activeFilters, currentPage, debouncedSearchQuery, pageSize, sortDirection, sortField]);

  useEffect(() => {
    if (queryParams.page !== currentPage) {
      setCurrentPage(queryParams.page ?? 0);
    }
  }, [currentPage, queryParams.page]);

  const { data, isLoading, refetch } = useConcessionariasQuery(queryParams);
  const concessionarias = useMemo(() => data?.content ?? [], [data?.content]);
  const idsConcessionarias = useMemo(
    () => concessionarias.map((concessionaria) => concessionaria.idConcessionaria),
    [concessionarias],
  );
  const {
    configuracoesById,
    configuracoesLoadingById,
  } = useConfiguracoesConcessionariasQueries(idsConcessionarias);
  const createMutation = useCreateConcessionaria();
  const updateMutation = useUpdateConcessionaria();
  const deleteMutation = useDeleteConcessionaria();
  const toggleStatusMutation = useToggleConcessionariaStatus();

  const handleSort = useCallback((field: keyof ConcessionariaResponse) => {
    setSortField(field);
    setSortDirection(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(0);
  }, [sortField]);

  const handleOpenCreateConcessionaria = useCallback(() => {
    setSelectedConcessionaria(null);
    setShowConcessionariaModal(true);
  }, []);

  const handleEdit = useCallback((concessionaria: ConcessionariaResponse) => {
    setSelectedConcessionaria(concessionaria);
    setShowConcessionariaModal(true);
  }, []);

  const handleConfigure = useCallback((concessionaria: ConcessionariaResponse) => {
    setConcessionariaToConfigure(concessionaria);
    setShowConfiguracaoModal(true);
  }, []);

  const handleDelete = useCallback((concessionaria: ConcessionariaResponse) => {
    setConcessionariaToDelete(concessionaria);
    setShowDeleteDialog(true);
  }, []);

  const handleToggleStatus = useCallback((concessionaria: ConcessionariaResponse) => {
    if (isUnicaConcessionariaAtiva(concessionaria)) return;

    if (concessionaria.flAtivo === 'S') {
      setConcessionariaToDesativar(concessionaria);
      setShowDesativarModal(true);
      return;
    }

    setConcessionariaToToggleStatus(concessionaria);
    setShowStatusDialog(true);
  }, []);

  const confirmDelete = useCallback(async (dsMotivoDesativacao: string) => {
    if (!concessionariaToDelete) return;
    await deleteMutation.mutateAsync({
      id: concessionariaToDelete.idConcessionaria,
      dsMotivoDesativacao,
    });
    setShowDeleteDialog(false);
    setConcessionariaToDelete(null);
  }, [concessionariaToDelete, deleteMutation]);

  const confirmToggleStatus = useCallback(async () => {
    if (!concessionariaToToggleStatus) return;

    await toggleStatusMutation.mutateAsync({
      id: concessionariaToToggleStatus.idConcessionaria,
      flAtivo: 'S',
    });
    setShowStatusDialog(false);
    setConcessionariaToToggleStatus(null);
  }, [concessionariaToToggleStatus, toggleStatusMutation]);

  const confirmDesativar = useCallback(async (dsMotivoDesativacao: string) => {
    if (!concessionariaToDesativar) return;
    if (isUnicaConcessionariaAtiva(concessionariaToDesativar)) {
      setShowDesativarModal(false);
      setConcessionariaToDesativar(null);
      return;
    }

    try {
      await toggleStatusMutation.mutateAsync({
        id: concessionariaToDesativar.idConcessionaria,
        flAtivo: 'N',
        dsMotivoDesativacao,
      });
      setShowDesativarModal(false);
      setConcessionariaToDesativar(null);
    } catch {
    }
  }, [concessionariaToDesativar, toggleStatusMutation]);

  const handleCloseDesativarModal = useCallback(() => {
    setShowDesativarModal(false);
    setConcessionariaToDesativar(null);
  }, []);

  const validarCodigoDisponivel = useCallback(async (
    codigo: string,
    idConcessionaria: number | null,
  ): Promise<boolean | null> => {
    const codigoNormalizado = normalizeCodigoConcessionaria(codigo);
    if (!codigoNormalizado) return false;

    try {
      const resultado = await concessionariaClient.buscarParaAdministracao({
        cdConcessionaria: codigoNormalizado,
        page: 0,
        size: 50,
      });

      const jaExiste = resultado.content.some((item) => {
        if (item.idConcessionaria === idConcessionaria) return false;
        return normalizeCodigoConcessionaria(item.cdConcessionaria) === codigoNormalizado;
      });

      return !jaExiste;
    } catch (error) {
      toast.error((error as Error).message || 'Não foi possível validar o código');
      return null;
    }
  }, []);

  const onConcessionariaSave = useCallback(async (formData: ConcessionariaRequest) => {
    if (selectedConcessionaria) {
      await updateMutation.mutateAsync({
        id: selectedConcessionaria.idConcessionaria,
        data: formData,
      });
      setShowConcessionariaModal(false);
      setSelectedConcessionaria(null);
      return null;
    }

    const created = await createMutation.mutateAsync(formData);
    setShowConcessionariaModal(false);
    setSelectedConcessionaria(null);
    return created;
  }, [createMutation, selectedConcessionaria, updateMutation]);

  const promptConfigurarAgora = useCallback((concessionaria: ConcessionariaResponse) => {
    setConcessionariaRecemCriada(concessionaria);
    setShowConfigurarAgoraDialog(true);
  }, []);

  const confirmConfigurarAgora = useCallback(() => {
    if (!concessionariaRecemCriada) return;
    setConcessionariaToConfigure(concessionariaRecemCriada);
    setShowConfiguracaoModal(true);
    setConcessionariaRecemCriada(null);
    setShowConfigurarAgoraDialog(false);
  }, [concessionariaRecemCriada]);

  const dismissConfigurarAgora = useCallback(() => {
    setShowConfigurarAgoraDialog(false);
    setConcessionariaRecemCriada(null);
  }, []);

  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setSearchQuery('');
    setShowFilterModal(false);
  }, []);

  const handleCloseConcessionariaModal = useCallback(() => {
    setShowConcessionariaModal(false);
    setSelectedConcessionaria(null);
  }, []);

  const handleCloseConfiguracaoModal = useCallback(() => {
    setShowConfiguracaoModal(false);
    setConcessionariaToConfigure(null);
  }, []);

  const filtrosAplicados = useMemo(() => [
    ...(searchQuery.trim() ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery(''),
    }] : []),
  ], [searchQuery]);

  return {
    concessionarias,
    configuracoesById,
    configuracoesLoadingById,
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    loading: isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    filters,
    setFilters,
    hasActiveFilters,
    filtrosAplicados,
    selectedConcessionaria,
    concessionariaToDelete,
    concessionariaToToggleStatus,
    concessionariaToDesativar,
    concessionariaToConfigure,
    showConcessionariaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    showStatusDialog,
    setShowStatusDialog,
    showDesativarModal,
    desativando: toggleStatusMutation.isPending,
    showConfiguracaoModal,
    showConfigurarAgoraDialog,
    concessionariaRecemCriada,
    loadConcessionarias: refetch,
    handleSort,
    handleEdit,
    handleConfigure,
    handleDelete,
    handleToggleStatus,
    confirmDelete,
    confirmToggleStatus,
    confirmDesativar,
    handleCloseDesativarModal,
    confirmConfigurarAgora,
    dismissConfigurarAgora,
    promptConfigurarAgora,
    onConcessionariaSave,
    validarCodigoDisponivel,
    applyFilters,
    clearFilters,
    handleCloseConcessionariaModal,
    handleOpenCreateConcessionaria,
    handleCloseConfiguracaoModal,
  };
}
