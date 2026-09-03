'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FiltrosAplicados } from '@/components/ui/applied-filters';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { InfoIcon } from '@phosphor-icons/react';
import ConcessionariaModal from './ConcessionariaModal';
import DesativarConcessionariaModal from './DesativarConcessionariaModal';
import RegistroDesativacao from './RegistroDesativacao';
import ConfiguracaoConcessionariaModal from './ConfiguracaoConcessionariaModal';
import ConcessionariasHeader from './ConcessionariasHeader';
import SearchConcessionarias from './SearchConcessionarias';
import TableConcessionarias from './TableConcessionarias';
import { useConcessionarias } from './hooks/use-concessionarias';

export function ConcessionariasContent() {
  const {
    canInserirConcessionaria,
    canAtualizarConcessionaria,
    canDeletarConcessionaria,
    canConfigurarConcessionaria,
  } = usePermissoes();

  const {
    concessionarias,
    configuracoesById,
    configuracoesLoadingById,
    totalPages,
    totalElements,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    hasActiveFilters,
    filtrosAplicados,
    selectedConcessionaria,
    concessionariaToToggleStatus,
    concessionariaToDesativar,
    concessionariaToConfigure,
    concessionariaRecemCriada,
    showConcessionariaModal,
    showStatusDialog,
    setShowStatusDialog,
    showDesativarModal,
    desativando,
    showConfiguracaoModal,
    showConfigurarAgoraDialog,
    loadConcessionarias,
    handleSort,
    handleEdit,
    handleConfigure,
    handleToggleStatus,
    confirmToggleStatus,
    confirmDesativar,
    handleCloseDesativarModal,
    confirmConfigurarAgora,
    dismissConfigurarAgora,
    promptConfigurarAgora,
    onConcessionariaSave,
    validarCodigoDisponivel,
    clearFilters,
    handleCloseConcessionariaModal,
    handleOpenCreateConcessionaria,
    handleCloseConfiguracaoModal,
  } = useConcessionarias();

  const handleConcessionariaSave = async (
    formData: Parameters<typeof onConcessionariaSave>[0],
  ) => {
    const created = await onConcessionariaSave(formData);
    if (created && canConfigurarConcessionaria) {
      promptConfigurarAgora(created);
    }
  };

  const handleConfigurarAgoraDialogChange = (open: boolean) => {
    if (!open) {
      dismissConfigurarAgora();
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ConcessionariasHeader
        totalElements={totalElements}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading && concessionarias.length === 0}
        onRefresh={loadConcessionarias}
        onPageChange={setCurrentPage}
      />

      <div className="mb-4 flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
        <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" weight="fill" />
        <p>
          <span className="font-medium">Cada concessionária é isolada:</span> possui suas próprias
          áreas, temas, responsáveis, obrigações, solicitações, caixa de entrada de e-mails,
          observações e lembretes. Os dados de uma não aparecem na outra.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <SearchConcessionarias
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          canInserirConcessionaria={canInserirConcessionaria}
          onCriarConcessionaria={handleOpenCreateConcessionaria}
          onFilter={loadConcessionarias}
        />
      </div>

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-auto mb-6">
        <TableConcessionarias
          concessionarias={concessionarias}
          configuracoesById={configuracoesById}
          configuracoesLoadingById={configuracoesLoadingById}
          loading={loading && concessionarias.length === 0}
          canInserirConcessionaria={canInserirConcessionaria}
          canAtualizarConcessionaria={canAtualizarConcessionaria}
          canAlterarStatusConcessionaria={canAtualizarConcessionaria || canDeletarConcessionaria}
          canConfigurarConcessionaria={canConfigurarConcessionaria}
          handleSort={handleSort}
          handleEdit={handleEdit}
          handleConfigure={handleConfigure}
          handleToggleStatus={handleToggleStatus}
          onCriarConcessionaria={handleOpenCreateConcessionaria}
        />
      </div>

      {showConcessionariaModal && (
        <ConcessionariaModal
          concessionaria={selectedConcessionaria}
          open={showConcessionariaModal}
          onClose={handleCloseConcessionariaModal}
          onCodigoDisponivel={validarCodigoDisponivel}
          onSave={handleConcessionariaSave}
        />
      )}

      {showConfiguracaoModal && (
        <ConfiguracaoConcessionariaModal
          concessionaria={concessionariaToConfigure}
          open={showConfiguracaoModal}
          onClose={handleCloseConfiguracaoModal}
        />
      )}

      <DesativarConcessionariaModal
        concessionaria={concessionariaToDesativar}
        open={showDesativarModal}
        saving={desativando}
        onClose={handleCloseDesativarModal}
        onConfirm={confirmDesativar}
      />

      <ConfirmationDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onConfirm={confirmToggleStatus}
        title="Ativar concessionária"
        description={`Deseja ativar a concessionária "${concessionariaToToggleStatus?.nmConcessionaria || ''}"? A configuração e os vínculos dos responsáveis serão reativados automaticamente.`}
        confirmText="Ativar"
      >
        <RegistroDesativacao
          concessionaria={concessionariaToToggleStatus}
          variant="neutral"
          title="Motivo pelo qual foi desativada"
        />
      </ConfirmationDialog>

      {canConfigurarConcessionaria && (
        <ConfirmationDialog
          open={showConfigurarAgoraDialog}
          onOpenChange={handleConfigurarAgoraDialogChange}
          onConfirm={confirmConfigurarAgora}
          title="Configurar agora?"
          description={`A concessionária "${concessionariaRecemCriada?.nmConcessionaria || ''}" foi criada. Deseja configurar e-mail, SMTP e período agora?`}
          confirmText="Configurar agora"
          cancelText="Depois"
        />
      )}
    </div>
  );
}
