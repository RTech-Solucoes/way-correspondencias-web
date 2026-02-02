import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { ResponsavelResponse, PagedResponse } from '@/api/responsaveis/types';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { 
  useResponsaveisQuery, 
  useDeleteResponsavel,
  useGerarSenhaResponsavel
} from './use-responsaveis-query';

interface FiltersState {
  usuario: string;
  email: string;
}

const initialFilters: FiltersState = {
  usuario: '',
  email: '',
};

interface UseResponsaveisOptions {
  pageSize?: number;
}

export function useResponsaveis(options: UseResponsaveisOptions = {}) {
  const { pageSize = 10 } = options;
  const size = pageSize;

  // Estado de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<keyof ResponsavelResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado de filtros
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<FiltersState>(initialFilters);

  // Estado de modais
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelResponse | null>(null);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<ResponsavelResponse | null>(null);

  // Estado específico para gerar senha
  const [gerandoSenha, setGerandoSenha] = useState<number | null>(null);
  const [showGerarSenhaDialog, setShowGerarSenhaDialog] = useState(false);
  const [responsavelParaGerarSenha, setResponsavelParaGerarSenha] = useState<ResponsavelResponse | null>(null);

  const { canGerarSenhaResponsavel } = usePermissoes();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');
  const ldapEnabled = (process.env.NEXT_PUBLIC_LDAP_ENABLED || 'false') === 'true';

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
      nmUsuarioLogin: activeFilters.usuario || undefined,
      dsEmail: activeFilters.email || undefined,
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
  const { data, isLoading, refetch } = useResponsaveisQuery(queryParams);

  // Mutations
  const deleteMutation = useDeleteResponsavel();
  const gerarSenhaMutation = useGerarSenhaResponsavel();

  // Handlers
  const handleSort = useCallback((field: keyof ResponsavelResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection]);

  const handleEdit = useCallback((responsavel: ResponsavelResponse) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  }, []);

  const handleDelete = useCallback((responsavel: ResponsavelResponse) => {
    setResponsavelToDelete(responsavel);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (responsavelToDelete) {
      await deleteMutation.mutateAsync(responsavelToDelete.idResponsavel);
      setShowDeleteDialog(false);
      setResponsavelToDelete(null);
    }
  }, [responsavelToDelete, deleteMutation]);

  const onResponsavelSave = useCallback(() => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
    refetch();
  }, [refetch]);

  const handleGerarSenhaClick = useCallback((responsavel: ResponsavelResponse) => {
    if (!canGerarSenhaResponsavel) {
      return;
    }
    setResponsavelParaGerarSenha(responsavel);
    setShowGerarSenhaDialog(true);
  }, [canGerarSenhaResponsavel]);

  const confirmGerarSenha = useCallback(async () => {
    if (!responsavelParaGerarSenha) {
      return;
    }

    try {
      setGerandoSenha(responsavelParaGerarSenha.idResponsavel);
      await gerarSenhaMutation.mutateAsync(responsavelParaGerarSenha.idResponsavel);
    } finally {
      setGerandoSenha(null);
      setShowGerarSenhaDialog(false);
      setResponsavelParaGerarSenha(null);
    }
  }, [responsavelParaGerarSenha, gerarSenhaMutation]);

  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setShowFilterModal(false);
  }, []);

  const handleCloseResponsavelModal = useCallback(() => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
  }, []);

  const handleOpenCreateResponsavel = useCallback(() => {
    setSelectedResponsavel(null);
    setShowResponsavelModal(true);
  }, []);

  const filtrosAplicados = useMemo(() => [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.usuario ? [{
      key: 'usuario',
      label: 'Usuário',
      value: activeFilters.usuario,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, usuario: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.email ? [{
      key: 'email',
      label: 'Email',
      value: activeFilters.email,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, email: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : [])
  ], [searchQuery, activeFilters]);

  return {
    // Dados
    responsaveis: data?.content || [],
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
    applyFilters,
    clearFilters,
    filtrosAplicados,

    // Modais
    selectedResponsavel,
    showResponsavelModal,
    setShowResponsavelModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    responsavelToDelete,

    // Gerar Senha
    gerandoSenha,
    showGerarSenhaDialog,
    setShowGerarSenhaDialog,
    responsavelParaGerarSenha,
    setResponsavelParaGerarSenha,
    ldapEnabled,

    // Ordenação
    sortField,
    sortDirection,

    // Handlers
    loadResponsaveis: refetch,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onResponsavelSave,
    handleCloseResponsavelModal,
    handleOpenCreateResponsavel,
    handleGerarSenhaClick,
    confirmGerarSenha,
  };
}
