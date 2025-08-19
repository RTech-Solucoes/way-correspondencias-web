'use client';

import {useState, useEffect} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowsDownUpIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  BuildingIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {AreaResponse} from '@/api/areas/types';
import {areasClient} from '@/api/areas/client';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<AreaResponse | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof AreaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadAreas();
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadAreas = async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.codigo) filterParts.push(activeFilters.codigo);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);
      if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

      const filtro = filterParts.join(' ');

      const response = await areasClient.buscarPorFiltro({
        filtro: filtro || undefined,
        page: currentPage,
        size: 50,
        sort: sortField ? `${sortField},${sortDirection}` : undefined
      });

      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof AreaResponse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleEdit = (area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDelete = async (areaId: number) => {
    setAreaToDelete(areaId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        await areasClient.deletar(areaToDelete);
        toast.success("Área excluída com sucesso");
        loadAreas();
      } catch (error) {
        toast.error("Erro ao excluir área");
      } finally {
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  const handleAreaSaved = () => {
    setShowAreaModal(false);
    setSelectedArea(null);
    loadAreas();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      codigo: '',
      nome: '',
      descricao: '',
      ativo: ''
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
            setSelectedArea(null);
            setShowAreaModal(true);
          }} className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar áreas..."
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
            <FunnelSimpleIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
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
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('cdArea')}>
                <div className="flex items-center">
                  Código
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmArea')}>
                <div className="flex items-center">
                  Nome
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando áreas...
                </TableCell>
              </TableRow>
            ) : areas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <BuildingIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhuma área encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              areas.map((area) => (
                <TableRow key={area.idArea}>
                  <TableCell className="font-medium">{area.cdArea}</TableCell>
                  <TableCell>{area.nmArea}</TableCell>
                  <TableCell>{area.dsArea}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.flAtivo === 'S' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {area.flAtivo === 'S' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(area)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(area.idArea)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
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
              <DialogTitle>Filtrar Áreas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={filters.codigo}
                  onChange={(e) => setFilters({...filters, codigo: e.target.value})}
                  placeholder="Filtrar por código"
                />
              </div>
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

      {showAreaModal && (
        <AreaModal
          area={selectedArea}
          onClose={() => {
            setShowAreaModal(false);
            setSelectedArea(null);
          }}
          onSave={handleAreaSaved}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Área"
        description="Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita."
      />
    </div>
  );
}