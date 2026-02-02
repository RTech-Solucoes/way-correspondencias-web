'use client';

import { PagedResponse, ResponsavelResponse } from '@/api/responsaveis/types';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import { usePermissoes } from "@/context/permissoes/PermissoesContext";
import ResponsavelModal from '@/components/responsaveis/ResponsavelModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import ResponsaveisHeader from '@/components/responsaveis/ResponsaveisHeader';
import ResponsaveisSearch from '@/components/responsaveis/ResponsaveisSearch';
import ResponsaveisTable from '@/components/responsaveis/ResponsaveisTable';
import ResponsaveisFilterDialog from '@/components/responsaveis/ResponsaveisFilterDialog';
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
    setShowDeleteDialog,
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
  } = useResponsaveis();

  const { canInserirResponsavel } = usePermissoes();

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
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Responsável"
        description={`Tem certeza que deseja excluir o responsável "${responsavelToDelete?.nmResponsavel}"? Esta ação não pode ser desfeita.`}
      />

      <ConfirmationDialog
        open={showGerarSenhaDialog}
        onOpenChange={(open) => {
          setShowGerarSenhaDialog(open);
          if (!open) {
            setResponsavelParaGerarSenha(null);
          }
        }}
        onConfirm={confirmGerarSenha}
        title="Gerar Senha de Acesso"
        description={`Deseja realmente enviar a senha de acesso ao cliente do responsável "${responsavelParaGerarSenha?.nmResponsavel}"? A senha será gerada e enviada por email.`}
        confirmText="Sim, gerar e enviar"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  );
}
