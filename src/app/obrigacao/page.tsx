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
} from "@phosphor-icons/react";
import { ObrigacoesProvider, useObrigacoes } from "@/context/obrigacoes/ObrigacoesContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ObrigacaoModal } from "@/components/obrigacoes/ObrigacaoModal";
import { FilterModalObrigacao } from "@/components/obrigacoes/FilterModalObrigacao";
import { DeleteObrigacaoDialog } from "@/components/obrigacoes/DeleteObrigacaoDialog";
import { ObrigacaoResponse } from "@/api/obrigacao/types";
import { FiltrosAplicados } from "@/components/ui/applied-filters";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { statusObrigacaoList, statusObrigacaoLabels, StatusObrigacao } from "@/api/status-obrigacao/types";
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
import TimeProgress from "@/components/ui/time-progress";

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
  } = useObrigacoes();

  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [classificacoes, setClassificacoes] = useState<TipoResponse[]>([]);
  const [periodicidades, setPeriodicidades] = useState<TipoResponse[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const router = useRouter();

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

  const getStatusBadgeVariant = (statusId: string | number | undefined, statusName: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (!statusId && !statusName) return 'default';
    
    const naoIniciadoStatus = statusObrigacaoList.find(s => s.nmStatus === StatusObrigacao.NAO_INICIADO);
    const concluidoStatus = statusObrigacaoList.find(s => s.nmStatus === StatusObrigacao.CONCLUIDO);

    if (statusId && naoIniciadoStatus && parseInt(statusId.toString()) === naoIniciadoStatus.id) {
      return 'secondary';
    }
    if (statusName && statusName.toUpperCase().includes(StatusObrigacao.NAO_INICIADO)) {
      return 'secondary';
    }

    if (statusId && concluidoStatus && parseInt(statusId.toString()) === concluidoStatus.id) {
      return 'outline';
    }
    if (statusName && statusName.toUpperCase().includes(StatusObrigacao.CONCLUIDO)) {
      return 'outline';
    }

    return 'default';
  };

  const getStatusBadgeBg = (statusId: string | number | undefined, statusName: string | undefined): string => {
    if (!statusId && !statusName) return '#1447e6';
    
    const naoIniciadoStatus = statusObrigacaoList.find(s => s.nmStatus === StatusObrigacao.NAO_INICIADO);
    const concluidoStatus = statusObrigacaoList.find(s => s.nmStatus === StatusObrigacao.CONCLUIDO);

    if (statusId && naoIniciadoStatus && parseInt(statusId.toString()) === naoIniciadoStatus.id) {
      return '#b68500'; 
    }
    if (statusName && statusName.toUpperCase().includes(StatusObrigacao.NAO_INICIADO)) {
      return '#b68500';
    }

    if (statusId && concluidoStatus && parseInt(statusId.toString()) === concluidoStatus.id) {
      return '#008000'; 
    }
    if (statusName && statusName.toUpperCase().includes(StatusObrigacao.CONCLUIDO)) {
      return '#008000';
    }

    return '#1447e6'; 
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
      
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Obrigações Contratuais</h1>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
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

          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={() => setShowImportModal(true)}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Importar Obrigações
          </Button>

          <Button
            className="h-10 px-4"
            onClick={() => setShowObrigacaoModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Obrigação
          </Button>
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
              <TableHead>ID</TableHead>
              <TableHead className="min-w-[250px]">Tarefa</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atribuído a</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Data de Término</TableHead>
              <TableHead>Data Limite</TableHead>
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
                  <TableCell className="font-medium">{obrigacao.cdIdentificacao || '-'}</TableCell>
                  <TableCell className="min-w-[250px]">
                    <div className="line-clamp-4" title={obrigacao.dsTarefa || undefined}>
                      {obrigacao.dsTarefa || '-'}
                    </div>
                  </TableCell>
                  <TableCell>{obrigacao.tema?.nmTema || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      className="whitespace-nowrap truncate text-white"
                      variant={getStatusBadgeVariant(
                        obrigacao.statusSolicitacao?.idStatusSolicitacao?.toString(),
                        obrigacao.statusSolicitacao?.nmStatus
                      )}
                      style={{
                        backgroundColor: getStatusBadgeBg(
                          obrigacao.statusSolicitacao?.idStatusSolicitacao?.toString(),
                          obrigacao.statusSolicitacao?.nmStatus
                        )
                      }}
                    >
                      {obrigacao.statusSolicitacao?.nmStatus || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {obrigacao.areas && obrigacao.areas.length > 0 
                      ? (obrigacao.areas.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA)?.nmArea)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <TimeProgress
                        start={obrigacao.dtInicio 
                          ? (obrigacao.dtInicio.includes('T') 
                            ? obrigacao.dtInicio 
                            : `${obrigacao.dtInicio}T00:00:00`)
                          : null}
                        end={obrigacao.dtLimite 
                          ? (obrigacao.dtLimite.includes('T') 
                            ? obrigacao.dtLimite 
                            : `${obrigacao.dtLimite}T23:59:59`)
                          : null}
                        finishedAt={obrigacao.dtConclusao}
                        now={new Date().toISOString()}
                        statusLabel={obrigacao.statusSolicitacao?.nmStatus}
                      />
                  </TableCell>
                  <TableCell>
                    {obrigacao.dtTermino 
                      ? formatDateBr(obrigacao.dtTermino)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {obrigacao.dtLimite 
                      ?  formatDateBr(obrigacao.dtLimite)
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-center sticky right-0 bg-white z-10 shadow-sm">
                    <div className="flex items-center justify-center">
                      <ObrigacaoAcoesMenu
                        obrigacao={obrigacao}
                        onVisualizar={(obrigacao) => {
                          console.log('Visualizar obrigação:', obrigacao.idSolicitacao);
                        }}
                        onEditar={(obrigacao) => {
                          if (!obrigacao.idSolicitacao) {
                            return;
                          }
                          router.push(`/obrigacao/${obrigacao.idSolicitacao}/editar`);
                        }}
                        onAnexarProtocolo={(obrigacao) => {
                          console.log('Anexar protocolo:', obrigacao.idSolicitacao);
                        }}
                        onEncaminharTramitacao={(obrigacao) => {
                          console.log('Encaminhar para tramitação:', obrigacao.idSolicitacao);
                        }}
                        onEnviarArea={(obrigacao) => {
                          console.log('Enviar para área:', obrigacao.idSolicitacao);
                        }}
                        onExcluir={handleDeleteObrigacao}
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
