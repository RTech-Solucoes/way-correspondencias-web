'use client';

import { Suspense } from 'react';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { SolicitacoesHeader } from '@/components/solicitacoes/content/SolicitacoesHeader';
import { SolicitacoesSearch } from '@/components/solicitacoes/content/SolicitacoesSearch';
import { SolicitacoesSelectionBar } from '@/components/solicitacoes/content/SolicitacoesSelectionBar';
import { SolicitacoesTable } from '@/components/solicitacoes/content/SolicitacoesTable';
import SolicitacaoModal from '@/components/solicitacoes/editar-modal/SolicitacaoModal';
import DetalhesSolicitacaoModal from '@/components/solicitacoes/detalhes-modal-tramitacao/DetalhesSolicitacaoModal';
import HistoricoRespostasModal from '@/components/solicitacoes/HistoricoRespostasModal';
import FilterModal from '@/components/solicitacoes/FilterModal';
import { useSolicitacoes } from '@/components/solicitacoes/hooks/use-solicitacoes';
import { CorrespondenciaFiltroRequest } from '@/components/solicitacoes/hooks/use-solicitacoes-filters';

interface SolicitacoesContentProps {
  defaultFilters?: Partial<CorrespondenciaFiltroRequest>;
}

export function SolicitacoesContent({ defaultFilters }: SolicitacoesContentProps) {
  const {
    // Dados principais
    sortedSolicitacoes,
    totalPages,
    totalElements,

    // Dados auxiliares
    responsaveis,
    temas,
    areas,
    statuses,

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
    applyFilters,
    clearFilters,
    filtrosAplicados,
    exportFilterParams,

    // Modal Solicitação
    selectedSolicitacao,
    showSolicitacaoModal,

    // Modal Filtros
    showFilterModal,
    setShowFilterModal,

    // Modal Detalhes
    showDetalhesModal,
    detalhesCorrespondencia,

    // Modal Tramitação
    showTramitacaoModal,
    tramitacaoSolicitacaoId,

    // Modal Delete
    showDeleteDialog,
    solicitacaoToDelete,

    // Permissões
    canInserirSolicitacao,
    canAtualizarSolicitacao,
    canDeletarSolicitacao,

    // Ordenação
    sortField,
    sortDirection,

    // Handlers
    loadSolicitacoes,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    confirmDeleteVarias,
    onSolicitacaoSave,
    handleOpenCreateSolicitacao,
    handleCloseSolicitacaoModal,
    handleTramitacoes,
    handleCloseTramitacaoModal,
    openDetalhes,
    handleCloseDetalhesModal,
    enviarDevolutiva,

    // Seleção
    selectedCount,
    allSelected,
    someSelected,
    toggleSelect,
    toggleSelectAll,
    isSelected,
    handleDeleteSelected,
    closeDeleteDialog,
    isDeletingBulk,
    isBulkDeletePending,
    clearSelection,

    // Status helpers
    getStatusBadgeVariant,
    getStatusBadgeBg,
    getStatusText,

    // Helpers
    getJoinedNmAreas,
  } = useSolicitacoes({ defaultFilters });


  return (
    <Suspense fallback={<div />}>
      <div className="flex flex-col min-h-0 flex-1">
        <SolicitacoesHeader
          totalElements={totalElements}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading && sortedSolicitacoes.length === 0}
          onRefresh={loadSolicitacoes}
          onPageChange={setCurrentPage}
        />

        <SolicitacoesSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
          canInserirSolicitacao={!!canInserirSolicitacao}
          onCriarSolicitacao={handleOpenCreateSolicitacao}
          exportFilterParams={exportFilterParams}
          getStatusText={getStatusText}
        />

        <FiltrosAplicados
          filters={filtrosAplicados}
          showClearAll={false}
          className="mb-4"
        />

        <SolicitacoesSelectionBar
          selectedCount={selectedCount}
          canDeletarSolicitacao={!!canDeletarSolicitacao}
          onClearSelection={clearSelection}
          onDeleteSelected={handleDeleteSelected}
          isDeleting={isDeletingBulk}
          className="mb-4"
        />

        <SolicitacoesTable
          solicitacoes={sortedSolicitacoes}
          loading={loading && sortedSolicitacoes.length === 0}
          sortField={sortField}
          sortDirection={sortDirection}
          canAtualizarSolicitacao={!!canAtualizarSolicitacao}
          canDeletarSolicitacao={!!canDeletarSolicitacao}
          handleSort={handleSort}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleTramitacoes={handleTramitacoes}
          openDetalhes={openDetalhes}
          getStatusBadgeVariant={getStatusBadgeVariant}
          getStatusBadgeBg={getStatusBadgeBg}
          getStatusText={getStatusText}
          getJoinedNmAreas={getJoinedNmAreas}
          allSelected={allSelected}
          someSelected={someSelected}
          isSelected={isSelected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
        />

        <FilterModal
          open={showFilterModal}
          onOpenChange={setShowFilterModal}
          filters={filters}
          setFilters={setFilters}
          temas={temas}
          areas={areas}
          statuses={statuses}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {showSolicitacaoModal && (
          <SolicitacaoModal
            correspondencia={selectedSolicitacao}
            open={showSolicitacaoModal}
            onClose={handleCloseSolicitacaoModal}
            onSave={onSolicitacaoSave}
            responsaveis={responsaveis}
            temas={temas}
          />
        )}

        {showDetalhesModal && detalhesCorrespondencia && (
          <DetalhesSolicitacaoModal
            open={showDetalhesModal}
            onClose={handleCloseDetalhesModal}
            correspondencia={detalhesCorrespondencia}
            statusLabel={getStatusText(
              detalhesCorrespondencia?.statusSolicitacao?.nmStatus?.toString() || ''
            )}
            onEnviarDevolutiva={enviarDevolutiva}
          />
        )}

        <HistoricoRespostasModal
          idSolicitacao={tramitacaoSolicitacaoId}
          open={showTramitacaoModal}
          onClose={handleCloseTramitacaoModal}
          title="Histórico de Tramitações"
          loadingText="Carregando tramitações..."
          emptyText="Nenhuma tramitação encontrada para esta solicitação."
        />

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
          onConfirm={isBulkDeletePending ? confirmDeleteVarias : confirmDelete}
          title={isBulkDeletePending ? 'Excluir Solicitações' : 'Excluir Solicitação'}
          description={
            isBulkDeletePending
              ? `Tem certeza que deseja excluir ${selectedCount} solicitação(ões) selecionada(s)? Esta ação não pode ser desfeita.`
              : `Tem certeza que deseja excluir a solicitação "${solicitacaoToDelete?.dsAssunto}"? Esta ação não pode ser desfeita.`
          }
          loading={isDeletingBulk}
          variant="destructive"
          confirmText="Excluir"
        />
      </div>
    </Suspense>
  );
}
