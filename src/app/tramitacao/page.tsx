'use client';

import React, { useEffect } from 'react';
import {Pagination} from '@/components/ui/pagination';
import useTramitacao from '@/context/tramitacao/TramitacaoContext';
import HeaderTramitacao from '@/components/tramitacao/HeaderTramitacao';
import SearchTramitacao from "@/components/tramitacao/SearchTramitacao";
import TableTramitacao from "@/components/tramitacao/TableTramitacao";
import FilterModalTramitacao from "@/components/tramitacao/FilterModalTramitacao";

export default function TramitacaoPage() {
  const {
    tramitacoes,
    loading,
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    filters,
    setFilters,
    hasActiveFilters,
    handleSort,
    applyFilters,
    clearFilters,
    loadTramitacoes
  } = useTramitacao();

  useEffect(() => {
    loadTramitacoes();
  }, []);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <HeaderTramitacao />

        <SearchTramitacao
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
        />
      </div>

      <TableTramitacao
        tramitacoes={tramitacoes}
        handleSort={handleSort}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={10}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {showFilterModal && (
        <FilterModalTramitacao
          applyFilters={applyFilters}
          showFilterModal={showFilterModal}
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
        />
      )}
    </div>
  );
}