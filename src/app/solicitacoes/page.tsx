'use client';

import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import {Button} from '@/components/ui/button';
import ExportSolicitacaoMenu from '@/components/solicitacoes/ExportSolicitacaoMenu';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import SolicitacaoModal from '../../components/solicitacoes/SolicitacaoModal';
import DetalhesSolicitacaoModal from '@/components/solicitacoes/DetalhesSolicitacaoModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import {
  ArrowClockwiseIcon,
  ArrowsDownUpIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PaperPlaneRightIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon
} from '@phosphor-icons/react';
import PageTitle from '@/components/ui/page-title';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {responsaveisClient} from '@/api/responsaveis/client';
import {temasClient} from '@/api/temas/client';
import {areasClient} from '@/api/areas/client';
import {toast} from 'sonner';
import {useDebounce} from '@/hooks/use-debounce';
import {Pagination} from '@/components/ui/pagination';
import {useSolicitacoes} from '@/context/solicitacoes/SolicitacoesContext';
import HistoricoRespostasModal from '@/components/solicitacoes/HistoricoRespostasModal';
import FilterModal from '@/components/solicitacoes/FilterModal';
import { statusSolicitacaoClient } from '@/api/status-solicitacao/client';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import anexosClient from '@/api/anexos/client';
import {AnexoResponse, TipoObjetoAnexo, ArquivoDTO} from '@/api/anexos/type';
import {
  AreaSolicitacao,
  PagedResponse,
  SolicitacaoDetalheResponse,
  SolicitacaoResponse
} from '@/api/solicitacoes/types';
import {useTramitacoesMutation} from '@/hooks/use-tramitacoes';
import tramitacoesClient from '@/api/tramitacoes/client';
import {usePermissoes} from "@/context/permissoes/PermissoesContext";
import LoadingRows from "@/components/solicitacoes/LoadingRows";
import { statusList } from '@/api/status-solicitacao/types';
import { formatDateBr } from '@/utils/utils';
import { useSearchParams } from 'next/navigation';
import TimeProgress from '@/components/ui/time-progress';

export default function SolicitacoesPage() {
  return (
    <Suspense fallback={<div />}> 
      <SolicitacoesPageContent />
    </Suspense>
  );
}

