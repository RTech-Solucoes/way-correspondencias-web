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
  Kanban
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Solicitacao } from '@/lib/types';
import { mockSolicitacoes } from '@/lib/mockData';
import { getResponsavelNameById } from '@/lib/mockData';
import SolicitacaoModal from './SolicitacaoModal';
import Link from 'next/link';

export default function SolicitacoesTable() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Solicitacao | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Solicitacao) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSolicitacoes = [...solicitacoes].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === bValue) return 0;

    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }

    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      return aValue.length - bValue.length * direction;
    }

    return 0;
  });

  const filteredSolicitacoes = sortedSolicitacoes.filter(solicitacao => 
    solicitacao.ds_assunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.ds_descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.cd_identificacao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (solicitacao.id_responsavel && 
      getResponsavelNameById(solicitacao.id_responsavel).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateSolicitacao = () => {
    setSelectedSolicitacao(null);
    setShowSolicitacaoModal(true);
  };

  const handleEditSolicitacao = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setShowSolicitacaoModal(true);
  };

  const handleDeleteSolicitacao = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      setSolicitacoes(solicitacoes.filter(solicitacao => solicitacao.id_solicitacao !== id));
    }
  };

  const handleSaveSolicitacao = (solicitacao: Solicitacao) => {
    if (selectedSolicitacao) {
      // Update existing solicitacao
      setSolicitacoes(solicitacoes.map(s => s.id_solicitacao === solicitacao.id_solicitacao ? solicitacao : s));
    } else {
      // Add new solicitacao
      setSolicitacoes([...solicitacoes, solicitacao]);
    }
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
  };

  const getStatusBadge = (status: Solicitacao['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'atrasado':
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de Solicitações
          </h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-50"
              onClick={() => {
                // This would be handled by a router in a real implementation
                window.location.href = "/solicitacoes/kanban";
              }}
            >
              <Kanban className="h-4 w-4 mr-2" />
              Ver Kanban
            </Button>
            <Button 
              onClick={handleCreateSolicitacao} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por assunto, descrição, identificação ou responsável..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('cd_identificacao')}>
                <div className="flex items-center">
                  Identificação
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('ds_assunto')}>
                <div className="flex items-center">
                  Assunto
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('id_responsavel')}>
                <div className="flex items-center">
                  Responsável
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dt_criacao')}>
                <div className="flex items-center">
                  Data de Criação
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSolicitacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma solicitação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSolicitacoes.map((solicitacao) => (
                <TableRow key={solicitacao.id_solicitacao} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{solicitacao.cd_identificacao}</TableCell>
                  <TableCell>{solicitacao.ds_assunto}</TableCell>
                  <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                  <TableCell>
                    {solicitacao.id_responsavel ? 
                      getResponsavelNameById(solicitacao.id_responsavel) : 
                      <span className="text-gray-400">Não atribuído</span>
                    }
                  </TableCell>
                  <TableCell>{new Date(solicitacao.dt_criacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditSolicitacao(solicitacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteSolicitacao(solicitacao.id_solicitacao)}
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

      {/* Solicitacao Modal */}
      {showSolicitacaoModal && (
        <SolicitacaoModal
          solicitacao={selectedSolicitacao}
          onClose={() => {
            setShowSolicitacaoModal(false);
            setSelectedSolicitacao(null);
          }}
          onSave={handleSaveSolicitacao}
        />
      )}
    </div>
  );
}
