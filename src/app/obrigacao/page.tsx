'use client';

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { 
  ArrowClockwiseIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelSimpleIcon,
  XIcon,
  UploadIcon,
  ArrowsDownUpIcon,
} from "@phosphor-icons/react";
import { ObrigacoesProvider, useObrigacoes } from "@/context/obrigacoes/ObrigacoesContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ObrigacaoModal } from "@/components/obrigacoes/ObrigacaoModal";
import { FilterModalObrigacao } from "@/components/obrigacoes/FilterModalObrigacao";
import { DeleteObrigacaoDialog } from "@/components/obrigacoes/DeleteObrigacaoDialog";
import { ObrigacaoResponse } from "@/api/obrigacao/types";
import { FiltrosAplicados } from "@/components/ui/applied-filters";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { statusObrigacaoList, statusObrigacaoLabels, StatusObrigacao, statusListObrigacao } from "@/api/status-obrigacao/types";
import { getObrigacaoStatusStyle } from "@/utils/obrigacoes/status";
import areasClient from "@/api/areas/client";
import temasClient from "@/api/temas/client";
import tiposClient from "@/api/tipos/client";
import { CategoriaEnum, TipoEnum } from "@/api/tipos/types";
import { formatDateBr } from "@/utils/utils";
import { AreaResponse } from "@/api/areas/types";
import { TemaResponse } from "@/api/temas/types";
import { TipoResponse } from "@/api/tipos/types";
import { ObrigacaoAcoesMenu } from "@/components/obrigacoes/ObrigacaoAcoesMenu";
import { ImportObrigacoesModal } from "@/components/obrigacoes/ImportObrigacoesModal";
import { AnexarProtocoloModal } from "@/components/obrigacoes/AnexarProtocoloModal";
import { ObrigacoesCondicionadasModal } from "@/components/obrigacoes/ObrigacoesCondicionadasModal";
import { NaoAplicavelSuspensoModal } from "@/components/obrigacoes/conferencia/NaoAplicavelSuspensoModal";
import TimeProgress from "@/components/ui/time-progress";
import obrigacaoClient from "@/api/obrigacao/client";
import { toast } from "sonner";
import { useUserGestao } from "@/hooks/use-user-gestao";
import { perfilUtil } from "@/api/perfis/types";
import { ObrigacaoResumoResponse, ObrigacaoFiltroRequest } from "@/api/obrigacao/types";
import { usePermissoes } from "@/context/permissoes/PermissoesContext";
import ExportObrigacaoMenu from "@/components/obrigacoes/relatorios/ExportObrigacaoMenu";

