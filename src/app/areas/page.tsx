'use client';

import React, { useEffect } from 'react';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import {Pagination} from '@/components/ui/pagination';
import useAreas from '@/context/areas/AreasContext';
import HeaderArea from '@/components/areas/HeaderArea';
import SearchArea from "@/components/areas/SearchArea";
import TableArea from "@/components/areas/TableArea";
import FilterModalArea from "@/components/areas/FilterModalArea";

export default function AreasPage() {
  const {
    areas,
    loading,
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
    totalElements,
    filters,
    setFilters,
    showDeleteDialog,
    setShowDeleteDialog,
    hasActiveFilters,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleAreaSave,
    applyFilters,
    clearFilters,
    loadAreas
  } = useAreas();

  // Load data when page mounts
  useEffect(() => {
    loadAreas();
  }, []);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <HeaderArea setSelectedArea={setSelectedArea} setShowAreaModal={setShowAreaModal} />

        <SearchArea
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
        />
      </div>

      <TableArea
        areas={areas}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleSort={handleSort}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={15}
        onPageChange={setCurrentPage}
        loading={loading}
      />

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
          onSave={handleAreaSave}
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