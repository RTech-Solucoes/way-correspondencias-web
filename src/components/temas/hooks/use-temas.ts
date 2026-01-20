import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TemaFilterParams, TemaRequest, TemaResponse, PagedResponse } from '@/api/temas/types';
import { temasClient } from '@/api/temas/client';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  nome: string;
  descricao: string;
}

const initialFilters: FiltersState = {
  nome: '',
  descricao: ''
};

interface UseTemasOptions {
  initialData?: PagedResponse<TemaResponse>;
  pageSize?: number;
}

export function useTemas(options: UseTemasOptions = {}) {
  const { initialData, pageSize } = options;
  
  // Usa o size do initialData ou o pageSize passado, ou padrão 10
  const size = initialData?.size || pageSize || 10;

  // Estado dos dados
  const [temas, setTemas] = useState<TemaResponse[]>(initialData?.content || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements || 0);

  // Estado de UI
  const [loading, setLoading] = useState(!initialData);
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

  const loadTemas = useCallback(async () => {
    setLoading(true);
    try {
      const params: TemaFilterParams = {
        filtro: debouncedSearchQuery || undefined,
        nmTema: activeFilters.nome || undefined,
        dsTema: activeFilters.descricao || undefined,
        page: currentPage,
        size: size,
        sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
      };

      const response = await temasClient.buscarPorFiltro(params);
      setTemas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      toast.error("Erro ao carregar temas");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery, sortField, sortDirection, size]);

  const [hasUsedInitialData, setHasUsedInitialData] = useState(false);

  useEffect(() => {
    if (initialData && !hasUsedInitialData && currentPage === 0 && !hasActiveFilters && !debouncedSearchQuery && !sortField) {
      setHasUsedInitialData(true);
      return;
    }
    
    loadTemas();
  }, [loadTemas, initialData, currentPage, hasActiveFilters, debouncedSearchQuery, sortField, hasUsedInitialData]);

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
      try {
        await temasClient.deletar(temaToDelete.idTema);
        toast.success("Tema excluído com sucesso");
        loadTemas();
      } catch {
        toast.error("Erro ao excluir tema");
      } finally {
        setShowDeleteDialog(false);
        setTemaToDelete(null);
      }
    }
  }, [temaToDelete, loadTemas]);

  const onTemaSave = useCallback(async (data: TemaRequest) => {
    try {
      if (selectedTema && selectedTema.idTema) {
        await temasClient.atualizar(selectedTema.idTema, data);
        toast.success('Tema atualizado com sucesso');
      } else {
        await temasClient.criar(data);
        toast.success('Tema criado com sucesso');
      }
      setShowTemaModal(false);
      setSelectedTema(null);
      loadTemas();
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Erro ao salvar tema';
      toast.error(errorMessage);
    }
  }, [selectedTema, loadTemas]);

  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setCurrentPage(0);
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
  }, [temas, sortField, sortDirection]);

  const filtrosAplicados = [
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
  ];

  return {
    // Dados
    temas: sortedTemas(),
    totalPages,
    totalElements,

    // UI State
    loading,
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
    loadTemas,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onTemaSave,
    handleCloseTemaModal,
    handleOpenCreateTema,
  };
}
