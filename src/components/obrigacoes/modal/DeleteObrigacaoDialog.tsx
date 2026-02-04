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
  } = useObrigacoesUI();
  
  const { mutateAsync: deleteObrigacao, isPending } = useDeleteObrigacao();

  const handleDelete = async () => {
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

  return (
    <ConfirmationDialog
      open={showDeleteDialog}
      onOpenChange={handleClose}
      title="Excluir Obrigação"
      description={`Tem certeza que deseja excluir esta obrigação?`}
      confirmText={isPending ? 'Excluindo...' : 'Excluir'}
      cancelText="Cancelar"
      onConfirm={handleDelete}
      variant="destructive"
    />
  );
}
