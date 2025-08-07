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
import { Responsavel } from '@/lib/types';
import { mockResponsaveis } from '@/lib/mockData';
import ResponsavelModal from '../../components/responsaveis/ResponsavelModal';

export default function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(mockResponsaveis);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Responsavel | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Responsavel) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResponsaveis = [...responsaveis].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === bValue) return 0;

    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }

    return 0;
  });

  const filteredResponsaveis = sortedResponsaveis.filter(responsavel => 
    responsavel.dsNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.dsEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.nmTelefone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateResponsavel = () => {
    setSelectedResponsavel(null);
    setShowResponsavelModal(true);
  };

  const handleEditResponsavel = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  };

  const handleDeleteResponsavel = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este responsável?')) {
      setResponsaveis(responsaveis.filter(responsavel => responsavel.idResponsavel !== id));
    }
  };

  const handleSaveResponsavel = (responsavel: Responsavel) => {
    if (selectedResponsavel) {
      // Update existing responsavel
      setResponsaveis(responsaveis.map(r => r.idResponsavel === responsavel.idResponsavel ? responsavel : r));
    } else {
      // Add new responsavel
      setResponsaveis([...responsaveis, responsavel]);
    }
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de Responsáveis
          </h1>
          <Button 
            onClick={handleCreateResponsavel} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Responsável
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, email ou telefone..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsNome')}>
                <div className="flex items-center">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsEmail')}>
                <div className="flex items-center">
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmTelefone')}>
                <div className="flex items-center">
                  Telefone
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResponsaveis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhum responsável encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredResponsaveis.map((responsavel) => (
                <TableRow key={responsavel.idResponsavel} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{responsavel.dsNome}</TableCell>
                  <TableCell>{responsavel.dsEmail}</TableCell>
                  <TableCell>{responsavel.nmTelefone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditResponsavel(responsavel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteResponsavel(responsavel.idResponsavel)}
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

      {/* Responsavel Modal */}
      {showResponsavelModal && (
        <ResponsavelModal
          responsavel={selectedResponsavel}
          onClose={() => {
            setShowResponsavelModal(false);
            setSelectedResponsavel(null);
          }}
          onSave={handleSaveResponsavel}
        />
      )}
    </div>
  );
}
