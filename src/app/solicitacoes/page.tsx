'use client';

import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Solicitacao} from '@/lib/types';
import {getResponsavelNameById, mockSolicitacoes} from '@/lib/mockData';
import SolicitacaoModal from '../../components/solicitacoes/SolicitacaoModal';
import {
  DotsThreeVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@phosphor-icons/react';

export default function SolicitacoesPage() {
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
    solicitacao.dsAssunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.dsDescricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solicitacao.cdIdentificacao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (solicitacao.idResponsavel && 
      getResponsavelNameById(solicitacao.idResponsavel).toLowerCase().includes(searchQuery.toLowerCase()))
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
      setSolicitacoes(solicitacoes.filter(solicitacao => solicitacao.idSolicitacao !== id));
    }
  };

  const handleSaveSolicitacao = (solicitacao: Solicitacao) => {
    if (selectedSolicitacao) {
      setSolicitacoes(solicitacoes.map(s => s.idSolicitacao === solicitacao.idSolicitacao ? solicitacao : s));
    } else {
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
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de Solicitações
          </h1>
          <div className="flex space-x-2">
            <Button 
              onClick={handleCreateSolicitacao} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por assunto, descrição, identificação ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button variant="secondary" className="h-10 px-4">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('cdIdentificacao')}>
                <div className="flex items-center">
                  Identificação
                  <DotsThreeVerticalIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsAssunto')}>
                <div className="flex items-center">
                  Assunto
                  <DotsThreeVerticalIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status
                  <DotsThreeVerticalIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('idResponsavel')}>
                <div className="flex items-center">
                  Responsável
                  <DotsThreeVerticalIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dtCriacao')}>
                <div className="flex items-center">
                  Data de Criação
                  <DotsThreeVerticalIcon className="ml-2 h-4 w-4" />
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
                <TableRow key={solicitacao.idSolicitacao} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{solicitacao.cdIdentificacao}</TableCell>
                  <TableCell>{solicitacao.dsAssunto}</TableCell>
                  <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                  <TableCell>
                    {solicitacao.idResponsavel ? 
                      getResponsavelNameById(solicitacao.idResponsavel) : 
                      <span className="text-gray-400">Não atribuído</span>
                    }
                  </TableCell>
                  <TableCell>{new Date(solicitacao.dtCriacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditSolicitacao(solicitacao)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteSolicitacao(solicitacao.idSolicitacao)}
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
