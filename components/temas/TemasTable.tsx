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
import { Tema } from '@/lib/types';
import { mockTemas } from '@/lib/mockData';
import { getAreaNameById } from '@/lib/mockData';
import TemaModal from './TemaModal';

export default function TemasTable() {
  const [temas, setTemas] = useState<Tema[]>(mockTemas);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Tema | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Tema) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTemas = [...temas].sort((a, b) => {
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

  const filteredTemas = sortedTemas.filter(tema => 
    tema.ds_tema.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tema.nm_tema.toString().includes(searchQuery) ||
    getAreaNameById(tema.id_area).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTema = () => {
    setSelectedTema(null);
    setShowTemaModal(true);
  };

  const handleEditTema = (tema: Tema) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
  };

  const handleDeleteTema = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tema?')) {
      setTemas(temas.filter(tema => tema.id_tema !== id));
    }
  };

  const handleSaveTema = (tema: Tema) => {
    if (selectedTema) {
      // Update existing tema
      setTemas(temas.map(t => t.id_tema === tema.id_tema ? tema : t));
    } else {
      // Add new tema
      setTemas([...temas, tema]);
    }
    setShowTemaModal(false);
    setSelectedTema(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de Temas
          </h1>
          <Button 
            onClick={handleCreateTema} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tema
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, número ou área..."
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
              <TableHead className="w-16 cursor-pointer" onClick={() => handleSort('nm_tema')}>
                <div className="flex items-center">
                  Nº
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('ds_tema')}>
                <div className="flex items-center">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('id_area')}>
                <div className="flex items-center">
                  Área
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nr_dias_prazo')}>
                <div className="flex items-center">
                  Prazo (dias)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('tp_contagem')}>
                <div className="flex items-center">
                  Tipo de Contagem
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
            {filteredTemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum tema encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredTemas.map((tema) => (
                <TableRow key={tema.id_tema} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{tema.nm_tema}</TableCell>
                  <TableCell>{tema.ds_tema}</TableCell>
                  <TableCell>{getAreaNameById(tema.id_area)}</TableCell>
                  <TableCell>{tema.nr_dias_prazo}</TableCell>
                  <TableCell>{tema.tp_contagem}</TableCell>
                  <TableCell>{new Date(tema.dt_cadastro).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditTema(tema)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteTema(tema.id_tema)}
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

      {/* Tema Modal */}
      {showTemaModal && (
        <TemaModal
          tema={selectedTema}
          onClose={() => {
            setShowTemaModal(false);
            setSelectedTema(null);
          }}
          onSave={handleSaveTema}
        />
      )}
    </div>
  );
}