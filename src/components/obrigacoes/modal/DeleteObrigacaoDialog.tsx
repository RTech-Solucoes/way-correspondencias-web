'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useObrigacoesUI } from '@/components/obrigacoes/context/ObrigacoesUIContext';
import { useDeleteObrigacao } from '@/components/obrigacoes/hooks/use-obrigacoes-query';

export function DeleteObrigacaoDialog() {
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    selectedCount,
    isBulkDeletePending,
    isDeletingBulk,
    confirmDeleteVarias,
  } = useObrigacoesUI();
  
  const { mutateAsync: deleteObrigacao, isPending } = useDeleteObrigacao();

  const handleDelete = async () => {
    if (isBulkDeletePending) {
      await confirmDeleteVarias();
      return;
    }

    if (!obrigacaoToDelete?.idSolicitacao) return;

    try {
      await deleteObrigacao(obrigacaoToDelete.idSolicitacao);
      handleClose();
    } catch (error) {
      console.error('Erro ao excluir obrigação:', error);
    }
  };

  const handleClose = () => {
    setShowDeleteDialog(false);
    setObrigacaoToDelete(null);
  };

  const loading = isPending || isDeletingBulk;

  return (
    <ConfirmationDialog
      open={showDeleteDialog}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title={isBulkDeletePending ? 'Excluir Obrigações' : 'Excluir Obrigação'}
      description={
        isBulkDeletePending
          ? `Tem certeza que deseja excluir ${selectedCount} obrigação(ões) selecionada(s)? Esta ação não pode ser desfeita.`
          : 'Tem certeza que deseja excluir esta obrigação?'
      }
      confirmText={loading ? 'Excluindo...' : 'Excluir'}
      cancelText="Cancelar"
      onConfirm={handleDelete}
      variant="destructive"
      loading={loading}
    />
  );
}
