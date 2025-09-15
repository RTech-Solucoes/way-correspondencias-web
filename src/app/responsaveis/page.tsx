'use client';

import React, {useCallback, useEffect} from 'react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  ArrowClockwiseIcon,
  ArrowsDownUpIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import ResponsavelModal from '@/components/responsaveis/ResponsavelModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import {Pagination} from '@/components/ui/pagination';
import {formatCPF, getStatusText} from "@/utils/utils";
import {useResponsaveis} from '@/context/responsaveis/ResponsaveisContext';
import {responsaveisClient} from '@/api/responsaveis/client';
import {ResponsavelFilterParams} from '@/api/responsaveis/types';
import {toast} from 'sonner';
import {useDebounce} from '@/hooks/use-debounce';
import {FiltrosAplicados} from '@/components/ui/applied-filters';
import {usePermissoes} from "@/context/permissoes/PermissoesContext";


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
    setActiveFilters,
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
  const { canInserirResponsavel, canAtualizarResponsavel, canDeletarResponsavel } = usePermissoes()

  const loadResponsaveis = useCallback(async () => {
    try {
      setLoading(true);

      const params: ResponsavelFilterParams = {
        filtro: debouncedSearchQuery || undefined,
        nmUsuarioLogin: activeFilters.usuario || undefined,
        dsEmail: activeFilters.email || undefined,
        page: currentPage,
        size: 10,
      };

      const response = await responsaveisClient.buscarPorFiltro(params);
      setResponsaveis(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
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

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  };

  const filtrosAplicados = [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.usuario ? [{
      key: 'usuario',
      label: 'Usuário',
      value: activeFilters.usuario,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, usuario: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.email ? [{
      key: 'email',
      label: 'Email',
      value: activeFilters.email,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, email: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : [])
  ];

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between">
        <PageTitle />

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadResponsaveis();
            }}
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {totalElements} {totalElements > 1 ? "responsáveis" : "responsável"}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            loading={loading}
            showOnlyPaginationButtons={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
          {canInserirResponsavel &&
            <Button onClick={() => {
              setSelectedResponsavel(null);
              setShowResponsavelModal(true);
            }}>
              <PlusIcon className="h-4 w-4 mr-2"/>
              Criar Responsável
            </Button>
          }
        </div>
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
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
              <StickyTableHead>Áreas</StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmCargo')}>
                <div className="flex items-center">
                  Nome do Cargo
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer w-36" onClick={() => handleSort('nrCpf')}>
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
                <StickyTableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando responsáveis...</span>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : responsaveis?.length === 0 ? (
              <StickyTableRow>
                <StickyTableCell colSpan={8} className="text-center py-8">
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
                    {responsavel.areas && responsavel.areas?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {responsavel.areas.slice(0, 2).map((area, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {area.area.nmArea}
                          </span>
                        ))}
                        {responsavel.areas?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{responsavel.areas?.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma área</span>
                    )}
                  </StickyTableCell>
                  <StickyTableCell>{responsavel.nmCargo}</StickyTableCell>
                  <StickyTableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      responsavel.flAtivo === 'S'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(responsavel.flAtivo)}
                    </span>
                  </StickyTableCell>
                  <StickyTableCell className="w-36">{formatCPF(responsavel.nrCpf)}</StickyTableCell>
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canAtualizarResponsavel &&
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(responsavel)}
                        >
                          <PencilSimpleIcon className="h-4 w-4"/>
                        </Button>
                      }
                      {canDeletarResponsavel &&
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(responsavel)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4"/>
                        </Button>
                      }
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              ))
            )}
          </StickyTableBody>
        </StickyTable>
      </div>

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
