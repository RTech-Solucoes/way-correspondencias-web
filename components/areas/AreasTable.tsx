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
  ArrowUpDown 
} from 'lucide-react';
import { Area } from '@/lib/types';
import { mockAreas } from '@/lib/mockData';
import AreaModal from './AreaModal';

export default function AreasTable() {
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Area | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const filteredAreas = sortedAreas.filter(area => 
    area.nm_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.ds_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.cd_area.toString().includes(searchQuery)
  );

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
      setAreas(areas.filter(area => area.id_area !== id));
    }
  };

  const handleSaveArea = (area: Area) => {
    if (selectedArea) {
      // Update existing area
      setAreas(areas.map(a => a.id_area === area.id_area ? area : a));
    } else {
      // Add new area
      setAreas([...areas, area]);
    }
    setShowAreaModal(false);
    setSelectedArea(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
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
          <Button variant="secondary" className="h-10 px-4">
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
              <TableHead className="w-24 cursor-pointer" onClick={() => handleSort('cd_area')}>
                <div className="flex items-center">
                  Código
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nm_area')}>
                <div className="flex items-center">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('ds_area')}>
                <div className="flex items-center">
                  Descrição
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dt_cadastro')}>
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
                <TableRow key={area.id_area} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{area.cd_area}</TableCell>
                  <TableCell>{area.nm_area}</TableCell>
                  <TableCell>{area.ds_area}</TableCell>
                  <TableCell>{new Date(area.dt_cadastro).toLocaleDateString('pt-BR')}</TableCell>
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
                        onClick={() => handleDeleteArea(area.id_area)}
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
    </div>
  );
}