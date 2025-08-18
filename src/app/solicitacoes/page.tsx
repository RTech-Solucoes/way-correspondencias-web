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
  FileTextIcon
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    identificacao: '',
    responsavel: '',
    tema: '',
    area: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadSolicitacoes();
    loadResponsaveis();
    loadTemas();
    loadAreas();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const params: SolicitacaoFilterParams = {
        filtro: searchQuery || undefined,
        page: 0,
        size: 100,
      };
      const response = await solicitacoesClient.buscarPorFiltro(params);
      setSolicitacoes(response.content);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações",
        variant: "destructive",
      });
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      let results: SolicitacaoResponse[];

      if (filters.identificacao) {
        const result = await solicitacoesClient.buscarPorCdIdentificacao(filters.identificacao);
        results = [result];
      } else if (filters.responsavel) {
        results = await solicitacoesClient.buscarPorResponsavel(parseInt(filters.responsavel));
      } else if (filters.tema) {
        results = await solicitacoesClient.buscarPorTema(parseInt(filters.tema));
      } else if (filters.area) {
        if (filters.status) {
          results = await solicitacoesClient.buscarPorAreaEStatus(parseInt(filters.area), filters.status);
        } else {
          results = await solicitacoesClient.buscarPorArea(parseInt(filters.area));
        }
      } else if (filters.status) {
        if (filters.responsavel) {
          results = await solicitacoesClient.buscarPorResponsavelEStatus(parseInt(filters.responsavel), filters.status);
        } else {
          results = await solicitacoesClient.buscarPorStatus(filters.status);
        }
      } else if (filters.dateFrom && filters.dateTo) {
        results = await solicitacoesClient.buscarPorPeriodo(
          filters.dateFrom + 'T00:00:00',
          filters.dateTo + 'T23:59:59'
        );
      } else {
        const params: SolicitacaoFilterParams = {
          filtro: searchQuery || undefined,
        };
        const response = await solicitacoesClient.buscarPorFiltro(params);
        results = response.content;
      }

      setSolicitacoes(results);
      setShowFilterModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar solicitações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        toast({
          title: "Sucesso",
          description: "Solicitação excluída com sucesso",
        });
        loadSolicitacoes();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir solicitação",
          variant: "destructive",
        });
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

  const filteredSolicitacoes = solicitacoes.filter(solicitacao =>
    solicitacao.dsAssunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.cdIdentificacao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.txConteudo.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2"/>
            Buscar
          </Button>
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
            ) : filteredSolicitacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <FileTextIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhuma solicitação encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSolicitacoes.map((solicitacao) => (
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
              <div className="grid grid-cols-3 gap-4">
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
                      <SelectItem value="">Todas</SelectItem>
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
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    identificacao: '',
                    responsavel: '',
                    tema: '',
                    area: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                  });
                  setShowFilterModal(false);
                }}
              >
                Limpar Filtros
              </Button>
              <Button onClick={handleSearch}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Solicitacao Modal */}
      <SolicitacaoModal
        open={showSolicitacaoModal}
        onOpenChange={setShowSolicitacaoModal}
        solicitacao={selectedSolicitacao}
        responsaveis={responsaveis}
        temas={temas}
        areas={areas}
        onSave={handleSolicitacaoSaved}
      />

      {/* Delete Confirmation Dialog */}
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
