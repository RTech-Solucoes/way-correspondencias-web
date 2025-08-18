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
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
  FunnelSimpleIcon,
  ArrowsDownUpIcon,
  XIcon,
  UserIcon
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Responsavel } from '@/types/responsaveis/types';
import { mockResponsaveis } from '@/lib/mockData';
import ResponsavelModal from '../../components/responsaveis/ResponsavelModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';

export default function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(mockResponsaveis);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Responsavel | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState({
    nome: '',
    email: '',
    telefone: '',
    perfil: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<string | null>(null);

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

  const handleClearFilters = () => {
    const emptyFilters = {
      nome: '',
      email: '',
      telefone: '',
      perfil: ''
    };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
  };

  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  };

  const filteredResponsaveis = sortedResponsaveis.filter(responsavel => {
    const matchesSearch = responsavel.dsNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      responsavel.dsEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      responsavel.nmTelefone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNome = !activeFilters.nome ||
      responsavel.dsNome.toLowerCase().includes(activeFilters.nome.toLowerCase());

    const matchesEmail = !activeFilters.email ||
      responsavel.dsEmail.toLowerCase().includes(activeFilters.email.toLowerCase());

    const matchesTelefone = !activeFilters.telefone ||
      responsavel.nmTelefone.includes(activeFilters.telefone);

    const matchesPerfil = !activeFilters.perfil ||
      responsavel.dsPerfil === activeFilters.perfil;

    return matchesSearch && matchesNome && matchesEmail && matchesTelefone && matchesPerfil;
  });

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleCreateResponsavel = () => {
    setSelectedResponsavel(null);
    setShowResponsavelModal(true);
  };

  const handleEditResponsavel = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  };

  const handleDeleteResponsavel = (id: string) => {
    setResponsavelToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteResponsavel = () => {
    if (responsavelToDelete) {
      setResponsaveis(responsaveis.filter(responsavel => responsavel.idResponsavel !== responsavelToDelete));
    }
    setResponsavelToDelete(null);
  };

  const handleSaveResponsavel = (responsavel: Responsavel) => {
    if (selectedResponsavel) {
      setResponsaveis(responsaveis.map(r => r.idResponsavel === responsavel.idResponsavel ? responsavel : r));
    } else {
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
          <PageTitle title="Responsáveis" icon={UserIcon} />
          <Button
            onClick={handleCreateResponsavel} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Responsável
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, email ou telefone..."
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
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsEmail')}>
                <div className="flex items-center">
                  Email
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmTelefone')}>
                <div className="flex items-center">
                  Telefone
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
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
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteResponsavel(responsavel.idResponsavel)}
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

      {/* Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Responsáveis</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  placeholder="Filtrar por email"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={filters.telefone}
                  onChange={(e) => setFilters({ ...filters, telefone: e.target.value })}
                  placeholder="Filtrar por telefone"
                />
              </div>
              <div>
                <Label htmlFor="perfil">Perfil</Label>
                <Select
                  value={filters.perfil}
                  onValueChange={(value: string) => setFilters({ ...filters, perfil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowFilterModal(false);
                handleClearFilters();
              }}
              className="mr-2"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Responsável"
        description="Tem certeza que deseja excluir este responsável? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteResponsavel}
      />
    </div>
  );
}
