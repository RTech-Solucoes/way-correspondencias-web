'use client';

import React, {useCallback, useEffect} from 'react';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import {Pagination} from '@/components/ui/pagination';
import {useAreas} from '@/context/areas/AreasContext';
import {areasClient} from '@/api/areas/client';
import {AreaFilterParams} from '@/api/areas/types';
import {toast} from 'sonner';
import {useDebounce} from '@/hooks/use-debounce';
import SearchArea from "@/components/areas/SearchArea";
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
    showDeleteDialog,
    setShowDeleteDialog,
    areaToDelete,
    setAreaToDelete,
    hasActiveFilters,
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

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.codigo) filterParts.push(activeFilters.codigo);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);

      const params: AreaFilterParams = {
        filtro: filterParts.join(' ') || undefined,
        page: currentPage,
        size: 10,
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
  }, [currentPage, activeFilters, debouncedSearchQuery, setLoading, setAreas, setTotalPages, setTotalElements]);

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

  const onAreaSave = () => {
    handleAreaSaved();
    loadAreas();
  };

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
              {areas?.length} {areas?.length > 1 ? "áreas" : "área"}
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