'use client';

import React from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

import AreaModal from '@/components/areas/AreaModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Pagination } from '@/components/ui/pagination';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import SearchArea from '@/components/areas/SearchArea';
import TableArea from '@/components/areas/TableArea';
import FilterModalArea from '@/components/areas/FilterModalArea';
import PageTitle from '@/components/ui/page-title';

import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useAreas } from './hooks/use-areas';
import { AreasSelectionBar } from '@/components/areas/AreasSelectionBar';

export function AreaContent() {
  const { canInserirArea, canDeletarArea } = usePermissoes();
  
  const {
    // Dados
    areas,
    totalPages,
    totalElements,
    
    // UI State
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    
    // Filtros
    filters,
    setFilters,
    hasActiveFilters,
    filtrosAplicados,
    applyFilters,
    clearFilters,
    
    // Modais
    selectedArea,
    showAreaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    
    // Seleção
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleDeleteSelected,
    closeDeleteDialog,
    isDeletingBulk,
    isBulkDeletePending,
    
    // Handlers
    loadAreas,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    confirmDeleteVarias,
    onAreaSave,
    handleCloseAreaModal,
    handleOpenCreateArea,
  } = useAreas();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between">
        <PageTitle />

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadAreas()}
            disabled={loading}
          >
            <ArrowClockwiseIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
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
            loading={loading && areas.length === 0}
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
          canInserirArea={canInserirArea}
          onCriarArea={handleOpenCreateArea}
        />
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <AreasSelectionBar
        selectedCount={selectedCount}
        canDeletarArea={!!canDeletarArea}
        onClearSelection={clearSelection}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={isDeletingBulk}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-auto mb-6">
        <TableArea
          areas={areas}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleSort={handleSort}
          loading={loading && areas.length === 0}
          allSelected={allSelected}
          someSelected={someSelected}
          isSelected={isSelected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
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
          onClose={handleCloseAreaModal}
          onSave={onAreaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={isBulkDeletePending ? confirmDeleteVarias : confirmDelete}
        title={isBulkDeletePending ? 'Excluir Áreas' : 'Excluir Área'}
        description={
          isBulkDeletePending
            ? `Tem certeza que deseja excluir ${selectedCount} área(s) selecionada(s)? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita.'
        }
        loading={isDeletingBulk}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
}