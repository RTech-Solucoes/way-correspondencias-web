'use client';

import React, { useEffect, useCallback, useState } from 'react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SolicitacaoModal from '../../components/solicitacoes/SolicitacaoModal';
import DetalhesSolicitacaoModal from '@/components/solicitacoes/DetalhesSolicitacaoModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PaperPlaneRightIcon,
  PlusIcon,
  TrashIcon,
  ClipboardTextIcon,
  XIcon,
  SpinnerIcon,
  CaretDownIcon,
  CaretRightIcon,
  ArrowsDownUpIcon,
  PencilSimpleIcon,
  ArrowClockwiseIcon
} from '@phosphor-icons/react';
import PageTitle from '@/components/ui/page-title';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { temasClient } from '@/api/temas/client';
import { areasClient } from '@/api/areas/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';
import { useSolicitacoes } from '@/context/solicitacoes/SolicitacoesContext';
import TramitacaoList from '@/components/solicitacoes/TramitacaoList';
import anexosClient from '@/api/anexos/client';
import { AnexoResponse, TipoObjetoAnexo } from '@/api/anexos/type';
import { AreaSolicitacao, SolicitacaoResponse } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';

export default function SolicitacoesPage() {
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
    expandedRows,
    sortField,
    sortDirection,
    hasActiveFilters,
    handleEdit,
    handleDelete,
    handleSolicitacaoSave,
    applyFilters,
    clearFilters,
    getStatusBadgeVariant,
    getStatusText,
    toggleRowExpansion,
    handleSort,
  } = useSolicitacoes();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [detalhesSolicitacao, setDetalhesSolicitacao] = useState<SolicitacaoResponse | null>(null);
  const [detalhesAnexos, setDetalhesAnexos] = useState<AnexoResponse[]>([]);

  const loadSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);

      const filterParts: Array<string> = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.identificacao) filterParts.push(`ident:${activeFilters.identificacao}`);
      if (activeFilters.responsavel && activeFilters.responsavel !== 'all') filterParts.push(`resp:${activeFilters.responsavel}`);
      if (activeFilters.tema && activeFilters.tema !== 'all') filterParts.push(`tema:${activeFilters.tema}`);
      if (activeFilters.area && activeFilters.area !== 'all') filterParts.push(`area:${activeFilters.area}`);
      if (activeFilters.status && activeFilters.status !== 'all') filterParts.push(`status:${activeFilters.status}`);
      if (activeFilters.dateFrom) filterParts.push(`from:${activeFilters.dateFrom}`);
      if (activeFilters.dateTo) filterParts.push(`to:${activeFilters.dateTo}`);

      const filtro = filterParts.join(' ') || undefined;
      const response = await solicitacoesClient.listar(filtro);

      setSolicitacoes(response ?? []);
      setTotalPages(1);
      setTotalElements((response ?? []).length);
    } catch {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    activeFilters,
    debouncedSearchQuery,
    setSolicitacoes,
    setTotalPages,
    setTotalElements,
    setLoading
  ]);

  useEffect(() => {
    loadSolicitacoes();
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, [loadSolicitacoes]);

  const loadResponsaveis = useCallback(async () => {
    try {
      const response = await responsaveisClient.buscarPorFiltro({ size: 100 });
      setResponsaveis(response.content ?? []);
    } catch {}
  }, [setResponsaveis]);

  const loadTemas = useCallback(async () => {
    try {
      const response = await temasClient.buscarPorFiltro({ size: 100 });
      setTemas(response.content ?? []);
    } catch {}
  }, [setTemas]);

  const loadAreas = useCallback(async () => {
    try {
      const response = await areasClient.buscarPorFiltro({ size: 100 });
      setAreas(response.content ?? []);
    } catch {}
  }, [setAreas]);

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

  const sortedSolicitacoes = () => {
    if (!solicitacoes || solicitacoes.length === 0) return [];
    const sorted = [...solicitacoes];

    if (sortField) {
      sorted.sort((a: any, b: any) => {
        const aValue = a?.[sortField];
        const bValue = b?.[sortField];

        if (aValue === bValue) return 0;
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const cmp = aValue.localeCompare(bValue, 'pt-BR', { numeric: true, sensitivity: 'base' });
          return sortDirection === 'asc' ? cmp : -cmp;
        }

        const cmp = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return sorted;
  };

  const openDetalhes = useCallback(async (s: any) => {
    setSelectedSolicitacao(s);
    setShowDetalhesModal(true);
    setDetalhesSolicitacao(null);

    try {
      const detalhes = await solicitacoesClient.buscarPorId(s.idSolicitacao);
      setDetalhesSolicitacao(detalhes || s);
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(s.idSolicitacao, TipoObjetoAnexo.S);
      setDetalhesAnexos(anexos || []);
    } catch {
      toast.error('Erro ao carregar os detalhes da solicitação');
      setDetalhesSolicitacao(s);
    }
  }, [setSelectedSolicitacao]);

  const baixarAnexo = useCallback(async (anexo: any) => {
    try {
      if (!anexo?.idObjeto || !anexo?.idAnexo) {
        toast.error('Dados do documento incompletos');
        return;
      }
      const blob = await solicitacoesClient.downloadAnexo(anexo.idObjeto, anexo.idAnexo);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = anexo.nmArquivo || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar documento');
    }
  }, []);

  const abrirEmailOriginal = useCallback(() => {
    toast.message('Abrir e-mail original (implemente a navegação/URL).');
  }, []);

  const abrirHistorico = useCallback(() => {
    toast.message('Abrir histórico de respostas (implemente a navegação).');
  }, []);

  const enviarDevolutiva = useCallback(async (mensagem: string, arquivos: File[]) => {
    const alvo = detalhesSolicitacao ?? selectedSolicitacao;
    if (!alvo) return;
    try {
      if (mensagem?.trim()) {
        await solicitacoesClient.enviarDevolutiva?.(alvo.idSolicitacao, { mensagem });
      }
      if (arquivos.length > 0) {
        const fd = new FormData();
        arquivos.forEach((f) => fd.append('files', f));
        fd.append('idObjeto', String(alvo.idSolicitacao));
        fd.append('tpObjeto', 'S');
        await solicitacoesClient.uploadAnexos(fd);
      }
      await loadSolicitacoes();
    } catch {
      toast.error('Falha ao enviar a devolutiva.');
      throw new Error('erro-devolutiva');
    }
  }, [detalhesSolicitacao, selectedSolicitacao, loadSolicitacoes]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header da página com título e controles */}
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
            {solicitacoes?.length} solicitação(s)
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={15}
            onPageChange={setCurrentPage}
            loading={loading}
            showOnlyPagginationButtons={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
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
              <XIcon className="h-4 w-4 mr-2"/>
              Limpar Filtros
            </Button>
          )}
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
            Filtrar
          </Button>
          <Button onClick={() => {
            setSelectedSolicitacao(null);
            setShowSolicitacaoModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Área principal da tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-1 overflow-auto">
        <StickyTable>
          <StickyTableHeader>
            <StickyTableRow>
              <StickyTableHead className="w-8"></StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('cdIdentificacao')}>
                <div className="flex items-center">
                  Identificação
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('dsAssunto')}>
                <div className="flex items-center">
                  Assunto
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmResponsavel')}>
                <div className="flex items-center">
                  Responsável
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead>Áreas</StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmTema')}>
                <div className="flex items-center">
                  Tema
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('flStatus')}>
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
              <StickyTableRow>
                <StickyTableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando solicitações...</span>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : solicitacoes?.length === 0 ? (
              <StickyTableRow>
                <StickyTableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <ClipboardTextIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhuma solicitação encontrada</p>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : (
              sortedSolicitacoes()?.map((solicitacao: SolicitacaoResponse) => (
                <React.Fragment key={solicitacao.idSolicitacao}>
                  <StickyTableRow
                    onClick={() => toggleRowExpansion(solicitacao.idSolicitacao)}
                    className="cursor-pointer"
                  >
                    <StickyTableCell className="w-8">
                      {expandedRows.has(solicitacao.idSolicitacao) ? (
                        <CaretDownIcon className="h-4 w-4" />
                      ) : (
                        <CaretRightIcon className="h-4 w-4" />
                      )}
                    </StickyTableCell>
                    <StickyTableCell className="font-medium">{solicitacao.cdIdentificacao}</StickyTableCell>
                    <StickyTableCell className="max-w-xs truncate">{solicitacao.dsAssunto}</StickyTableCell>
                    <StickyTableCell>{solicitacao.nmResponsavel || '-'}</StickyTableCell>
                    <StickyTableCell>
                      {solicitacao.areas && solicitacao.areas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {solicitacao.areas.slice(0, 2).map((area: AreaSolicitacao) => (
                            <span key={area.idArea} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {area.nmArea}
                            </span>
                          ))}
                          {solicitacao.areas.length > 2 && (
                            <span className="text-xs text-gray-500">+{solicitacao.areas.length - 2} mais</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </StickyTableCell>
                    <StickyTableCell>{solicitacao.nmTema || solicitacao?.tema?.nmTema || '-'}</StickyTableCell>
                    <StickyTableCell>
                      <Badge variant={getStatusBadgeVariant(solicitacao.statusCodigo?.toString() || '')}>
                        {getStatusText(solicitacao.statusCodigo?.toString() || '')}
                      </Badge>
                    </StickyTableCell>
                    <StickyTableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await openDetalhes(solicitacao);
                          }}
                          title="Detalhes"
                        >
                          <PaperPlaneRightIcon className="h-4 w-4"/>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(solicitacao);
                          }}
                          title="Editar"
                        >
                          <PencilSimpleIcon className="h-4 w-4"/>
                        </Button>
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
                          <TrashIcon className="h-4 w-4"/>
                        </Button>
                      </div>
                    </StickyTableCell>
                  </StickyTableRow>
                  {expandedRows.has(solicitacao.idSolicitacao) && (
                    <StickyTableRow>
                      <StickyTableCell colSpan={9} className="bg-gray-50 p-6">
                        <div className="relative" style={{ contain: 'layout' }}>
                          <TramitacaoList idSolicitacao={solicitacao.idSolicitacao} areas={areas} />
                        </div>
                      </StickyTableCell>
                    </StickyTableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </StickyTableBody>
        </StickyTable>
      </div>


      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Filtrar Solicitações</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="identificacao">Código de Identificação</Label>
                  <Input
                    id="identificacao"
                    value={filters.identificacao}
                    onChange={(e) => setFilters({...filters, identificacao: e.target.value})}
                    placeholder="Código de identificação"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({...filters, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="P">Pré-análise</SelectItem>
                      <SelectItem value="V">Vencido Regulatório</SelectItem>
                      <SelectItem value="A">Em análise Área Técnica</SelectItem>
                      <SelectItem value="T">Vencido Área Técnica</SelectItem>
                      <SelectItem value="R">Análise Regulatória</SelectItem>
                      <SelectItem value="O">Em Aprovação</SelectItem>
                      <SelectItem value="S">Em Assinatura</SelectItem>
                      <SelectItem value="C">Concluído</SelectItem>
                      <SelectItem value="X">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Select
                    value={filters.responsavel}
                    onValueChange={(value) => setFilters({...filters, responsavel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {responsaveis.map((resp: ResponsavelResponse) => (
                        <SelectItem key={resp.idResponsavel} value={resp.idResponsavel.toString()}>
                          {resp.nmResponsavel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tema">Tema</Label>
                  <Select
                    value={filters.tema}
                    onValueChange={(value) => setFilters({...filters, tema: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {temas.map((tema: TemaResponse) => (
                        <SelectItem key={tema.idTema} value={tema.idTema.toString()}>
                          {tema.nmTema}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Área</Label>
                  <Select
                    value={filters.area}
                    onValueChange={(value) => setFilters({...filters, area: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {areas.map((area: AreaResponse) => (
                        <SelectItem key={area.idArea} value={area.idArea.toString()}>
                          {area.nmArea}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Data Início</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Data Fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <Button onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showSolicitacaoModal && (
        <SolicitacaoModal
          solicitacao={selectedSolicitacao}
          open={showSolicitacaoModal}
          onClose={() => {
            setShowSolicitacaoModal(false);
            setSelectedSolicitacao(null);
          }}
          onSave={onSolicitacaoSave}
          responsaveis={responsaveis}
          temas={temas}
        />
      )}

      {showDetalhesModal && (
        <DetalhesSolicitacaoModal
          open={showDetalhesModal}
          onClose={() => {
            setShowDetalhesModal(false);
            setSelectedSolicitacao(null);
            setDetalhesSolicitacao(null);
          }}
          solicitacao={detalhesSolicitacao ?? selectedSolicitacao}
          anexos={(detalhesAnexos ?? [])}
          statusLabel={getStatusText((detalhesSolicitacao ?? selectedSolicitacao)?.statusCodigo?.toString() || '')}
          onAbrirEmailOriginal={abrirEmailOriginal}
          onHistoricoRespostas={abrirHistorico}
          onEnviarDevolutiva={enviarDevolutiva}
        />
      )}

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