function ObrigacoesContent() {
  const {
    obrigacoes,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    setShowObrigacaoModal,
    setShowFilterModal,
    setShowDeleteDialog,
    setObrigacaoToDelete,
    filters,
    setFilters,
    sortField,
    sortDirection,
    handleSort,
    loadObrigacoes,
  } = useObrigacoes();

  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [classificacoes, setClassificacoes] = useState<TipoResponse[]>([]);
  const [periodicidades, setPeriodicidades] = useState<TipoResponse[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAnexarProtocoloModal, setShowAnexarProtocoloModal] = useState(false);
  const [showObrigacoesCondicionadasModal, setShowObrigacoesCondicionadasModal] = useState(false);
  const [obrigacaoParaProtocolo, setObrigacaoParaProtocolo] = useState<ObrigacaoResponse | null>(null);
  const [obrigacoesCondicionadas, setObrigacoesCondicionadas] = useState<ObrigacaoResumoResponse[]>([]);
  const [showNaoAplicavelSuspensoModal, setShowNaoAplicavelSuspensoModal] = useState(false);
  const [obrigacaoParaNaoAplicavelSuspenso, setObrigacaoParaNaoAplicavelSuspenso] = useState<ObrigacaoResponse | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { idPerfil } = useUserGestao();
  const { canInserirObrigacao, canDeletarObrigacao, canConcluirObrigacao, canEnviarAreasObrigacao, canNaoAplicavelSuspensaObrigacao } = usePermissoes();

  const idObrigacaoFromUrl = useMemo(() => {
    const param = searchParams.get('idObrigacao');
    return param ? Number(param) : undefined;
  }, [searchParams]);

  const isInitialMount = useRef(true);
  const prevIdObrigacao = useRef(idObrigacaoFromUrl);

  useEffect(() => {
    if (prevIdObrigacao.current !== idObrigacaoFromUrl) {
      prevIdObrigacao.current = idObrigacaoFromUrl;
      if (!isInitialMount.current) {
        setCurrentPage(0);
        return;
      }
    }

    loadObrigacoes(idObrigacaoFromUrl);
    isInitialMount.current = false;
  }, [idObrigacaoFromUrl, filters, currentPage, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps 

  const isAdminOrGestor = useMemo(() => {
    return idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA ||
      idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
      idPerfil === perfilUtil.TECNICO_SUPORTE;
  }, [idPerfil]);

  function getProgressEndDate(obrigacao: ObrigacaoResponse) {
    if (isAdminOrGestor) {
      return obrigacao.dtLimite || null;
    }
    return obrigacao.dtTermino || null;
  }

  const getStatusText = (statusCode: string): string | null => {
    if (!statusCode) return null;
    const status = statusObrigacaoList.find(s => s.id.toString() === statusCode);
    if (status) {
      return statusObrigacaoLabels[status.nmStatus as StatusObrigacao] || status.nmStatus;
    }
    return null;
  };

  const filterParamsForExport = useMemo((): Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'> => {
    return {
      filtro: searchQuery || null,
      idStatusSolicitacao: filters.idStatusObrigacao ? parseInt(filters.idStatusObrigacao) : null,
      idAreaAtribuida: filters.idAreaAtribuida ? parseInt(filters.idAreaAtribuida) : null,
      dtLimiteInicio: filters.dtLimiteInicio || null,
      dtLimiteFim: filters.dtLimiteFim || null,
      dtInicioInicio: filters.dtInicioInicio || null,
      dtInicioFim: filters.dtInicioFim || null,
      idTema: filters.idTema ? parseInt(filters.idTema) : null,
      idTipoClassificacao: filters.idTipoClassificacao ? parseInt(filters.idTipoClassificacao) : null,
      idTipoPeriodicidade: filters.idTipoPeriodicidade ? parseInt(filters.idTipoPeriodicidade) : null,
    };
  }, [searchQuery, filters]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [areasResponse, temasResponse, tiposResponse] = await Promise.all([
          areasClient.buscarPorFiltro({ size: 1000 }),
          temasClient.buscarPorFiltro({ size: 1000 }),
          tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO, CategoriaEnum.OBRIG_PERIODICIDADE])
        ]);

        setAreas(areasResponse.content || []);
        setTemas(temasResponse.content || []);
        
        const classif = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_CLASSIFICACAO);
        const periodic = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_PERIODICIDADE);
        
        setClassificacoes(classif);
        setPeriodicidades(periodic);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      filters.idStatusObrigacao ||
      filters.idAreaAtribuida ||
      filters.dtLimiteInicio ||
      filters.dtLimiteFim ||
      filters.dtInicioInicio ||
      filters.dtInicioFim ||
      filters.idTema ||
      filters.idTipoClassificacao ||
      filters.idTipoPeriodicidade
    );
  }, [searchQuery, filters]);

  const filtrosAplicados = useMemo(() => {
    return [
      ...(searchQuery ? [{
        key: 'search',
        label: 'Busca',
        value: searchQuery,
        color: 'blue' as const,
        onRemove: () => setSearchQuery('')
      }] : []),
      ...(filters.idStatusObrigacao ? [{
        key: 'status',
        label: 'Status',
        value: statusObrigacaoList.find(s => s.id.toString() === filters.idStatusObrigacao) 
          ? statusObrigacaoLabels[statusObrigacaoList.find(s => s.id.toString() === filters.idStatusObrigacao)!.nmStatus as StatusObrigacao]
          : filters.idStatusObrigacao,
        color: 'purple' as const,
        onRemove: () => {
          setFilters({ ...filters, idStatusObrigacao: '' });
        }
      }] : []),
      ...(filters.idAreaAtribuida ? [{
        key: 'area',
        label: 'Área Atribuída',
        value: areas.find(a => a.idArea.toString() === filters.idAreaAtribuida)?.nmArea || filters.idAreaAtribuida,
        color: 'green' as const,
        onRemove: () => {
          setFilters({ ...filters, idAreaAtribuida: '' });
        }
      }] : []),
      ...(filters.dtLimiteInicio ? [{
        key: 'dtLimiteInicio',
        label: 'Data Limite Início',
        value: formatDateBr(filters.dtLimiteInicio),
        color: 'indigo' as const,
        onRemove: () => {
          setFilters({ ...filters, dtLimiteInicio: '' });
        }
      }] : []),
      ...(filters.dtLimiteFim ? [{
        key: 'dtLimiteFim',
        label: 'Data Limite Fim',
        value: formatDateBr(filters.dtLimiteFim),
        color: 'indigo' as const,
        onRemove: () => {
          setFilters({ ...filters, dtLimiteFim: '' });
        }
      }] : []),
      ...(filters.dtInicioInicio ? [{
        key: 'dtInicioInicio',
        label: 'Data de Início (Início)',
        value: formatDateBr(filters.dtInicioInicio),
        color: 'pink' as const,
        onRemove: () => {
          setFilters({ ...filters, dtInicioInicio: '' });
        }
      }] : []),
      ...(filters.dtInicioFim ? [{
        key: 'dtInicioFim',
        label: 'Data de Início (Fim)',
        value: formatDateBr(filters.dtInicioFim),
        color: 'pink' as const,
        onRemove: () => {
          setFilters({ ...filters, dtInicioFim: '' });
        }
      }] : []),
      ...(filters.idTema ? [{
        key: 'tema',
        label: 'Tema',
        value: temas.find(t => t.idTema.toString() === filters.idTema)?.nmTema || filters.idTema,
        color: 'indigo' as const,
        onRemove: () => {
          setFilters({ ...filters, idTema: '' });
        }
      }] : []),
      ...(filters.idTipoClassificacao ? [{
        key: 'classificacao',
        label: 'Classificação',
        value: classificacoes.find(c => c.idTipo.toString() === filters.idTipoClassificacao)?.dsTipo || filters.idTipoClassificacao,
        color: 'orange' as const,
        onRemove: () => {
          setFilters({ ...filters, idTipoClassificacao: '' });
        }
      }] : []),
      ...(filters.idTipoPeriodicidade ? [{
        key: 'periodicidade',
        label: 'Periodicidade',
        value: periodicidades.find(p => p.idTipo.toString() === filters.idTipoPeriodicidade)?.dsTipo || filters.idTipoPeriodicidade,
        color: 'yellow' as const,
        onRemove: () => {
          setFilters({ ...filters, idTipoPeriodicidade: '' });
        }
      }] : [])
    ];
  }, [searchQuery, filters, areas, temas, classificacoes, periodicidades, setSearchQuery, setFilters]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      ...filters,
      idStatusObrigacao: '',
      idAreaAtribuida: '',
      dtLimiteInicio: '',
      dtLimiteFim: '',
      dtInicioInicio: '',
      dtInicioFim: '',
      idTema: '',
      idTipoClassificacao: '',
      idTipoPeriodicidade: '',
    });
  }; 

  const handleDeleteObrigacao = (obrigacao: ObrigacaoResponse) => {
    setObrigacaoToDelete(obrigacao);
    setShowDeleteDialog(true);
  };

  const handleNaoAplicavelSuspenso = (obrigacao: ObrigacaoResponse) => {
    setObrigacaoParaNaoAplicavelSuspenso(obrigacao);
    setShowNaoAplicavelSuspensoModal(true);
  };

  const handleConfirmNaoAplicavelSuspenso = async (justificativa: string) => {
    if (!obrigacaoParaNaoAplicavelSuspenso?.idSolicitacao) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    try {
      const response = await obrigacaoClient.atualizarStatusNaoAplicavelSusp(
        obrigacaoParaNaoAplicavelSuspenso.idSolicitacao,
        justificativa
      );
      toast.success(response.mensagem);
      await loadObrigacoes();
      setShowNaoAplicavelSuspensoModal(false);
      setObrigacaoParaNaoAplicavelSuspenso(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
      throw error;
    }
  };

  return (
    <>
      <ObrigacaoModal />
      <FilterModalObrigacao />
      <DeleteObrigacaoDialog />
      <ImportObrigacoesModal 
        open={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
      {obrigacaoParaProtocolo && (
        <AnexarProtocoloModal
          open={showAnexarProtocoloModal}
          onClose={() => {
            setShowAnexarProtocoloModal(false);
            setObrigacaoParaProtocolo(null);
          }}
          idObrigacao={obrigacaoParaProtocolo.idSolicitacao}
          idPerfil={idPerfil ?? undefined}
          onSuccess={async () => {
            await loadObrigacoes();
          }}
        />
      )}
      
      <ObrigacoesCondicionadasModal
        open={showObrigacoesCondicionadasModal}
        onClose={() => {
          setShowObrigacoesCondicionadasModal(false);
          setObrigacoesCondicionadas([]);
        }}
        obrigacoesCondicionadas={obrigacoesCondicionadas}
      />

      {obrigacaoParaNaoAplicavelSuspenso && (
        <NaoAplicavelSuspensoModal
          open={showNaoAplicavelSuspensoModal}
          onClose={() => {
            setShowNaoAplicavelSuspensoModal(false);
            setObrigacaoParaNaoAplicavelSuspenso(null);
          }}
          onConfirm={handleConfirmNaoAplicavelSuspenso}
          justificativaExistente={obrigacaoParaNaoAplicavelSuspenso.dsRespNaoAplicavelSusp || null}
        />
      )}
      
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Obrigações Contratuais</h1>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadObrigacoes()}
            disabled={loading}
            title="Atualizar lista"
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {totalElements} {totalElements !== 1 ? "obrigações" : "obrigação"}
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
              placeholder="Pesquisar obrigações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={handleClearAllFilters}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}

          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>

          <ExportObrigacaoMenu
            filterParams={filterParamsForExport}
            getStatusText={getStatusText}
            isAdminOrGestor={isAdminOrGestor}
          />
            
          {canInserirObrigacao && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={() => setShowImportModal(true)}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Importar Obrigações
            </Button>
          )}

          {canInserirObrigacao && (
            <Button
              className="h-10 px-4"
              onClick={() => setShowObrigacaoModal(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Obrigação
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <FiltrosAplicados
          filters={filtrosAplicados}
          onClearAll={handleClearAllFilters}
          className="mb-6"
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="min-w-[200px] cursor-pointer"
                onClick={() => handleSort('cdIdentificacao')}
              >
                <div className="flex items-center">
                  Identificação
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="min-w-[250px]">Tarefa</TableHead>
              <TableHead className="min-w-[150px]">Tema</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('statusSolicitacao.nmStatus')}
              >
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="min-w-[150px] cursor-pointer"
                onClick={() => handleSort('areas')}
              >
                <div className="flex items-center">
                  Atribuído a
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('dtTermino')}
              >
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Data de Término</span>
                  <ArrowsDownUpIcon className="ml-1 h-4 w-4 flex-shrink-0" />
                </div>
              </TableHead>
              {isAdminOrGestor && (
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort('dtLimite')}
                >
                  <div className="flex items-center">
                    <span className="whitespace-nowrap">Data Limite</span>
                    <ArrowsDownUpIcon className="ml-1 h-4 w-4 flex-shrink-0" />
                  </div>
                </TableHead>
              )}
              {isAdminOrGestor && (
                <TableHead className="min-w-[150px] text-center">Enviado para Áreas</TableHead>
              )}
              <TableHead className="w-[100px] text-center sticky right-0 bg-white z-10 shadow-sm">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : obrigacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Nenhuma obrigação encontrada
                </TableCell>
              </TableRow>
            ) : (
              obrigacoes.map((obrigacao) => (
                <TableRow key={obrigacao.idSolicitacao}>
                  <TableCell className="font-medium min-w-[200px]">{obrigacao.cdIdentificacao || '-'}</TableCell>
                  <TableCell className="min-w-[250px]">
                    <div className="line-clamp-4" title={obrigacao.dsTarefa || undefined}>
                      {obrigacao.dsTarefa || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">{obrigacao.tema?.nmTema || '-'}</TableCell>
                  <TableCell className="min-w-[150px]">
                    {(() => {
                      const statusStyle = getObrigacaoStatusStyle(
                        obrigacao.statusSolicitacao?.idStatusSolicitacao?.toString(),
                        obrigacao.statusSolicitacao?.nmStatus
                      );
                      return (
                        <Badge
                          className="whitespace-nowrap truncate"
                          variant={statusStyle.variant}
                          style={{
                            backgroundColor: statusStyle.backgroundColor,
                            color: statusStyle.textColor,
                          }}
                        >
                          {obrigacao.statusSolicitacao?.nmStatus || '-'}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {obrigacao.areas && obrigacao.areas.length > 0 
                      ? (obrigacao.areas.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA)?.nmArea)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const startDate = obrigacao.dtInicio;
                      const endDate = getProgressEndDate(obrigacao);
                      const hasRequiredDates = startDate && endDate;

                      if (!hasRequiredDates) {
                        return (
                          <span className="text-gray-400 text-sm">
                            Preencha corretamente as datas de início e fim para exibir o progresso
                          </span>
                        );
                      }

                      return (
                        <TimeProgress
                          start={
                            startDate
                              ? startDate.includes('T')
                                ? startDate
                                : `${startDate}T00:00:00`
                              : null
                          }
                          end={
                            endDate
                              ? endDate.includes('T')
                                ? endDate
                                : `${endDate}T23:59:59`
                              : null
                          }
                          finishedAt={obrigacao.dtConclusaoTramitacao}
                          now={new Date().toISOString()}
                          statusLabel={obrigacao.statusSolicitacao?.nmStatus}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {obrigacao.dtTermino 
                      ? formatDateBr(obrigacao.dtTermino)
                      : '-'
                    }
                  </TableCell>
                  {isAdminOrGestor && (
                    <TableCell>
                      {obrigacao.dtLimite 
                        ? formatDateBr(obrigacao.dtLimite)
                        : '-'
                      }
                    </TableCell>
                  )}
                  {isAdminOrGestor && (
                    <TableCell className="text-center">
                      {obrigacao.flEnviandoArea === 'S' ? 'Sim' : 'Não'}
                    </TableCell>
                  )}
                  <TableCell className="text-center sticky right-0 bg-white z-10 shadow-sm">
                    <div className="flex items-center justify-center">
                      <ObrigacaoAcoesMenu
                        obrigacao={obrigacao}
                        onVisualizar={(obrigacao) => {
                          if (!obrigacao.idSolicitacao) {
                            return;
                          }
                          router.push(`/obrigacao/${obrigacao.idSolicitacao}/conferencia`);
                        }}
                        onEditar={canInserirObrigacao ? (obrigacao) => {
                          if (!obrigacao.idSolicitacao) {
                            return;
                          }
                          router.push(`/obrigacao/${obrigacao.idSolicitacao}/editar`);
                        } : undefined}
                        onAnexarProtocolo={ canConcluirObrigacao ? async (obrigacao) => {
                          if (!obrigacao.idSolicitacao) {
                            toast.error('ID da obrigação não encontrado.');
                            return;
                          }

                          try {
                            const response = await obrigacaoClient.buscarObrigacoesCondicionadas(obrigacao.idSolicitacao);
                            const condicionadas = response.obrigacoesCondicionadas || [];

                            const condicionadasPendentes = condicionadas.filter(
                              (cond) =>
                                cond.statusSolicitacao?.idStatusSolicitacao !== statusListObrigacao.CONCLUIDO.id &&
                                cond.statusSolicitacao?.nmStatus !== StatusObrigacao.CONCLUIDO
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
                        } : undefined}
                        // onEncaminharTramitacao={(obrigacao) => {
                        //   console.log('Encaminhar para tramitação:', obrigacao.idSolicitacao);
                        // }}
                        onEnviarArea={canEnviarAreasObrigacao ? async (obrigacao) => {
                          if (!obrigacao.idSolicitacao) {
                            toast.error('ID da obrigação não encontrado.');
                            return;
                          }
                          
                          try {
                            const response = await obrigacaoClient.atualizarFlEnviandoArea(obrigacao.idSolicitacao);
                            toast.success(response.mensagem);
                            await loadObrigacoes();
                          } catch (error) {
                            console.error('Erro ao enviar obrigação para área:', error);
                            toast.error('Erro ao enviar obrigação para área. Tente novamente.');
                          }
                        } : undefined}
                        onNaoAplicavelSuspenso={canNaoAplicavelSuspensaObrigacao ? handleNaoAplicavelSuspenso : undefined}
                        onExcluir={canDeletarObrigacao ? handleDeleteObrigacao : undefined}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
    </>
  );
}

export default function ObrigacoesPage() {
  return (
    <ObrigacoesProvider>
      <ObrigacoesContent />
    </ObrigacoesProvider>
  );
}
