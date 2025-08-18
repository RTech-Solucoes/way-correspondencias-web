'use client';

import { useState, useEffect } from 'react';
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
import ResponsavelModal from '../../components/responsaveis/ResponsavelModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse, ResponsavelFilterParams } from '@/api/responsaveis/types';
import { areasClient } from '@/api/areas/client';
import { AreaResponse } from '@/api/areas/types';
import { useToast } from '@/hooks/use-toast';

export default function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelResponse | null>(null);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<ResponsavelResponse | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    usuario: '',
    email: '',
    area: '',
  });

  // Carregar dados na inicialização
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadResponsaveis(), loadAreas()]);
    };
    loadData();
  }, []);

  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      const params: ResponsavelFilterParams = {
        filtro: searchQuery || undefined,
        page: 0,
        size: 100,
      };
      const response = await responsaveisClient.buscarPorFiltro(params);
      setResponsaveis(response.content);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar responsáveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areasClient.buscarPorFiltro({ size: 100 });
      setAreas(response.content);
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
    }
  };

  // Buscar responsáveis por filtros específicos
  const handleSearch = async () => {
    try {
      setLoading(true);
      let results: ResponsavelResponse[];

      if (filters.usuario) {
        const result = await responsaveisClient.buscarPorNmUsuario(filters.usuario);
        results = [result];
      } else if (filters.email) {
        const result = await responsaveisClient.buscarPorDsEmail(filters.email);
        results = [result];
      } else if (filters.area) {
        results = await responsaveisClient.buscarPorArea(parseInt(filters.area));
      } else {
        const params: ResponsavelFilterParams = {
          filtro: searchQuery || undefined,
        };
        const response = await responsaveisClient.buscarPorFiltro(params);
        results = response.content;
      }

      setResponsaveis(results);
      setShowFilterModal(false);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao buscar responsáveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (responsavel: ResponsavelResponse) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  };

  const handleDelete = (responsavel: ResponsavelResponse) => {
    setResponsavelToDelete(responsavel);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (responsavelToDelete) {
      try {
        await responsaveisClient.deletar(responsavelToDelete.id);
        toast({
          title: "Sucesso",
          description: "Responsável excluído com sucesso",
        });
        loadResponsaveis();
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao excluir responsável",
          variant: "destructive",
        });
      } finally {
        setShowDeleteDialog(false);
        setResponsavelToDelete(null);
      }
    }
  };

  const handleResponsavelSaved = () => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
    loadResponsaveis();
  };

  const getAreaName = (area: { id: number; nmArea: string; cdArea: string } | undefined) => {
    return area ? area.nmArea : 'N/A';
  };

  const filteredResponsaveis = responsaveis.filter(responsavel =>
    responsavel.nmResponsavel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.dsEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.nmUsuario.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedResponsavel(null);
            setShowResponsavelModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Novo Responsável
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar responsáveis..."
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
          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2"/>
            Buscar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando responsáveis...
                </TableCell>
              </TableRow>
            ) : filteredResponsaveis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <UserIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum responsável encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredResponsaveis.map((responsavel) => (
                <TableRow key={responsavel.id}>
                  <TableCell className="font-medium">{responsavel.nmResponsavel}</TableCell>
                  <TableCell>{responsavel.nmUsuario}</TableCell>
                  <TableCell>{responsavel.dsEmail}</TableCell>
                  <TableCell>{getAreaName(responsavel.area)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      responsavel.flAtivo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {responsavel.flAtivo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(responsavel.dtCriacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(responsavel)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(responsavel)}
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

      {/* Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Responsáveis</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="usuario">Usuário</Label>
                <Input
                  id="usuario"
                  value={filters.usuario}
                  onChange={(e) => setFilters({...filters, usuario: e.target.value})}
                  placeholder="Filtrar por usuário"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={filters.email}
                  onChange={(e) => setFilters({...filters, email: e.target.value})}
                  placeholder="Filtrar por email"
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select
                  value={filters.area}
                  onValueChange={(value) => setFilters({...filters, area: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.idArea} value={area.idArea.toString()}>
                        {area.nmArea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    usuario: '',
                    email: '',
                    area: '',
                  });
                  setShowFilterModal(false);
                }}
              >
                Limpar Filtros
              </Button>
              <Button onClick={handleSearch}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Responsavel Modal */}
      <ResponsavelModal
        responsavel={null}
        onClose={() => setShowResponsavelModal(false)}
        onSave={handleResponsavelSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Responsável"
        description={`Tem certeza que deseja excluir o responsável "${responsavelToDelete?.nmResponsavel}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
