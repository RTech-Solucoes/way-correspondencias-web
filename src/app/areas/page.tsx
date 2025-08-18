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
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {AreaResponse} from '@/api/areas/types';
import {areasClient} from '@/api/areas/client';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';

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

  useEffect(() => {
    loadAreas();
  }, [currentPage, activeFilters, searchQuery]);

  const loadAreas = async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (searchQuery) filterParts.push(searchQuery);
      if (activeFilters.codigo) filterParts.push(activeFilters.codigo);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);
      if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

      const filtro = filterParts.join(' ');

      const response = await areasClient.buscarPorFiltro({
        filtro: filtro || undefined,
        page: currentPage,
        size: 10,
        sort: sortField ? `${sortField},${sortDirection}` : undefined
      });

      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
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

  const sortedAreas = [...areas].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    
    if (aValue < bValue) return -1 * direction;
    return 1 * direction;
  });

  const handleClearFilters = () => {
    const emptyFilters = {
      codigo: '',
      nome: '',
      descricao: '',
      ativo: ''
    };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setCurrentPage(0);
  };

  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setShowFilterModal(false);
    setCurrentPage(0);
  };

  const filteredAreas = sortedAreas.filter(area => {
    const matchesSearch = area.nmArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.dsArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.cdArea.toString().includes(searchQuery);

    const matchesCodigo = !activeFilters.codigo ||
      area.cdArea.toString().includes(activeFilters.codigo);

    const matchesNome = !activeFilters.nome ||
      area.nmArea.toLowerCase().includes(activeFilters.nome.toLowerCase());

    const matchesDescricao = !activeFilters.descricao ||
      area.dsArea.toLowerCase().includes(activeFilters.descricao.toLowerCase());

    const matchesAtivo = !activeFilters.ativo ||
      area.flAtivo === activeFilters.ativo;

    return matchesSearch && matchesCodigo && matchesNome && matchesDescricao &&
           matchesAtivo;
  });

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleCreateArea = () => {
    setSelectedArea(null);
    setShowAreaModal(true);
  };

  const handleEditArea = (area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDeleteArea = (id: number) => {
    setAreaToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteArea = async () => {
    if (areaToDelete) {
      try {
        await areasClient.deletar(areaToDelete);
        loadAreas();
      } catch (error) {
        console.error('Erro ao excluir área:', error);
      }
    }
    setAreaToDelete(null);
  };

  const handleSaveArea = async (areaData: any) => {
    try {
      if (selectedArea) {
        await areasClient.atualizar(selectedArea.idArea, areaData);
      } else {
        await areasClient.criar(areaData);
      }
      setShowAreaModal(false);
      setSelectedArea(null);
      loadAreas();
    } catch (error) {
      console.error('Erro ao salvar área:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de Áreas
          </h1>
          <Button 
            onClick={handleCreateArea} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, código ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
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
              onClick={handleClearFilters}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-24 cursor-pointer" onClick={() => handleSort('cdArea')}>
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsArea')}>
                <div className="flex items-center">
                  Descrição
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Carregando áreas...
                </TableCell>
              </TableRow>
            ) : areas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhuma área encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => (
                <TableRow key={area.idArea} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{area.cdArea}</TableCell>
                  <TableCell>{area.nmArea}</TableCell>
                  <TableCell>{area.dsArea}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      area.flAtivo === 'S' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {area.flAtivo === 'S' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditArea(area)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteArea(area.idArea)}
                        className="text-red-500 hover:text-red-700"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {currentPage * 10 + 1} até {Math.min((currentPage + 1) * 10, totalElements)} de {totalElements} resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Area Modal */}
      {showAreaModal && (
        <AreaModal
          area={selectedArea}
          onClose={() => {
            setShowAreaModal(false);
            setSelectedArea(null);
          }}
          onSave={handleSaveArea}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Filtrar Áreas
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={filters.codigo}
                  onChange={(e) => setFilters({ ...filters, codigo: e.target.value })}
                  placeholder="Filtrar por código"
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={filters.nome}
                  onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
                  placeholder="Filtrar por nome"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={filters.descricao}
                  onChange={(e) => setFilters({ ...filters, descricao: e.target.value })}
                  placeholder="Filtrar por descrição"
                />
              </div>
              <div>
                <Label htmlFor="ativo">Status</Label>
                <select
                  id="ativo"
                  value={filters.ativo}
                  onChange={(e) => setFilters({ ...filters, ativo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="S">Ativo</option>
                  <option value="N">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Área"
        description="Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteArea}
      />
    </div>
  );
}