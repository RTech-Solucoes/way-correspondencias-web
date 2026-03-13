import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { AreaRequest, AreaResponse, PagedResponse } from '@/api/areas/types';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  useAreasQuery, 
  useCreateArea, 
  useUpdateArea, 
  useDeleteArea 
} from './use-areas-query';

interface FiltersState {
  codigo: string;
  nome: string;
  descricao: string;
  ativo: string;
}

const initialFilters: FiltersState = {
  codigo: '',
  nome: '',
  descricao: '',
  ativo: ''
};

interface UseAreasOptions {
  pageSize?: number;
}

export function useAreas(options: UseAreasOptions = {}) {
  const { pageSize = 10 } = options;
  const size = pageSize;

  // Estado de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<keyof AreaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado de filtros
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<FiltersState>(initialFilters);

  // Estado de modais
  const [selectedArea, setSelectedArea] = useState<AreaResponse | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

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
      cdArea: activeFilters.codigo || undefined,
      nmArea: activeFilters.nome || undefined,
      dsArea: activeFilters.descricao || undefined,
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

  // ✨ Query principal - React Query cuida de tudo!
  const { data, isLoading, refetch } = useAreasQuery(queryParams);

  // Mutations
  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const deleteMutation = useDeleteArea();

  // Handlers - Muito mais simples agora!
  const handleSort = useCallback((field: keyof AreaResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection]);

  const handleEdit = useCallback((area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  }, []);

  const handleDelete = useCallback((areaId: number) => {
    setAreaToDelete(areaId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (areaToDelete) {
      await deleteMutation.mutateAsync(areaToDelete);
      setShowDeleteDialog(false);
      setAreaToDelete(null);
    }
  }, [areaToDelete, deleteMutation]);

  const onAreaSave = useCallback(async (formData: AreaRequest) => {
    try {
      if (selectedArea && selectedArea.idArea) {
        await updateMutation.mutateAsync({ id: selectedArea.idArea, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowAreaModal(false);
      setSelectedArea(null);
    } catch (error) {
      // Erro já tratado nas mutations
      throw error;
    }
  }, [selectedArea, createMutation, updateMutation]);

  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setShowFilterModal(false);
    // setCurrentPage(0) já é chamado pelo useEffect acima
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setShowFilterModal(false);
  }, []);

  const handleCloseAreaModal = useCallback(() => {
    setShowAreaModal(false);
    setSelectedArea(null);
  }, []);

  const handleOpenCreateArea = useCallback(() => {
    setSelectedArea(null);
    setShowAreaModal(true);
  }, []);

  const filtrosAplicados = useMemo(() => [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.codigo ? [{
      key: 'codigo',
      label: 'Código',
      value: activeFilters.codigo,
      color: 'orange' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, codigo: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
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
    // Dados - Direto do React Query
    areas: data?.content || [],
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
    selectedArea,
    showAreaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    
    // Handlers
    loadAreas: refetch, // Expõe refetch como loadAreas para compatibilidade
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onAreaSave,
    handleCloseAreaModal,
    handleOpenCreateArea,
  };
}
