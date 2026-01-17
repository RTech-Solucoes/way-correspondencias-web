import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ResponsavelFilterParams, ResponsavelResponse, PagedResponse } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';

interface FiltersState {
  usuario: string;
  email: string;
}

const initialFilters: FiltersState = {
  usuario: '',
  email: '',
};

interface UseResponsaveisOptions {
  initialData?: PagedResponse<ResponsavelResponse> | null;
  pageSize?: number;
}

export function useResponsaveis(options: UseResponsaveisOptions = {}) {
  const { initialData, pageSize } = options;
  
  const size = initialData?.size || pageSize || 10;

  // Estado dos dados
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>(initialData?.content || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements || 0);

  // Estado de UI
  const [loading, setLoading] = useState(!initialData);
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

  const loadResponsaveis = useCallback(async () => {
    setLoading(true);
    try {
      const params: ResponsavelFilterParams = {
        filtro: debouncedSearchQuery || undefined,
        nmUsuarioLogin: activeFilters.usuario || undefined,
        dsEmail: activeFilters.email || undefined,
        page: currentPage,
        size: size,
        sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
      };

      const response = await responsaveisClient.buscarPorFiltro(params);
      setResponsaveis(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      toast.error("Erro ao carregar responsáveis");
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
    
    loadResponsaveis();
  }, [loadResponsaveis, initialData, currentPage, hasActiveFilters, debouncedSearchQuery, sortField, hasUsedInitialData]);

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
      try {
        await responsaveisClient.deletar(responsavelToDelete.idResponsavel);
        toast.success("Responsável excluído com sucesso");
        loadResponsaveis();
      } catch {
        toast.error("Erro ao excluir responsável");
      } finally {
        setShowDeleteDialog(false);
        setResponsavelToDelete(null);
      }
    }
  }, [responsavelToDelete, loadResponsaveis]);

  const onResponsavelSave = useCallback(() => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
    loadResponsaveis();
  }, [loadResponsaveis]);

  const handleGerarSenhaClick = useCallback((responsavel: ResponsavelResponse) => {
    if (!canGerarSenhaResponsavel) {
      toast.error('Você não tem permissão para gerar senha.');
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
      await responsaveisClient.gerarSenhaEEnviarEmail(responsavelParaGerarSenha.idResponsavel);
      toast.success('Senha gerada e enviada por email com sucesso!');
      loadResponsaveis();
    } catch (error) {
      console.error('Erro ao gerar senha:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao gerar senha. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setGerandoSenha(null);
      setShowGerarSenhaDialog(false);
      setResponsavelParaGerarSenha(null);
    }
  }, [responsavelParaGerarSenha, loadResponsaveis]);

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

  const handleCloseResponsavelModal = useCallback(() => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
  }, []);

  const handleOpenCreateResponsavel = useCallback(() => {
    setSelectedResponsavel(null);
    setShowResponsavelModal(true);
  }, []);

  const filtrosAplicados = [
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
  ];

  return {
    // Dados
    responsaveis,
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
    loadResponsaveis,
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
