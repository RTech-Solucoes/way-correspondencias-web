import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ObrigacaoFiltroRequest, ObrigacaoResponse, ObrigacaoResumoResponse } from '@/api/obrigacao/types';
import obrigacaoClient from '@/api/obrigacao/client';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useUserGestao } from '@/hooks/use-user-gestao';
import { useValidarObrigacao } from '@/components/obrigacoes/conferencia/hooks/use-validar-obrigacao';
import { mostrarValidacaoObrigacaoToast } from '@/components/obrigacoes/criar/ValidarObrigacaoToast';
import { perfilUtil } from '@/api/perfis/types';
import { statusList, STATUS_LIST } from '@/api/status-solicitacao/types';
import { toast } from 'sonner';
import { 
  useObrigacoesQuery, 
  useUpdateStatusNaoAplicavelSuspenso,
  useEnviarParaArea,
  useDeleteObrigacao
} from './use-obrigacoes-query';

export interface FiltersState {
  titulo: string;
  responsavel: string;
  contrato: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  idStatusObrigacao: string;
  idAreaAtribuida: string;
  dtLimiteInicio: string;
  dtLimiteFim: string;
  dtInicioInicio: string;
  dtInicioFim: string;
  dtTerminoInicio: string;
  dtTerminoFim: string;
  idTema: string;
  idTipoClassificacao: string;
  idTipoPeriodicidade: string;
  idObrigacao: string;
}

const initialFilters: FiltersState = {
  titulo: '',
  responsavel: '',
  contrato: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  idStatusObrigacao: '',
  idAreaAtribuida: '',
  dtLimiteInicio: '',
  dtLimiteFim: '',
  dtInicioInicio: '',
  dtInicioFim: '',
  dtTerminoInicio: '',
  dtTerminoFim: '',
  idTema: '',
  idTipoClassificacao: '',
  idTipoPeriodicidade: '',
  idObrigacao: '',
};

interface UseObrigacoesOptions {
  pageSize?: number;
  idObrigacaoFromUrl?: number;
  defaultFilters?: Partial<ObrigacaoFiltroRequest>;
}

function createInitialFilters(defaultFilters?: Partial<ObrigacaoFiltroRequest>): FiltersState {
  return {
    ...initialFilters,
    dtLimiteInicio: defaultFilters?.dtLimiteInicio || '',
    dtLimiteFim: defaultFilters?.dtLimiteFim || '',
    dtTerminoInicio: defaultFilters?.dtTerminoInicio || '',
    dtTerminoFim: defaultFilters?.dtTerminoFim || '',
  };
}

