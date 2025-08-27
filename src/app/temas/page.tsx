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
  TagIcon,
  SpinnerIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {TemaModal} from '@/components/temas/TemaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';
import {getStatusText} from "@/utils/utils";
import { useTemas } from '@/context/temas/TemasContext';
import { temasClient } from '@/api/temas/client';
import { TemaFilterParams } from '@/api/temas/types';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export default function TemasPage() {
  const {
    temas,
    setTemas,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    selectedTema,
    setSelectedTema,
    showTemaModal,
    setShowTemaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    temaToDelete,
    setTemaToDelete,
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
    handleTemaSave,
    applyFilters,
    clearFilters,
    handleSort,
  } = useTemas();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadTemas = useCallback(async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);

      const params: TemaFilterParams = {
        filtro: filterParts.join(' ') || undefined,
        page: currentPage,
        size: 10,
      };

      const response = await temasClient.buscarPorFiltro(params);
      setTemas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      toast.error("Erro ao carregar temas");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery, setLoading, setTemas, setTotalPages, setTotalElements]);

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  const confirmDelete = async () => {
    if (temaToDelete) {
      try {
        await temasClient.deletar(temaToDelete.idTema);
        toast.success("Tema excluído com sucesso");
        loadTemas();
      } catch {
        toast.error("Erro ao excluir tema");
      } finally {
        setShowDeleteDialog(false);
        setTemaToDelete(null);
      }
    }
  };

  const onTemaSave = () => {
    handleTemaSave();
    loadTemas();
  };

  const sortedTemas = () => {
    const sorted = [...temas];
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

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedTema(null);
            setShowTemaModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Novo Tema
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar temas..."
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
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmTema')}>
                <div className="flex items-center">
                  Nome
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead>Descrição</StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nrPrazo')}>
                <div className="flex items-center">
                  Prazo (horas)
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('tpPrazo')}>
                <div className="flex items-center">
                  Tipo Prazo
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
              <StickyTableHead>Áreas</StickyTableHead>
              <StickyTableHead className="text-right">Ações</StickyTableHead>
            </StickyTableRow>
          </StickyTableHeader>
          <StickyTableBody>
            {loading ? (
              <StickyTableRow>
                <StickyTableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando temas...</span>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : temas?.length === 0 ? (
              <StickyTableRow>
                <StickyTableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <TagIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum tema encontrado</p>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ) : (
              sortedTemas().map((tema) => (
                <StickyTableRow key={tema.idTema}>
                  <StickyTableCell className="font-medium">{tema.nmTema}</StickyTableCell>
                  <StickyTableCell className="max-w-xs truncate" title={tema.dsTema}>
                    {tema.dsTema || '-'}
                  </StickyTableCell>
                  <StickyTableCell>
                    {tema.nrPrazo ? `${tema.nrPrazo} horas` : '-'}
                  </StickyTableCell>
                  <StickyTableCell>
                    {tema.tpPrazo === 'C' ? 'Horas corridas' :
                     tema.tpPrazo === 'U' ? 'Horas úteis' :
                     tema.tpPrazo || '-'}
                  </StickyTableCell>
                  <StickyTableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      tema.flAtivo === 'S' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(tema.flAtivo)}
                    </span>
                  </StickyTableCell>
                  <StickyTableCell>
                    {tema.areas && tema.areas?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tema.areas.slice(0, 2).map((area, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {area.nmArea}
                          </span>
                        ))}
                        {tema.areas?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{tema.areas?.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma área</span>
                    )}
                  </StickyTableCell>
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tema)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tema)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              )))
            }
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
              <DialogTitle>Filtrar Temas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={filters.nome}
                  onChange={(e) => setFilters({...filters, nome: e.target.value})}
                  placeholder="Filtrar por nome"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={filters.descricao}
                  onChange={(e) => setFilters({...filters, descricao: e.target.value})}
                  placeholder="Filtrar por descrição"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
              <Button onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showTemaModal && (
        <TemaModal
          tema={selectedTema}
          open={showTemaModal}
          onClose={() => {
            setShowTemaModal(false);
          }}
          onSave={onTemaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Tema"
        description={`Tem certeza que deseja excluir o tema "${temaToDelete?.nmTema}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}