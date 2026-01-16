import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AreaFilterParams, AreaRequest, AreaResponse, PagedResponse } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';
import { useDebounce } from '@/hooks/use-debounce';

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
  initialData?: PagedResponse<AreaResponse>;
  pageSize?: number;
}

export function useAreas(options: UseAreasOptions = {}) {
  const { initialData, pageSize } = options;
  
  // Usa o size do initialData ou o pageSize passado, ou padrão 10
  const size = initialData?.size || pageSize || 10;

  // Estado dos dados
  const [areas, setAreas] = useState<AreaResponse[]>(initialData?.content || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements || 0);

  // Estado de UI
  const [loading, setLoading] = useState(!initialData);
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

  const loadAreas = useCallback(async () => {
    setLoading(true);
    try {
      const params: AreaFilterParams = {
        filtro: debouncedSearchQuery || undefined,
        cdArea: activeFilters.codigo || undefined,
        nmArea: activeFilters.nome || undefined,
        dsArea: activeFilters.descricao || undefined,
        page: currentPage,
        size: size,
        sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
      };

      const response = await areasClient.buscarPorFiltro(params);
      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery, sortField, sortDirection]);

  const hasUsedInitialDataRef = useRef(false);

  useEffect(() => {
    // Evita recarregar na primeira montagem se temos dados iniciais válidos
    // Isso previne uma requisição duplicada no SSR
    const shouldSkipInitialLoad = initialData && 
                                   !hasUsedInitialDataRef.current && 
                                   currentPage === 0 && 
                                   !hasActiveFilters && 
                                   !debouncedSearchQuery && 
                                   !sortField;
    
    if (shouldSkipInitialLoad) {
      hasUsedInitialDataRef.current = true;
      return;
    }
    
    loadAreas();
  }, [currentPage, activeFilters, debouncedSearchQuery, sortField, loadAreas, initialData, hasActiveFilters]);

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
      try {
        await areasClient.deletar(areaToDelete);
        toast.success("Área excluída com sucesso");
        loadAreas();
      } catch {
        toast.error("Erro ao excluir área");
      } finally {
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  }, [areaToDelete, loadAreas]);

  const onAreaSave = useCallback(async (data: AreaRequest) => {
    try {
      if (selectedArea && selectedArea.idArea) {
        await areasClient.atualizar(selectedArea.idArea, data);
        toast.success('Área atualizada com sucesso');
      } else {
        await areasClient.criar(data);
        toast.success('Área criada com sucesso');
      }
      setShowAreaModal(false);
      setSelectedArea(null);
      loadAreas();
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Erro ao salvar área';
      toast.error(errorMessage);
    }
  }, [selectedArea, loadAreas]);

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

  const handleCloseAreaModal = useCallback(() => {
    setShowAreaModal(false);
    setSelectedArea(null);
  }, []);

  const handleOpenCreateArea = useCallback(() => {
    setSelectedArea(null);
    setShowAreaModal(true);
  }, []);

  const filtrosAplicados = [
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
  ];

  return {
    // Dados
    areas,
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
    selectedArea,
    showAreaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    
    // Handlers
    loadAreas,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onAreaSave,
    handleCloseAreaModal,
    handleOpenCreateArea,
  };
}