export function useObrigacoes(options: UseObrigacoesOptions = {}) {
  const { pageSize = 10, idObrigacaoFromUrl, defaultFilters } = options;
  const router = useRouter();
  
  // Permissões
  const permissions = usePermissoes();
  const { idPerfil } = useUserGestao();
  const { validar } = useValidarObrigacao();

  // Estado de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado de filtros - inicializado com os filtros padrão do servidor
  const [filters, setFilters] = useState<FiltersState>(() => createInitialFilters(defaultFilters));

  // Estado de modais
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoResponse | null>(null);
  const [showObrigacaoModal, setShowObrigacaoModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [obrigacaoToDelete, setObrigacaoToDelete] = useState<ObrigacaoResponse | null>(null);
  
  // Modais específicos de obrigações
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAnexarProtocoloModal, setShowAnexarProtocoloModal] = useState(false);
  const [obrigacaoParaProtocolo, setObrigacaoParaProtocolo] = useState<ObrigacaoResponse | null>(null);
  const [showObrigacoesCondicionadasModal, setShowObrigacoesCondicionadasModal] = useState(false);
  const [obrigacoesCondicionadas, setObrigacoesCondicionadas] = useState<ObrigacaoResumoResponse[]>([]);
  const [showNaoAplicavelSuspensoModal, setShowNaoAplicavelSuspensoModal] = useState(false);
  const [obrigacaoParaNaoAplicavelSuspenso, setObrigacaoParaNaoAplicavelSuspenso] = useState<ObrigacaoResponse | null>(null);
  const [showTramitacaoModal, setShowTramitacaoModal] = useState(false);
  const [obrigacaoParaTramitacao, setObrigacaoParaTramitacao] = useState<ObrigacaoResponse | null>(null);
  const [showConfirmTramitacao, setShowConfirmTramitacao] = useState(false);
  const [obrigacaoParaConfirmarTramitacao, setObrigacaoParaConfirmarTramitacao] = useState<ObrigacaoResponse | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Refs para detectar mudança de filtros
  const prevFiltersRef = useRef(JSON.stringify(filters));
  const prevSearchRef = useRef(debouncedSearchQuery);
  const prevIdObrigacaoRef = useRef(idObrigacaoFromUrl);

  // Reset de página quando filtros ou busca mudam
  useEffect(() => {
    if (prevIdObrigacaoRef.current !== idObrigacaoFromUrl) {
      prevIdObrigacaoRef.current = idObrigacaoFromUrl;
      setCurrentPage(0);
      return;
    }

    const currentFiltersStr = JSON.stringify(filters);
    const filtersChanged = prevFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchRef.current !== debouncedSearchQuery;

    if (filtersChanged || searchChanged) {
      prevFiltersRef.current = currentFiltersStr;
      prevSearchRef.current = debouncedSearchQuery;

      if (currentPage !== 0) {
        setCurrentPage(0);
      }
    }
  }, [idObrigacaoFromUrl, filters, debouncedSearchQuery, currentPage]);

  // Parâmetros para a query
  const queryParams = useMemo(() => {
    return {
      filtro: debouncedSearchQuery || null,
      idObrigacao: idObrigacaoFromUrl || null,
      idStatusSolicitacao: filters.idStatusObrigacao ? parseInt(filters.idStatusObrigacao) : null,
      idAreaAtribuida: filters.idAreaAtribuida ? parseInt(filters.idAreaAtribuida) : null,
      dtLimiteInicio: filters.dtLimiteInicio || null,
      dtLimiteFim: filters.dtLimiteFim || null,
      dtInicioInicio: filters.dtInicioInicio || null,
      dtInicioFim: filters.dtInicioFim || null,
      dtTerminoInicio: filters.dtTerminoInicio || null,
      dtTerminoFim: filters.dtTerminoFim || null,
      idTema: filters.idTema ? parseInt(filters.idTema) : null,
      idTipoClassificacao: filters.idTipoClassificacao ? parseInt(filters.idTipoClassificacao) : null,
      idTipoPeriodicidade: filters.idTipoPeriodicidade ? parseInt(filters.idTipoPeriodicidade) : null,
      page: currentPage,
      size: pageSize,
      sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
    };
  }, [debouncedSearchQuery, idObrigacaoFromUrl, filters, currentPage, pageSize, sortField, sortDirection]);

  // Query e mutations (sempre habilitado - o middleware protege as rotas)
  const { data, isLoading, refetch } = useObrigacoesQuery(queryParams);
  const { mutateAsync: updateStatusNaoAplicavel } = useUpdateStatusNaoAplicavelSuspenso();
  const { mutateAsync: enviarParaArea } = useEnviarParaArea();
  const { mutateAsync: deleteObrigacao } = useDeleteObrigacao();

  const obrigacoes = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Handlers
  const handleSort = useCallback((field: string) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection]);

  const loadObrigacoes = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = useCallback((obrigacao: ObrigacaoResponse) => {
    if (!obrigacao.idSolicitacao) return;
    router.push(`/obrigacao/${obrigacao.idSolicitacao}/editar`);
  }, [router]);

  const handleVisualize = useCallback((obrigacao: ObrigacaoResponse) => {
    if (!obrigacao.idSolicitacao) return;
    router.push(`/obrigacao/${obrigacao.idSolicitacao}/conferencia`);
  }, [router]);

  const handleDelete = useCallback((obrigacao: ObrigacaoResponse) => {
    setObrigacaoToDelete(obrigacao);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!obrigacaoToDelete?.idSolicitacao) return;

    try {
      await deleteObrigacao(obrigacaoToDelete.idSolicitacao);
      setShowDeleteDialog(false);
      setObrigacaoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir obrigação:', error);
    }
  }, [obrigacaoToDelete, deleteObrigacao]);

  const handleNaoAplicavelSuspenso = useCallback((obrigacao: ObrigacaoResponse) => {
    setObrigacaoParaNaoAplicavelSuspenso(obrigacao);
    setShowNaoAplicavelSuspensoModal(true);
  }, []);

  const handleConfirmNaoAplicavelSuspenso = useCallback(async (justificativa: string) => {
    if (!obrigacaoParaNaoAplicavelSuspenso?.idSolicitacao) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    try {
      await updateStatusNaoAplicavel({
        id: obrigacaoParaNaoAplicavelSuspenso.idSolicitacao,
        justificativa
      });
      setShowNaoAplicavelSuspensoModal(false);
      setObrigacaoParaNaoAplicavelSuspenso(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }, [obrigacaoParaNaoAplicavelSuspenso, updateStatusNaoAplicavel]);

  const handleEnviarArea = useCallback(async (obrigacao: ObrigacaoResponse) => {
    if (!obrigacao.idSolicitacao) return;
    
    try {
      const { isValid, errors } = await validar(obrigacao.idSolicitacao);

      if (!isValid) {
        mostrarValidacaoObrigacaoToast(errors, {
          mensagemPersonalizada: 'É necessário preencher todos os campos obrigatórios antes de enviar para as áreas.',
        });
        return;
      }

      await enviarParaArea(obrigacao.idSolicitacao);
    } catch (error) {
      console.error('Erro ao enviar obrigação para área:', error);
    }
  }, [validar, enviarParaArea]);

  const handleAnexarProtocolo = useCallback(async (obrigacao: ObrigacaoResponse) => {
    if (!obrigacao.idSolicitacao) return;
    
    try {
      const response = await obrigacaoClient.buscarObrigacoesCondicionadas(obrigacao.idSolicitacao);
      const condicionadas = response.obrigacoesCondicionadas || [];
      const condicionadasPendentes = condicionadas.filter(
        (cond) => cond.statusSolicitacao?.idStatusSolicitacao !== statusList.CONCLUIDO.id
      );

      if (condicionadasPendentes.length > 0) {
        setObrigacoesCondicionadas(condicionadasPendentes);
        setShowObrigacoesCondicionadasModal(true);
      } else {
        setObrigacaoParaProtocolo(obrigacao);
        setShowAnexarProtocoloModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar obrigações condicionadas:', error);
      toast.error('Erro ao verificar obrigações condicionadas. Tente novamente.');
    }
  }, []);

  const handleEncaminharTramitacao = useCallback((obrigacao: ObrigacaoResponse) => {
    const isEmValidacao = obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.EM_VALIDACAO_REGULATORIO.id;                          
    if (isEmValidacao) {
      setObrigacaoParaConfirmarTramitacao(obrigacao);
      setShowConfirmTramitacao(true);
    } else {
      setObrigacaoParaTramitacao(obrigacao);
      setShowTramitacaoModal(true);
    }
  }, []);

  // Helpers
  const isAdminOrGestor = useMemo(() => {
    return idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.ADMIN_MASTER ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA ||
      idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
      idPerfil === perfilUtil.TECNICO_SUPORTE;
  }, [idPerfil]);

  const getStatusText = useCallback((statusCode: string): string | null => {
    if (!statusCode) return null;
    const status = STATUS_LIST.find(s => s.id.toString() === statusCode);
    return status ? status.label : null;
  }, []);

  return {
    // Dados
    obrigacoes,
    totalPages,
    totalElements,
    loading: isLoading,
    
    // UI State
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    
    // Filtros
    filters,
    setFilters,
    
    // Modais principais
    selectedObrigacao,
    setSelectedObrigacao,
    showObrigacaoModal,
    setShowObrigacaoModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    
    // Modais específicos
    showImportModal,
    setShowImportModal,
    showAnexarProtocoloModal,
    setShowAnexarProtocoloModal,
    obrigacaoParaProtocolo,
    setObrigacaoParaProtocolo,
    showObrigacoesCondicionadasModal,
    setShowObrigacoesCondicionadasModal,
    obrigacoesCondicionadas,
    setObrigacoesCondicionadas,
    showNaoAplicavelSuspensoModal,
    setShowNaoAplicavelSuspensoModal,
    obrigacaoParaNaoAplicavelSuspenso,
    setObrigacaoParaNaoAplicavelSuspenso,
    showTramitacaoModal,
    setShowTramitacaoModal,
    obrigacaoParaTramitacao,
    setObrigacaoParaTramitacao,
    showConfirmTramitacao,
    setShowConfirmTramitacao,
    obrigacaoParaConfirmarTramitacao,
    setObrigacaoParaConfirmarTramitacao,
    
    // Permissões
    canInserirObrigacao: !!permissions.canInserirObrigacao,
    canDeletarObrigacao: !!permissions.canDeletarObrigacao,
    canConcluirObrigacao: !!permissions.canConcluirObrigacao,
    canEnviarAreasObrigacao: !!permissions.canEnviarAreasObrigacao,
    canNaoAplicavelSuspensaObrigacao: !!permissions.canNaoAplicavelSuspensaObrigacao,
    
    // Ordenação
    sortField,
    sortDirection,
    
    // Handlers
    loadObrigacoes,
    handleSort,
    handleEdit,
    handleVisualize,
    handleDelete,
    confirmDelete,
    handleNaoAplicavelSuspenso,
    handleConfirmNaoAplicavelSuspenso,
    handleEnviarArea,
    handleAnexarProtocolo,
    handleEncaminharTramitacao,
    
    // Helpers
    isAdminOrGestor,
    getStatusText,
    idPerfil,
  };
}
