'use client';

import {useState, useEffect} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  TagIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {TemaModal} from '@/components/temas/TemaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import {TemaResponse} from '@/api/temas/types';
import {temasClient} from '@/api/temas/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';

export default function TemasPage() {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTema, setSelectedTema] = useState<TemaResponse | null>(null);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [temaToDelete, setTemaToDelete] = useState<TemaResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    nome: '',
    descricao: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadTemas();
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadTemas = async () => {
    try {
      setLoading(true);

      if (activeFilters.nome && !activeFilters.descricao && !debouncedSearchQuery) {
        const result = await temasClient.buscarPorNmTema(activeFilters.nome);
        setTemas([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.nome) filterParts.push(activeFilters.nome);
        if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

        const response = await temasClient.buscarPorFiltro({
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 50,
        });

        setTemas(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (error) {
      toast.error("Erro ao carregar temas");
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
        toast.success("Tema excluído com sucesso");
        loadTemas();
      } catch (error) {
        toast.error("Erro ao excluir tema");
      } finally {
        setShowDeleteDialog(false);
        setTemaToDelete(null);
      }
    }
  };

  const handleTemaSaved = () => {
    setShowTemaModal(false);
    setSelectedTema(null);
    loadTemas();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      nome: '',
      descricao: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

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

      <div className="flex flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Carregando temas...
                </TableCell>
              </TableRow>
            ) : temas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <TagIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum tema encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              temas.map((tema) => (
                <TableRow key={tema.id}>
                  <TableCell className="font-medium">{tema.nmTema}</TableCell>
                  <TableCell>{tema.dsTema}</TableCell>
                  <TableCell>{new Date(tema.dtCriacao).toLocaleDateString('pt-BR')}</TableCell>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={50}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Temas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={filters.nome}
                  onChange={(e) => setFilters({...filters, nome: e.target.value})}
                  placeholder="Filtrar por nome"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={filters.descricao}
                  onChange={(e) => setFilters({...filters, descricao: e.target.value})}
                  placeholder="Filtrar por descrição"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
              <Button onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <TemaModal
        isOpen={showTemaModal}
        onClose={() => {
          setShowTemaModal(false);
          setSelectedTema(null);
        }}
        onSave={handleTemaSaved}
        tema={selectedTema}
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