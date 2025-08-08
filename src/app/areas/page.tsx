'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Area } from '@/lib/types';
import { mockAreas } from '@/lib/mockData';
import AreaModal from '../../components/areas/AreaModal';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Area | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter states
  const [filters, setFilters] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const handleSort = (field: keyof Area) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
      dataInicio: '',
      dataFim: ''
    };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
  };

  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  };

  const filteredAreas = sortedAreas.filter(area => {
    // Search query filter
    const matchesSearch = area.nmArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.dsArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.cdArea.toString().includes(searchQuery);

    // Advanced filters
    const matchesCodigo = !activeFilters.codigo ||
      area.cdArea.toString().includes(activeFilters.codigo);

    const matchesNome = !activeFilters.nome ||
      area.nmArea.toLowerCase().includes(activeFilters.nome.toLowerCase());

    const matchesDescricao = !activeFilters.descricao ||
      area.dsArea.toLowerCase().includes(activeFilters.descricao.toLowerCase());

    const matchesDataInicio = !activeFilters.dataInicio ||
      new Date(area.dtCadastro) >= new Date(activeFilters.dataInicio);

    const matchesDataFim = !activeFilters.dataFim ||
      new Date(area.dtCadastro) <= new Date(activeFilters.dataFim);

    return matchesSearch && matchesCodigo && matchesNome && matchesDescricao &&
           matchesDataInicio && matchesDataFim;
  });

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleCreateArea = () => {
    setSelectedArea(null);
    setShowAreaModal(true);
  };

  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDeleteArea = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta área?')) {
      setAreas(areas.filter(area => area.idArea !== id));
    }
  };

  const handleSaveArea = (area: Area) => {
    if (selectedArea) {
      // Update existing area
      setAreas(areas.map(a => a.idArea === area.idArea ? area : a));
    } else {
      // Add new area
      setAreas([...areas, area]);
    }
    setShowAreaModal(false);
    setSelectedArea(null);
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
            <Plus className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
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
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmArea')}>
                <div className="flex items-center">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsArea')}>
                <div className="flex items-center">
                  Descrição
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dtCadastro')}>
                <div className="flex items-center">
                  Data de Cadastro
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma área encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => (
                <TableRow key={area.idArea} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{area.cdArea}</TableCell>
                  <TableCell>{area.nmArea}</TableCell>
                  <TableCell>{area.dsArea}</TableCell>
                  <TableCell>{new Date(area.dtCadastro).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditArea(area)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteArea(area.idArea)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFilterModal(false);
                  handleClearFilters();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
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
    </div>
  );
}