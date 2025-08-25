'use client';

import React, { useEffect, useCallback } from 'react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  UsersIcon,
  SpinnerIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import ResponsavelModal from '@/components/responsaveis/ResponsavelModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';
import {getStatusText} from "@/utils/utils";
import { useResponsaveis } from '@/context/responsaveis/ResponsaveisContext';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelFilterParams } from '@/api/responsaveis/types';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export default function ResponsaveisPage() {
  const {
    responsaveis,
    setResponsaveis,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    selectedResponsavel,
    setSelectedResponsavel,
    showResponsavelModal,
    setShowResponsavelModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    responsavelToDelete,
    setResponsavelToDelete,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalElements,
    setTotalElements,
    filters,
    setFilters,
    activeFilters,
    hasActiveFilters,
    sortField,
    sortDirection,
    handleEdit,
    handleDelete,
    handleResponsavelSave,
    applyFilters,
    clearFilters,
    handleSort,
  } = useResponsaveis();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadResponsaveis = useCallback(async () => {
    try {
      setLoading(true);

      if (activeFilters.usuario && !activeFilters.email && !debouncedSearchQuery) {
        const result = await responsaveisClient.buscarPorNmUsuarioLogin(activeFilters.usuario);
        setResponsaveis([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else if (activeFilters.email && !activeFilters.usuario && !debouncedSearchQuery) {
        const result = await responsaveisClient.buscarPorDsEmail(activeFilters.email);
        setResponsaveis([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.usuario) filterParts.push(activeFilters.usuario);

        const params: ResponsavelFilterParams = {
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 10,
        };

        const response = await responsaveisClient.buscarPorFiltro(params);
        setResponsaveis(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch {
      toast.error("Erro ao carregar responsáveis");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery, setLoading, setResponsaveis, setTotalPages, setTotalElements]);

  useEffect(() => {
    loadResponsaveis();
  }, [loadResponsaveis]);

  const confirmDelete = async () => {
    if (responsavelToDelete) {
      try {
        await responsaveisClient.deletar(responsavelToDelete.idResponsavel);
        toast.success("Responsável excluído com sucesso");
        loadResponsaveis();
      } catch {
        toast.error("Erro ao excluir responsável");
      } finally {
        setShowDeleteDialog(false);
        setResponsavelToDelete(null);
      }
    }
  };

  const onResponsavelSave = () => {
    handleResponsavelSave();
    loadResponsaveis();
  };

  const sortedResponsaveis = () => {
    const sorted = [...responsaveis];
    if (sortField) {
      sorted.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;
        
        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  };

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
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={clearFilters}
            >
              <XIcon className="h-4 w-4 mr-2"/>
              Limpar Filtros
            </Button>
          )}
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
            Filtrar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white">
        <StickyTable>
          <StickyTableHeader>
            <StickyTableRow>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmResponsavel')}>
                <div className="flex items-center">
                  Nome
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmUsuarioLogin')}>
                <div className="flex items-center">
                  Usuário
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('dsEmail')}>
                <div className="flex items-center">
                  Email
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead>Perfil</StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nrCpf')}>
                <div className="flex items-center">
                  CPF
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="text-right">Ações</StickyTableHead>
            </StickyTableRow>
          </StickyTableHeader>
          <StickyTableBody>
            {loading ? (
              <StickyTableRow>
                <StickyTableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando responsáveis...</span>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : responsaveis?.length === 0 ? (
              <StickyTableRow>
                <StickyTableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <UsersIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum responsável encontrado</p>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : (
              sortedResponsaveis().map((responsavel) => (
                <StickyTableRow key={responsavel.idResponsavel}>
                  <StickyTableCell className="font-medium">{responsavel.nmResponsavel}</StickyTableCell>
                  <StickyTableCell>{responsavel.nmUsuarioLogin}</StickyTableCell>
                  <StickyTableCell>{responsavel.dsEmail}</StickyTableCell>
                  <StickyTableCell>{responsavel.nmPerfil || 'N/A'}</StickyTableCell>
                  <StickyTableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      responsavel.flAtivo === 'S'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(responsavel.flAtivo)}
                    </span>
                  </StickyTableCell>
                  <StickyTableCell>{responsavel.nrCpf}</StickyTableCell>
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(responsavel)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(responsavel)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              ))
            )}
          </StickyTableBody>
        </StickyTable>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={15}
        onPageChange={setCurrentPage}
        loading={loading}
      />

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <Button onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showResponsavelModal && (
        <ResponsavelModal
          responsavel={selectedResponsavel}
          open={showResponsavelModal}
          onClose={() => {
            setShowResponsavelModal(false);
            setSelectedResponsavel(null);
          }}
          onSave={onResponsavelSave}
        />
      )}

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
