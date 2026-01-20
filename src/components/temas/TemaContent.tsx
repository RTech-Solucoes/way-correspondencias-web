'use client';

import React from 'react';
import { TemaModal } from '@/components/temas/TemaModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import HeaderTema from '@/components/temas/HeaderTema';
import SearchTema from '@/components/temas/SearchTema';
import TableTema from '@/components/temas/TableTema';
import FilterModalTema from '@/components/temas/FilterModalTema';
import { TemaResponse, PagedResponse } from '@/api/temas/types';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useTemas } from './hooks/use-temas';

interface TemaContentProps {
  initialData?: PagedResponse<TemaResponse>;
}

export function TemaContent({ initialData }: TemaContentProps) {
  const { canInserirTema } = usePermissoes();

  const {
    // Dados
    temas,
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
    selectedTema,
    showTemaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    temaToDelete,

    // Handlers
    loadTemas,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    onTemaSave,
    handleCloseTemaModal,
    handleOpenCreateTema,
  } = useTemas({ initialData });

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <HeaderTema
        totalElements={totalElements}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onRefresh={loadTemas}
        onPageChange={setCurrentPage}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <SearchTema
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
          canInserirTema={canInserirTema}
          onCriarTema={handleOpenCreateTema}
        />
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-auto mb-6">
        <TableTema
          temas={temas}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleSort={handleSort}
          loading={loading}
        />
      </div>

      {showFilterModal && (
        <FilterModalTema
          applyFilters={applyFilters}
          showFilterModal={showFilterModal}
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
        />
      )}

      {showTemaModal && (
        <TemaModal
          tema={selectedTema}
          open={showTemaModal}
          onClose={handleCloseTemaModal}
          onSave={onTemaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Tema"
        description={`Tem certeza que deseja excluir o tema "${temaToDelete?.nmTema || ''}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