function SolicitacoesPageContent() {
  const searchParams = useSearchParams();
  const {
    solicitacoes,
    setSolicitacoes,
    responsaveis,
    setResponsaveis,
    temas,
    setTemas,
    areas,
    setAreas,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    selectedSolicitacao,
    setSelectedSolicitacao,
    showSolicitacaoModal,
    setShowSolicitacaoModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    solicitacaoToDelete,
    setSolicitacaoToDelete,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalElements,
    setTotalElements,
    filters,
    setFilters,
    activeFilters,
    setActiveFilters,
    sortField,
    sortDirection,
    hasActiveFilters,
    handleEdit,
    handleDelete,
    handleSolicitacaoSave,
    applyFilters,
    clearFilters,
    getStatusBadgeVariant,
    getStatusBadgeBg,
    getStatusText,
    handleSort,
  } = useSolicitacoes();

  const tramitacoesMutation = useTramitacoesMutation();
  const {canInserirSolicitacao, canAtualizarSolicitacao, canDeletarSolicitacao} = usePermissoes()
  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [detalhesSolicitacao, setDetalhesSolicitacao] = useState<SolicitacaoDetalheResponse | null>(null);
  const [detalhesAnexos, setDetalhesAnexos] = useState<AnexoResponse[]>([]);
  const [showTramitacaoModal, setShowTramitacaoModal] = useState(false);
  const [tramitacaoSolicitacaoId, setTramitacaoSolicitacaoId] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<{ idStatusSolicitacao: number; nmStatus: string; flAtivo?: string }[]>([]);
  
  const handleTramitacoes = (solicitacao: SolicitacaoResponse) => {
    setTramitacaoSolicitacaoId(solicitacao.idSolicitacao);
    setShowTramitacaoModal(true);
  };

  const prefilledFilters = useMemo(() => {
    const idSolicitacaoParam = searchParams.get('idSolicitacao');
    return {
      idSolicitacao: idSolicitacaoParam ? Number(idSolicitacaoParam) : undefined,
    };
  }, [searchParams]);

  const loadSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);

      const filtro = debouncedSearchQuery || undefined;

      const idStatusSolicitacao = activeFilters.status && activeFilters.status !== 'all'
        ? Number(activeFilters.status)
        : undefined;
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

      const response = await solicitacoesClient.buscarPorFiltro({
        filtro,
        page: currentPage,
        size: 10,
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
        const paginatedResponse = response as unknown as PagedResponse<SolicitacaoResponse>;
        setSolicitacoes(paginatedResponse.content ?? []);
        setTotalPages(paginatedResponse.totalPages ?? 1);
        setTotalElements(paginatedResponse.totalElements ?? 0);
      } else {
        setSolicitacoes(response ?? []);
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
    prefilledFilters,
    sortField,
    sortDirection,
    setSolicitacoes,
    setTotalPages,
    setTotalElements,
    setLoading
  ]);


  const loadResponsaveis = useCallback(async () => {
    try {
      const response = await responsaveisClient.buscarPorFiltro({size: 100});
      setResponsaveis(response.content ?? []);
    } catch {
    }
  }, [setResponsaveis]);

  const loadTemas = useCallback(async () => {
    try {
      const response = await temasClient.buscarPorFiltro({size: 400});
      setTemas(response.content ?? []);
    } catch {
    }
  }, [setTemas]);

  const loadAreas = useCallback(async () => {
    try {
      const response = await areasClient.buscarPorFiltro({size: 100});
      setAreas(response.content ?? []);
    } catch {
    }
  }, [setAreas]);

  const handleCloseTramitacaoModal = useCallback(() => {
    setShowTramitacaoModal(false);
    setTramitacaoSolicitacaoId(null);
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  useEffect(() => {
    loadSolicitacoes();
    statusSolicitacaoClient.listarTodos().then(setStatuses).catch(() => {});
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, [loadSolicitacoes, loadResponsaveis, loadTemas, loadAreas]);

  useEffect(() => {
    loadSolicitacoes();
  }, [activeFilters, loadSolicitacoes]);
  const appliedFilters = [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.identificacao ? [{
      key: 'identificacao',
      label: 'Identificação',
      value: activeFilters.identificacao,
      color: 'orange' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, identificacao: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.status && activeFilters.status !== 'all' ? [{
      key: 'status',
      label: 'Status',
      value: statuses.find(s => s.idStatusSolicitacao.toString() === activeFilters.status)?.nmStatus || activeFilters.status,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, status: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.area && activeFilters.area !== 'all' ? [{
      key: 'area',
      label: 'Área',
      value: areas.find(a => a.idArea.toString() === activeFilters.area)?.nmArea || activeFilters.area,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, area: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.tema && activeFilters.tema !== 'all' ? [{
      key: 'tema',
      label: 'Tema',
      value: temas.find(t => t.idTema.toString() === activeFilters.tema)?.nmTema || activeFilters.tema,
      color: 'indigo' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, tema: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.nmResponsavel ? [{
      key: 'nmResponsavel',
      label: 'Nome do Responsável',
      value: activeFilters.nmResponsavel,
      color: 'yellow' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, nmResponsavel: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.dtCriacaoInicio ? [{
      key: 'dtCriacaoInicio',
      label: 'Data Criação Início',
      value: formatDateBr(activeFilters.dtCriacaoInicio),
      color: 'pink' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, dtCriacaoInicio: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.dtCriacaoFim ? [{
      key: 'dtCriacaoFim',
      label: 'Data Criação Fim',
      value: formatDateBr(activeFilters.dtCriacaoFim),
      color: 'pink' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, dtCriacaoFim: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.flExigeCienciaGerenteRegul && activeFilters.flExigeCienciaGerenteRegul !== 'all' ? [{
      key: 'flExigeCienciaGerenteRegul',
      label: 'Exige Ciência do Gerente',
      value: activeFilters.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : 'Não, apenas ciência',
      color: 'blue' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, flExigeCienciaGerenteRegul: 'all' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : [])
  ];

  const confirmDelete = async () => {
    if (solicitacaoToDelete) {
      try {
        await solicitacoesClient.deletar(solicitacaoToDelete.idSolicitacao);
        toast.success('Solicitação excluída com sucesso');
        loadSolicitacoes();
      } catch {
        toast.error('Erro ao excluir solicitação');
      } finally {
        setShowDeleteDialog(false);
        setSolicitacaoToDelete(null);
      }
    }
  };

  const onSolicitacaoSave = () => {
    handleSolicitacaoSave();
    loadSolicitacoes();
  };

  const getByPath = (obj: unknown, path: string): unknown => {
    return path
      .split('.')
      .reduce<unknown>((acc, key) => {
        if (acc !== null && typeof acc === 'object' && acc !== undefined && key in (acc as Record<string, unknown>)) {
          return (acc as Record<string, unknown>)[key];
        }
        return undefined;
      }, obj) ?? null;
  };

  const sortedSolicitacoes = () => {
    if (!solicitacoes || solicitacoes.length === 0) return [];
    const sorted = [...solicitacoes];

    if (sortField) {
      sorted.sort((a: SolicitacaoResponse, b: SolicitacaoResponse) => {
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
          const cmp = aValue.localeCompare(bValue, 'pt-BR', {numeric: true, sensitivity: 'base'});
          return sortDirection === 'asc' ? cmp : -cmp;
        }

        const cmp = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return sorted;
  };

  const openDetalhes = useCallback(async (s: SolicitacaoResponse) => {
    setSelectedSolicitacao(s);
    setShowDetalhesModal(true);
    setDetalhesSolicitacao(null);

    try {
      const detalhes = await solicitacoesClient.buscarDetalhesPorId(s.idSolicitacao);
      setDetalhesSolicitacao(detalhes);
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(s.idSolicitacao, TipoObjetoAnexo.S);
      setDetalhesAnexos(anexos || []);
    } catch {
      toast.error('Erro ao carregar os detalhes da solicitação');
      setDetalhesSolicitacao(null);
    }
  }, [setSelectedSolicitacao]);

  const abrirEmailOriginal = useCallback(() => {
    toast.message('Abrir e-mail original (implemente a navegação/URL).');
  }, []);

  const abrirHistorico = useCallback(() => {
    toast.message('Abrir histórico de respostas (implemente a navegação).');
  }, []);

  const enviarDevolutiva = useCallback(async (mensagem: string, arquivos: ArquivoDTO[], flAprovado?: 'S' | 'N') => {
    const alvo = detalhesSolicitacao;
    if (!alvo) return;
    try {
      const data = {
        dsObservacao: mensagem || '',
        idSolicitacao: alvo.solicitacao.idSolicitacao,
        flAprovado: flAprovado,
        arquivos: arquivos,
      };
      await tramitacoesClient.tramitar(data);
      await loadSolicitacoes();
    } catch (err) {
      throw err;
    }
  }, [detalhesSolicitacao, loadSolicitacoes]);

  const getJoinedNmAreas = (areas: AreaSolicitacao[] | undefined) => {
    if (areas && areas.length > 0) {
      return areas.map(a => a.nmArea).join(', ');
    }
    return '-';
  }


  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between">
        <PageTitle />

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadSolicitacoes();
            }}
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {totalElements} {totalElements > 1 ? "solicitações" : "solicitação"}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            loading={loading}
            showOnlyPaginationButtons={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar solicitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={clearFilters}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}

          <ExportSolicitacaoMenu
            filterParams={{
              filtro: searchQuery || undefined,
              idStatusSolicitacao: activeFilters.status && activeFilters.status !== 'all' ? Number(activeFilters.status) : undefined,
              idArea: activeFilters.area && activeFilters.area !== 'all' ? Number(activeFilters.area) : undefined,
              idTema: activeFilters.tema && activeFilters.tema !== 'all' ? Number(activeFilters.tema) : undefined,
              cdIdentificacao: activeFilters.identificacao || undefined,
              nmResponsavel: activeFilters.nmResponsavel || undefined,
              dtCriacaoInicio: activeFilters.dtCriacaoInicio ? `${activeFilters.dtCriacaoInicio}T00:00:00` : undefined,
              dtCriacaoFim: activeFilters.dtCriacaoFim ? `${activeFilters.dtCriacaoFim}T23:59:59` : undefined,
              sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
            }}
            getStatusText={getStatusText}
          />

          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          {canInserirSolicitacao &&
            <Button
              onClick={() => {
                setSelectedSolicitacao(null);
                setShowSolicitacaoModal(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Solicitação
            </Button>
          }
        </div>
      </div>

      <FiltrosAplicados
        filters={appliedFilters}
        showClearAll={false}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-1 overflow-auto">
        <StickyTable>
          <StickyTableHeader>
            <StickyTableRow>
              <StickyTableHead
                className="cursor-pointer"
                onClick={() => handleSort('cdIdentificacao')}
              >
                <div className="flex items-center">
                  Identificação
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead
                className="cursor-pointer"
                onClick={() => handleSort('dsAssunto')}
              >
                <div className="flex items-center">
                  Assunto
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead>Áreas</StickyTableHead>
              <StickyTableHead
                className="cursor-pointer"
                onClick={() => handleSort('tema.nmTema')}
              >
                <div className="flex items-center">
                  Tema
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="min-w-[220px]">Progresso</StickyTableHead>
              <StickyTableHead className="min-w-[220px] text-center">Aprovação Gerente do Regulatório</StickyTableHead>
              <StickyTableHead
                className="cursor-pointer"
                onClick={() => handleSort('statusSolicitacao.nmStatus')}
              >
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="text-right">Ações</StickyTableHead>
            </StickyTableRow>
          </StickyTableHeader>
          <StickyTableBody>
            {loading ? (
              <LoadingRows
                canAtualizarSolicitacao={canAtualizarSolicitacao}
                canDeletarSolicitacao={canDeletarSolicitacao}
              />
            ) : solicitacoes?.length === 0 ? (
              <StickyTableRow>
                <StickyTableCell
                  colSpan={7}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ClipboardTextIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhuma solicitação encontrada</p>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : (
              sortedSolicitacoes()?.map((solicitacao: SolicitacaoResponse) => (
                <React.Fragment key={solicitacao.idSolicitacao}>
                  <StickyTableRow>
                    <StickyTableCell className="font-medium">{solicitacao.cdIdentificacao}</StickyTableCell>
                    <StickyTableCell className="max-w-xs truncate">{solicitacao.dsAssunto}</StickyTableCell>
                    <StickyTableCell>
                      {(solicitacao.area && solicitacao.area.length > 0) ? (
                        <div className="flex items-center flex-wrap gap-1" title={getJoinedNmAreas(solicitacao.area)}>
                          {solicitacao.area.slice(0, 2).map((area: AreaSolicitacao) => (
                            <span
                              key={area.idArea}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {area.nmArea}
                            </span>
                          ))}
                          {solicitacao.area.length > 2 && (
                            <span className="text-xs text-gray-500 h-fit">
                              +{solicitacao.area.length - 2} mais
                            </span>
                          )}
                        </div>
                      ) : (solicitacao.tema?.areas && solicitacao.tema.areas.length > 0) ? (
                        <div className="flex items-center flex-wrap gap-1" title={getJoinedNmAreas(solicitacao.area)}>
                          {solicitacao.tema.areas.slice(0, 2).map((area: AreaSolicitacao) => (
                            <span
                              key={area.idArea}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {area.nmArea}
                            </span>
                          ))}
                          {solicitacao.tema.areas.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{solicitacao.tema.areas.length - 2} mais
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </StickyTableCell>
                    <StickyTableCell>{solicitacao.nmTema || solicitacao?.tema?.nmTema || '-'}</StickyTableCell>
                    <StickyTableCell className="min-w-[220px]">
                      <TimeProgress
                        dtPrimeiraTramitacao={solicitacao.dtPrimeiraTramitacao}
                        dtPrazoLimite={solicitacao.dtPrazoLimite}
                        dataConclusaoTramitacao={solicitacao.dtConclusaoTramitacao}
                        now={new Date().toISOString()}
                        statusLabel={solicitacao.statusSolicitacao?.nmStatus}
                      />
                    </StickyTableCell>
                    <StickyTableCell className="min-w-[220px] text-center">
                      {solicitacao.flExigeCienciaGerenteRegul === 'N' ? 'Não, apenas ciência' :
                        (solicitacao.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : '-')}
                    </StickyTableCell>
                    <StickyTableCell>
                      <Badge
                        className="whitespace-nowrap truncate text-white"
                        variant={getStatusBadgeVariant(
                          solicitacao.statusSolicitacao?.idStatusSolicitacao?.toString() ||
                          solicitacao.statusCodigo?.toString() || ''
                        )}
                        style={{
                          backgroundColor: getStatusBadgeBg(
                            solicitacao.statusSolicitacao?.idStatusSolicitacao?.toString() ||
                            solicitacao.statusCodigo?.toString() || ''
                          )
                        }}
                      >
                        {solicitacao.statusSolicitacao?.nmStatus ||
                          getStatusText(solicitacao.statusCodigo?.toString() || '') ||
                          '-'}
                      </Badge>
                    </StickyTableCell>
                    <StickyTableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!(
                          solicitacao.statusSolicitacao?.nmStatus === statusList.PRE_ANALISE.label ||
                          solicitacao.statusSolicitacao?.idStatusSolicitacao === 1 ||
                          getStatusText(solicitacao.statusCodigo?.toString() || '') === statusList.PRE_ANALISE.label
                      ) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await openDetalhes(solicitacao);
                            }}
                            title="Enviar resposta"
                          >
                            <PaperPlaneRightIcon className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTramitacoes(solicitacao);
                          }}
                          title="Ver Tramitações"
                        >
                          <ClockCounterClockwiseIcon className="h-4 w-4" />
                        </Button>
                        {canAtualizarSolicitacao &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(solicitacao);
                            }}
                            title="Editar"
                          >
                            <PencilSimpleIcon className="h-4 w-4" />
                          </Button>
                        }
                        {canDeletarSolicitacao &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(solicitacao);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        }
                      </div>
                    </StickyTableCell>
                  </StickyTableRow>
                </React.Fragment>
              ))
            )}
          </StickyTableBody>
        </StickyTable>
      </div>

      <FilterModal
        open={showFilterModal}
        onOpenChange={setShowFilterModal}
        filters={filters}
        setFilters={setFilters}
        temas={temas}
        areas={areas}
        statuses={statuses}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      {showSolicitacaoModal && (
        <SolicitacaoModal
          solicitacao={selectedSolicitacao}
          open={showSolicitacaoModal}
          onClose={() => {
            setShowSolicitacaoModal(false);
            setSelectedSolicitacao(null);
            loadSolicitacoes();
          }}
          onSave={onSolicitacaoSave}
          responsaveis={responsaveis}
          temas={temas}
        />
      )}

      {showDetalhesModal && detalhesSolicitacao && (
        <DetalhesSolicitacaoModal
          open={showDetalhesModal}
          onClose={() => {
            setShowDetalhesModal(false);
            setSelectedSolicitacao(null);
            setDetalhesSolicitacao(null);
            loadSolicitacoes();
          }}
          solicitacao={detalhesSolicitacao}
          anexos={(detalhesAnexos ?? [])}
          statusLabel={getStatusText((detalhesSolicitacao)?.statusSolicitacao?.nmStatus?.toString() || '')}
          onAbrirEmailOriginal={abrirEmailOriginal}
          onHistoricoRespostas={abrirHistorico}
          onEnviarDevolutiva={enviarDevolutiva}
        />
      )}

      <HistoricoRespostasModal
        idSolicitacao={tramitacaoSolicitacaoId}
        open={showTramitacaoModal}
        onClose={handleCloseTramitacaoModal}
        title="Histórico de Tramitações"
        loadingText="Carregando tramitações..."
        emptyText="Nenhuma tramitação encontrada para esta solicitação."
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Solicitação"
        description={`Tem certeza que deseja excluir a solicitação "${solicitacaoToDelete?.dsAssunto}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
