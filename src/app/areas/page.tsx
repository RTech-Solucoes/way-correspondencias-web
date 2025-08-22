'use client';

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowsDownUpIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  BuildingIcon, SpinnerIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AreaResponse, AreaRequest } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';
import AreaModal from '../../components/areas/AreaModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';
import {getStatusText} from "@/utils/utils";
import useAreas from '@/context/areas/AreasContext';

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
    clearFilters
  } = useAreas();

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
        pageSize={50}
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