'use client';

import { Suspense } from 'react';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { SolicitacoesHeader } from '@/components/solicitacoes/content/SolicitacoesHeader';
import { SolicitacoesSearch } from '@/components/solicitacoes/content/SolicitacoesSearch';
import { SolicitacoesTable } from '@/components/solicitacoes/content/SolicitacoesTable';
import SolicitacaoModal from '@/components/solicitacoes/SolicitacaoModal';
import DetalhesSolicitacaoModal from '@/components/solicitacoes/DetalhesSolicitacaoModal';
import HistoricoRespostasModal from '@/components/solicitacoes/HistoricoRespostasModal';
import FilterModal from '@/components/solicitacoes/FilterModal';
import { useSolicitacoes } from '@/components/solicitacoes/hooks/use-solicitacoes';
import { PagedResponse } from '@/api/solicitacoes/types';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { toast } from 'sonner';

interface SolicitacoesContentProps {
  initialData?: PagedResponse<CorrespondenciaResponse> | null;
}

export function SolicitacoesContent({ initialData }: SolicitacoesContentProps) {
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
    detalhesAnexos,

    // Modal Tramitação
    showTramitacaoModal,
    tramitacaoSolicitacaoId,

    // Modal Delete
    showDeleteDialog,
    setShowDeleteDialog,
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
    onSolicitacaoSave,
    handleOpenCreateSolicitacao,
    handleCloseSolicitacaoModal,
    handleTramitacoes,
    handleCloseTramitacaoModal,
    openDetalhes,
    handleCloseDetalhesModal,
    enviarDevolutiva,

    // Status helpers
    getStatusBadgeVariant,
    getStatusBadgeBg,
    getStatusText,

    // Helpers
    getJoinedNmAreas,
  } = useSolicitacoes({ initialData });

  const abrirEmailOriginal = () => {
    toast.message('Abrir e-mail original (implemente a navegação/URL).');
  };

  const abrirHistorico = () => {
    toast.message('Abrir histórico de respostas (implemente a navegação).');
  };

  return (
    <Suspense fallback={<div />}>
      <div className="flex flex-col min-h-0 flex-1">
        <SolicitacoesHeader
          totalElements={totalElements}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
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

        <SolicitacoesTable
          solicitacoes={sortedSolicitacoes}
          loading={loading}
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
            anexos={detalhesAnexos ?? []}
            statusLabel={getStatusText(
              detalhesCorrespondencia?.statusSolicitacao?.nmStatus?.toString() || ''
            )}
            onAbrirEmailOriginal={abrirEmailOriginal}
            onHistoricoRespostas={abrirHistorico}
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
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          title="Excluir Solicitação"
          description={`Tem certeza que deseja excluir a solicitação "${solicitacaoToDelete?.dsAssunto}"? Esta ação não pode ser desfeita.`}
        />
      </div>
    </Suspense>
  );
}
