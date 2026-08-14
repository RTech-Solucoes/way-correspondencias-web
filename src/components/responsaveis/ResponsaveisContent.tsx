'use client';

import { FiltrosAplicados } from '@/components/ui/applied-filters';
import { usePermissoes } from "@/context/permissoes/PermissoesContext";
import ResponsavelModal from '@/components/responsaveis/ResponsavelModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import ResponsaveisHeader from '@/components/responsaveis/ResponsaveisHeader';
import ResponsaveisSearch from '@/components/responsaveis/ResponsaveisSearch';
import ResponsaveisTable from '@/components/responsaveis/ResponsaveisTable';
import ResponsaveisFilterDialog from '@/components/responsaveis/ResponsaveisFilterDialog';
import { ResponsaveisSelectionBar } from '@/components/responsaveis/ResponsaveisSelectionBar';
import { useResponsaveis } from '@/components/responsaveis/hooks/use-responsaveis';

export function ResponsaveisContent() {
  const {
    responsaveis,
    loading,
    searchQuery,
    setSearchQuery,
    selectedResponsavel,
    showResponsavelModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    responsavelToDelete,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    filters,
    setFilters,
    hasActiveFilters,
    sortField,
    sortDirection,
    handleEdit,
    handleDelete,
    confirmDelete,
    confirmDeleteVarias,
    onResponsavelSave,
    applyFilters,
    clearFilters,
    handleSort,
    handleOpenCreateResponsavel,
    handleCloseResponsavelModal,
    handleGerarSenhaClick,
    confirmGerarSenha,
    gerandoSenha,
    showGerarSenhaDialog,
    setShowGerarSenhaDialog,
    responsavelParaGerarSenha,
    setResponsavelParaGerarSenha,
    ldapEnabled,
    filtrosAplicados,
    loadResponsaveis,
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
  } = useResponsaveis();

  const { canInserirResponsavel, canDeletarResponsavel } = usePermissoes();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ResponsaveisHeader
        totalElements={totalElements}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading && responsaveis.length === 0}
        onRefresh={loadResponsaveis}
        onPageChange={setCurrentPage}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <ResponsaveisSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
          canInserirResponsavel={canInserirResponsavel}
          onCriarResponsavel={handleOpenCreateResponsavel}
        />
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <ResponsaveisSelectionBar
        selectedCount={selectedCount}
        canDeletarResponsavel={!!canDeletarResponsavel}
        onClearSelection={clearSelection}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={isDeletingBulk}
        className="mb-4"
      />

      <ResponsaveisTable
        responsaveis={responsaveis}
        loading={loading && responsaveis.length === 0}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleGerarSenhaClick={handleGerarSenhaClick}
        gerandoSenha={gerandoSenha}
        ldapEnabled={ldapEnabled}
        allSelected={allSelected}
        someSelected={someSelected}
        isSelected={isSelected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
      />

      {showFilterModal && (
        <ResponsaveisFilterDialog
          showFilterModal={showFilterModal}
          setShowFilterModal={setShowFilterModal}
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      )}

      {showResponsavelModal && (
        <ResponsavelModal
          responsavel={selectedResponsavel}
          open={showResponsavelModal}
          onClose={handleCloseResponsavelModal}
          onSave={onResponsavelSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={isBulkDeletePending ? confirmDeleteVarias : confirmDelete}
        title={isBulkDeletePending ? 'Excluir Responsáveis' : 'Excluir Responsável'}
        description={
          isBulkDeletePending
            ? `Tem certeza que deseja excluir ${selectedCount} responsável(is) selecionado(s)? Esta ação não pode ser desfeita.`
            : `Tem certeza que deseja excluir o responsável "${responsavelToDelete?.nmResponsavel}"? Esta ação não pode ser desfeita.`
        }
        loading={isDeletingBulk}
        variant="destructive"
        confirmText="Excluir"
      />

      <ConfirmationDialog
        open={showGerarSenhaDialog}
        onOpenChange={(open) => {
          if (gerandoSenha) return;
          setShowGerarSenhaDialog(open);
          if (!open) {
            setResponsavelParaGerarSenha(null);
          }
        }}
        onConfirm={confirmGerarSenha}
        title="Gerar Senha de Acesso"
        description={`Deseja realmente enviar a senha de acesso para ${responsavelParaGerarSenha?.nmResponsavel ?? 'o responsável'} (${responsavelParaGerarSenha?.dsEmail ?? 'e-mail não informado'})? A senha será gerada e enviada por e-mail.`}
        confirmText="Sim, gerar e enviar"
        cancelText="Cancelar"
        variant="default"
        closeOnConfirm={false}
        loading={gerandoSenha !== null}
      />
    </div>
  );
}
