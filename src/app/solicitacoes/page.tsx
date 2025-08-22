'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowsDownUpIcon
} from '@phosphor-icons/react';
import PageTitle from '@/components/ui/page-title';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { SolicitacaoResponse, SolicitacaoFilterParams } from '@/api/solicitacoes/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { temasClient } from '@/api/temas/client';
import { TemaResponse } from '@/api/temas/types';
import { areasClient } from '@/api/areas/client';
import { AreaResponse } from '@/api/areas/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/utils/utils';

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoResponse | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [solicitacaoToDelete, setSolicitacaoToDelete] = useState<SolicitacaoResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<keyof SolicitacaoResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState({
    identificacao: '',
    responsavel: '',
    tema: '',
    area: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadSolicitacoes();
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);

      if (activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const result = await solicitacoesClient.buscarPorCdIdentificacao(activeFilters.identificacao);
        setSolicitacoes([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else if (activeFilters.responsavel && !activeFilters.identificacao && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavel(parseInt(activeFilters.responsavel));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.tema && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorTema(parseInt(activeFilters.tema));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.area && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorArea(parseInt(activeFilters.area));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.status && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorStatus(activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.responsavel && activeFilters.status && !activeFilters.identificacao && !activeFilters.tema && !activeFilters.area && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavelEStatus(parseInt(activeFilters.responsavel), activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else if (activeFilters.dateFrom && activeFilters.dateTo && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.area && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorPeriodo(
          activeFilters.dateFrom + 'T00:00:00',
          activeFilters.dateTo + 'T23:59:59'
        );
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results?.length);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.identificacao) filterParts.push(activeFilters.identificacao);

        const params: SolicitacaoFilterParams = {
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 10,
        };
        const response = await solicitacoesClient.buscarPorFiltro(params);
        setSolicitacoes(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (error) {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const response = await responsaveisClient.buscarPorFiltro({ size: 100 });
      setResponsaveis(response.content);
    } catch (error) {
    }
  };

  const loadTemas = async () => {
    try {
      const response = await temasClient.buscarPorFiltro({ size: 100 });
      setTemas(response.content);
    } catch (error) {
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areasClient.buscarPorFiltro({ size: 100 });
      setAreas(response.content);
    } catch (error) {
    }
  };

  const handleEdit = (solicitacao: SolicitacaoResponse) => {
    setSelectedSolicitacao(solicitacao);
    setShowSolicitacaoModal(true);
  };

  const handleDelete = (solicitacao: SolicitacaoResponse) => {
    setSolicitacaoToDelete(solicitacao);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (solicitacaoToDelete) {
      try {
        await solicitacoesClient.deletar(solicitacaoToDelete.idSolicitacao);
        toast.success("Solicitação excluída com sucesso");
        loadSolicitacoes();
      } catch (error) {
        toast.error("Erro ao excluir solicitação");
      } finally {
        setShowDeleteDialog(false);
        setSolicitacaoToDelete(null);
      }
    }
  };

  const handleSolicitacaoSave = () => {
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
    loadSolicitacoes();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      identificacao: '',
      responsavel: '',
      tema: '',
      area: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'P':
        return 'secondary';
      case 'V':
      case 'T':
        return 'destructive';
      case 'A':
      case 'R':
      case 'O':
      case 'S':
        return 'default';
      case 'C':
        return 'default';
      case 'X':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'P':
        return 'Pré-análise';
      case 'V':
        return 'Vencido Regulatório';
      case 'A':
        return 'Em análise Área Técnica';
      case 'T':
        return 'Vencido Área Técnica';
      case 'R':
        return 'Análise Regulatória';
      case 'O':
        return 'Em Aprovação';
      case 'S':
        return 'Em Assinatura';
      case 'C':
        return 'Concluído';
      case 'X':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const toggleRowExpansion = (solicitacaoId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(solicitacaoId)) {
      newExpandedRows.delete(solicitacaoId);
    } else {
      newExpandedRows.add(solicitacaoId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (field: keyof SolicitacaoResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  };

  const sortedSolicitacoes = () => {
    const sorted = [...solicitacoes];
    if (sortField) {
      sorted.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedSolicitacao(null);
            setShowSolicitacaoModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Nova Solicitação
          </Button>
        </div>

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
        </div>
      </div>

      <div className="flex flex-1 overflow-auto bg-white">
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
              sortedSolicitacoes().map((solicitacao) => (
                <React.Fragment key={solicitacao.idSolicitacao}>
                  <StickyTableRow>
                    <StickyTableCell className="w-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(solicitacao.idSolicitacao)}
                        className="p-1 h-6 w-6"
                      >
                        {expandedRows.has(solicitacao.idSolicitacao) ? (
                          <CaretDownIcon className="h-4 w-4" />
                        ) : (
                          <CaretRightIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </StickyTableCell>
                    <StickyTableCell className="font-medium">{solicitacao.cdIdentificacao}</StickyTableCell>
                    <StickyTableCell className="max-w-xs truncate">{solicitacao.dsAssunto}</StickyTableCell>
                    <StickyTableCell>{solicitacao.nmResponsavel}</StickyTableCell>
                    <StickyTableCell>
                      {solicitacao.areas && solicitacao.areas?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {solicitacao.areas.slice(0, 2).map((area, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {area.nmArea}
                            </span>
                          ))}
                          {solicitacao.areas?.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{solicitacao.areas?.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Nenhuma área</span>
                      )}
                    </StickyTableCell>
                    <StickyTableCell>{solicitacao.tema?.nmTema || solicitacao.nmTema || 'N/A'}</StickyTableCell>
                    <StickyTableCell>
                      <Badge variant={getStatusBadgeVariant(solicitacao.flStatus)}>
                        {getStatusText(solicitacao.flStatus)}
                      </Badge>
                    </StickyTableCell>
                    <StickyTableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(solicitacao)}
                        >
                          <PaperPlaneRightIcon className="h-4 w-4"/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(solicitacao)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4"/>
                        </Button>
                      </div>
                    </StickyTableCell>
                  </StickyTableRow>
                  {expandedRows.has(solicitacao.idSolicitacao) && (
                    <StickyTableRow>
                      <StickyTableCell colSpan={9} className="bg-gray-50 p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Informações Detalhadas</h4>
                              <div className="space-y-2 text-sm">
                                {solicitacao.dsSolicitacao && (
                                  <div>
                                    <span className="font-medium text-gray-700">Descrição:</span>
                                    <p className="text-gray-600 mt-1">{solicitacao.dsSolicitacao}</p>
                                  </div>
                                )}
                                {solicitacao.dsObservacao && (
                                  <div>
                                    <span className="font-medium text-gray-700">Observações:</span>
                                    <p className="text-gray-600 mt-1">{solicitacao.dsObservacao}</p>
                                  </div>
                                )}
                                {solicitacao.nrOficio && (
                                  <div>
                                    <span className="font-medium text-gray-700">Nº Ofício:</span>
                                    <span className="text-gray-600 ml-2">{solicitacao.nrOficio}</span>
                                  </div>
                                )}
                                {solicitacao.nrProcesso && (
                                  <div>
                                    <span className="font-medium text-gray-700">Nº Processo:</span>
                                    <span className="text-gray-600 ml-2">{solicitacao.nrProcesso}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-gray-700">Data de Criação:</span>
                                  <span className="text-gray-600 ml-2">{formatDate(solicitacao.dtCriacao)}</span>
                                </div>
                                {solicitacao.dtAtualizacao && (
                                  <div>
                                    <span className="font-medium text-gray-700">Última Atualização:</span>
                                    <span className="text-gray-600 ml-2">{formatDate(solicitacao.dtAtualizacao)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Áreas e Responsáveis</h4>
                              <div className="space-y-2">
                                {solicitacao.areas?.map((area) => (
                                  <div key={area.idArea} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-gray-700">{area.nmArea}</span>
                                    <span className="text-xs text-gray-500">Responsável será implementado</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={15}
        onPageChange={setCurrentPage}
        loading={loading}
      />

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
                      {responsaveis.map((resp) => (
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
                      {temas.map((tema) => (
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
                      {areas.map((area) => (
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
          onSave={handleSolicitacaoSave}
          responsaveis={responsaveis}
          temas={temas}
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
