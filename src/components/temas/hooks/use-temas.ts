import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { TemaRequest, TemaResponse, PagedResponse } from '@/api/temas/types';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  useTemasQuery, 
  useCreateTema, 
  useUpdateTema, 
  useDeleteTema 
} from './use-temas-query';

interface FiltersState {
  nome: string;
  descricao: string;
}

const initialFilters: FiltersState = {
  nome: '',
  descricao: ''
};

interface UseTemasOptions {
  pageSize?: number;
}

export function useTemas(options: UseTemasOptions = {}) {
  const { pageSize = 10 } = options;
  const size = pageSize;

  // Estado de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<keyof TemaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado de filtros
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<FiltersState>(initialFilters);

  // Estado de modais
  const [selectedTema, setSelectedTema] = useState<TemaResponse | null>(null);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [temaToDelete, setTemaToDelete] = useState<TemaResponse | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  // Refs para detectar mudança de filtros (melhor prática React Query)
  const prevFiltersRef = useRef(JSON.stringify(activeFilters));
  const prevSearchRef = useRef(debouncedSearchQuery);

  // Parâmetros para a query - calcula página efetiva de forma síncrona
  const queryParams = useMemo(() => {
    const currentFiltersStr = JSON.stringify(activeFilters);
    const filtersChanged = prevFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
    
    // Página efetiva: 0 se filtros mudaram, senão usa currentPage
    const effectivePage = (filtersChanged || searchChanged) ? 0 : currentPage;
    
    // Atualiza refs para próxima comparação
    prevFiltersRef.current = currentFiltersStr;
    prevSearchRef.current = debouncedSearchQuery;
    
    return {
      filtro: debouncedSearchQuery || undefined,
      nmTema: activeFilters.nome || undefined,
      dsTema: activeFilters.descricao || undefined,
      page: effectivePage,
      size: size,
      sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
    };
  }, [debouncedSearchQuery, activeFilters, currentPage, size, sortField, sortDirection]);

  // Sincroniza estado da página com a página efetiva calculada
  useEffect(() => {
    if (queryParams.page !== currentPage) {
      setCurrentPage(queryParams.page);
    }
  }, [queryParams.page, currentPage]);

  // Query principal
  const { data, isLoading, refetch } = useTemasQuery(queryParams);

  // Mutations
  const createMutation = useCreateTema();
  const updateMutation = useUpdateTema();
  const deleteMutation = useDeleteTema();

  // Handlers
  const handleSort = useCallback((field: keyof TemaResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection]);

  const handleEdit = useCallback((tema: TemaResponse) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
  }, []);

  const handleDelete = useCallback((tema: TemaResponse) => {
    setTemaToDelete(tema);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (temaToDelete) {
      await deleteMutation.mutateAsync(temaToDelete.idTema);
      setShowDeleteDialog(false);
      setTemaToDelete(null);
    }
  }, [temaToDelete, deleteMutation]);

  const onTemaSave = useCallback(async (formData: TemaRequest) => {
    try {
      if (selectedTema && selectedTema.idTema) {
        await updateMutation.mutateAsync({ id: selectedTema.idTema, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowTemaModal(false);
      setSelectedTema(null);
    } catch (error) {
      throw error;
    }
  }, [selectedTema, createMutation, updateMutation]);

  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setShowFilterModal(false);
  }, []);

  const handleCloseTemaModal = useCallback(() => {
    setShowTemaModal(false);
    setSelectedTema(null);
  }, []);

  const handleOpenCreateTema = useCallback(() => {
    setSelectedTema(null);
    setShowTemaModal(true);
  }, []);

  const sortedTemas = useCallback(() => {
    const temas = data?.content || [];
    const sorted = [...temas];
    if (sortField) {
      sorted.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  }, [data?.content, sortField, sortDirection]);

  const filtrosAplicados = useMemo(() => [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.nome ? [{
      key: 'nome',
      label: 'Nome',
      value: activeFilters.nome,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, nome: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.descricao ? [{
      key: 'descricao',
      label: 'Descrição',
      value: activeFilters.descricao,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, descricao: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : [])
  ], [searchQuery, activeFilters]);

  return {
    // Dados
    temas: sortedTemas(),
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,

    // UI State
    loading: isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,

    // Filtros
    filters,
    setFilters,
    activeFilters,
    hasActiveFilters,
    filtrosAplicados,
    applyFilters,
    clearFilters,

    // Modais
    selectedTema,
    showTemaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    temaToDelete,

    // Handlers
    loadTemas: refetch,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onTemaSave,
    handleCloseTemaModal,
    handleOpenCreateTema,
  };
}
