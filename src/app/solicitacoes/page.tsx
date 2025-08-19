'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SolicitacaoModal from '../../components/solicitacoes/SolicitacaoModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  ClipboardTextIcon,
  XIcon
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

  const [filters, setFilters] = useState({
    identificacao: '',
    responsavel: '',
    tema: '',
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

      if (activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.status && !debouncedSearchQuery) {
        const result = await solicitacoesClient.buscarPorCdIdentificacao(activeFilters.identificacao);
        setSolicitacoes([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else if (activeFilters.responsavel && !activeFilters.identificacao && !activeFilters.tema && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavel(parseInt(activeFilters.responsavel));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results.length);
      } else if (activeFilters.tema && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorTema(parseInt(activeFilters.tema));
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results.length);
      } else if (activeFilters.status && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorStatus(activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results.length);
      } else if (activeFilters.responsavel && activeFilters.status && !activeFilters.identificacao && !activeFilters.tema && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorResponsavelEStatus(parseInt(activeFilters.responsavel), activeFilters.status);
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results.length);
      } else if (activeFilters.dateFrom && activeFilters.dateTo && !activeFilters.identificacao && !activeFilters.responsavel && !activeFilters.tema && !activeFilters.status && !debouncedSearchQuery) {
        const results = await solicitacoesClient.buscarPorPeriodo(
          activeFilters.dateFrom + 'T00:00:00',
          activeFilters.dateTo + 'T23:59:59'
        );
        setSolicitacoes(results);
        setTotalPages(1);
        setTotalElements(results.length);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.identificacao) filterParts.push(activeFilters.identificacao);

        const params: SolicitacaoFilterParams = {
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 50,
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
        await solicitacoesClient.deletar(solicitacaoToDelete.id);
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

  const handleSolicitacaoSaved = () => {
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
      case 'PENDENTE':
        return 'secondary';
      case 'EM_ANDAMENTO':
        return 'default';
      case 'CONCLUIDA':
        return 'default';
      case 'CANCELADA':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDA':
        return 'Concluída';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
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
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
            Filtrar
          </Button>
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
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificação</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando solicitações...
                </TableCell>
              </TableRow>
            ) : solicitacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <ClipboardTextIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhuma solicitação encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              solicitacoes.map((solicitacao) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-medium">{solicitacao.cdIdentificacao}</TableCell>
                  <TableCell className="max-w-xs truncate">{solicitacao.dsAssunto}</TableCell>
                  <TableCell>{solicitacao.responsavel.nmResponsavel}</TableCell>
                  <TableCell>{solicitacao.area.nmArea}</TableCell>
                  <TableCell>{solicitacao.tema.nmTema}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(solicitacao.flStatus)}>
                      {getStatusText(solicitacao.flStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(solicitacao.dtCriacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(solicitacao)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(solicitacao)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={50}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Filter Modal */}
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
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
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
                      <SelectItem value="">Todos</SelectItem>
                      {responsaveis.map((resp) => (
                        <SelectItem key={resp.id} value={resp.id.toString()}>
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
                      <SelectItem value="">Todos</SelectItem>
                      {temas.map((tema) => (
                        <SelectItem key={tema.id} value={tema.id.toString()}>
                          {tema.nmTema}
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

      <SolicitacaoModal
        open={showSolicitacaoModal}
        onOpenChange={setShowSolicitacaoModal}
        solicitacao={selectedSolicitacao}
        responsaveis={responsaveis}
        temas={temas}
        areas={areas}
        onSave={handleSolicitacaoSaved}
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
