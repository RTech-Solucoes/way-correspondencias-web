'use client';

import React, {useCallback, useEffect} from 'react';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import {Pagination} from '@/components/ui/pagination';
import {useAreas} from '@/context/areas/AreasContext';
import {areasClient} from '@/api/areas/client';
import {AreaFilterParams, AreaRequest} from '@/api/areas/types';
import {toast} from 'sonner';
import {useDebounce} from '@/hooks/use-debounce';
import SearchArea from "@/components/areas/SearchArea";
import {FiltrosAplicados} from '@/components/ui/applied-filters';
import TableArea from "@/components/areas/TableArea";
import FilterModalArea from "@/components/areas/FilterModalArea";
import PageTitle from '@/components/ui/page-title';
import {ArrowClockwiseIcon} from '@phosphor-icons/react';
import {Button} from '@nextui-org/react';

export default function AreasPage() {
  const {
    areas,
    setAreas,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    showAreaModal,
    setShowAreaModal,
    showFilterModal,
    setShowFilterModal,
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
    showDeleteDialog,
    setShowDeleteDialog,
    areaToDelete,
    setAreaToDelete,
    hasActiveFilters,
    sortField,
    sortDirection,
    handleSort,
    handleEdit,
    handleDelete,
    handleAreaSaved,
    applyFilters,
    clearFilters,
  } = useAreas();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);

      const params: AreaFilterParams = {
        filtro: debouncedSearchQuery || undefined,
        cdArea: activeFilters.codigo || undefined,
        nmArea: activeFilters.nome || undefined,
        dsArea: activeFilters.descricao || undefined,
        page: currentPage,
        size: 10,
        sort: sortField ? `${sortField},${sortDirection === 'desc' ? 'desc' : 'asc'}` : undefined,
      };

      const response = await areasClient.buscarPorFiltro(params);
      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery, sortField, sortDirection, setLoading, setAreas, setTotalPages, setTotalElements]);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        await areasClient.deletar(areaToDelete);
        toast.success("Área excluída com sucesso");
        loadAreas();
      } catch {
        toast.error("Erro ao excluir área");
      } finally {
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  const onAreaSave = async (data: AreaRequest) => {
    try {
      if (selectedArea && selectedArea.idArea) {
        await areasClient.atualizar(selectedArea.idArea, data);
        toast.success('Área atualizada com sucesso');
      }
      handleAreaSaved();
      loadAreas();
    } catch {
      toast.error('Erro ao salvar área');
    }
  };

  const filtrosAplicados = [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeFilters.codigo ? [{
      key: 'codigo',
      label: 'Código',
      value: activeFilters.codigo,
      color: 'orange' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, codigo: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.nome ? [{
      key: 'nome',
      label: 'Nome',
      value: activeFilters.nome,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, nome: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : []),
    ...(activeFilters.descricao ? [{
      key: 'descricao',
      label: 'Descrição',
      value: activeFilters.descricao,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeFilters, descricao: '' };
        setActiveFilters(newFilters);
        setFilters(newFilters);
      }
    }] : [])
  ]
  
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between">
        <PageTitle />

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadAreas();
            }}
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {totalElements} {totalElements > 1 ? "áreas" : "área"}
            </span>
          </div>

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

        <SearchArea
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
        />
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-auto mb-6">
        <TableArea
          areas={areas}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleSort={handleSort}
          loading={loading}
        />
      </div>

      {showFilterModal && (
        <FilterModalArea
          applyFilters={applyFilters}
          showFilterModal={showFilterModal}
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
        />
      )}

      {showAreaModal && (
        <AreaModal
          area={selectedArea}
          open={showAreaModal}
          onClose={() => {
            setShowAreaModal(false);
            setSelectedArea(null);
          }}
          onSave={onAreaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Área"
        description="Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita."
      />
    </div>
  );
}