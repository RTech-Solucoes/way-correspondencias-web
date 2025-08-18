'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FileTextIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon
} from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TemaModal } from '@/components/temas/TemaModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { temasClient } from '@/api/temas/client';
import { TemaResponse, TemaFilterParams } from '@/api/temas/types';
import { useToast } from '@/hooks/use-toast';

export default function TemasPage() {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTema, setSelectedTema] = useState<TemaResponse | null>(null);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [temaToDelete, setTemaToDelete] = useState<TemaResponse | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    nmTema: '',
    ativo: '',
  });

  // Carregar temas na inicialização
  useEffect(() => {
    const loadTemas = async () => {
      try {
        setLoading(true);
        const params: TemaFilterParams = {
          filtro: searchQuery || undefined,
          page: 0,
          size: 100,
        };
        const response = await temasClient.buscarPorFiltro(params);
        setTemas(response.content);
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao carregar temas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemas();
  }, [searchQuery, toast]);

  // Buscar temas por filtros específicos
  const handleSearch = async () => {
    try {
      setLoading(true);
      let results: TemaResponse[];

      if (filters.nmTema) {
        const result = await temasClient.buscarPorNmTema(filters.nmTema);
        results = [result];
      } else {
        const params: TemaFilterParams = {
          filtro: searchQuery || undefined,
        };
        const response = await temasClient.buscarPorFiltro(params);
        results = response.content;
      }

      // Filtrar por status ativo se especificado
      if (filters.ativo) {
        const isAtivo = filters.ativo === 'true';
        results = results.filter(tema => tema.flAtivo === isAtivo);
      }

      setTemas(results);
      setShowFilterModal(false);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao buscar temas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tema: TemaResponse) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
  };

  const handleDelete = (tema: TemaResponse) => {
    setTemaToDelete(tema);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (temaToDelete) {
      try {
        await temasClient.deletar(temaToDelete.id);
        toast({
          title: "Sucesso",
          description: "Tema excluído com sucesso",
        });
        const params: TemaFilterParams = {
          filtro: searchQuery || undefined,
          page: 0,
          size: 100,
        };
        const response = await temasClient.buscarPorFiltro(params);
        setTemas(response.content);
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao excluir tema",
          variant: "destructive",
        });
      } finally {
        setShowDeleteDialog(false);
        setTemaToDelete(null);
      }
    }
  };

  const handleTemaSaved = () => {
    setShowTemaModal(false);
    setSelectedTema(null);
    // Reload temas
    const loadTemas = async () => {
      const params: TemaFilterParams = {
        filtro: searchQuery || undefined,
        page: 0,
        size: 100,
      };
      const response = await temasClient.buscarPorFiltro(params);
      setTemas(response.content);
    };
    loadTemas();
  };

  const filteredTemas = temas.filter(tema =>
    tema.nmTema.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tema.dsTema.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedTema(null);
            setShowTemaModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Novo Tema
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar temas..."
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
              <TableHead>Nome do Tema</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando temas...
                </TableCell>
              </TableRow>
            ) : filteredTemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <FileTextIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum tema encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemas.map((tema) => (
                <TableRow key={tema.id}>
                  <TableCell className="font-medium">{tema.nmTema}</TableCell>
                  <TableCell className="max-w-xs truncate">{tema.dsTema}</TableCell>
                  <TableCell>
                    <Badge variant={tema.flAtivo ? 'default' : 'secondary'}>
                      {tema.flAtivo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tema.dtCriacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {tema.dtUltimaAtualizacao
                      ? new Date(tema.dtUltimaAtualizacao).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tema)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tema)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Temas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nmTema">Nome do Tema</Label>
                <Input
                  id="nmTema"
                  value={filters.nmTema}
                  onChange={(e) => setFilters({...filters, nmTema: e.target.value})}
                  placeholder="Filtrar por nome do tema"
                />
              </div>
              <div>
                <Label htmlFor="ativo">Status</Label>
                <select
                  id="ativo"
                  value={filters.ativo}
                  onChange={(e) => setFilters({...filters, ativo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    nmTema: '',
                    ativo: '',
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

      {/* Tema Modal */}
      <TemaModal
        isOpen={showTemaModal}
        onClose={() => setShowTemaModal(false)}
        tema={null}
        onSave={handleTemaSaved}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Tema"
        description={`Tem certeza que deseja excluir o tema "${temaToDelete?.nmTema}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}