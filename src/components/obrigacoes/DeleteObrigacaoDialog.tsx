'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { useState } from 'react';
import obrigacaoClient from '@/api/obrigacao/client';

export function DeleteObrigacaoDialog() {
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    setObrigacoes,
  } = useObrigacoes();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!obrigacaoToDelete) return;

    setLoading(true);
    try {
      await obrigacaoClient.deletar(obrigacaoToDelete.idSolicitacao);
      
      setObrigacoes((prev) =>
        prev.filter((o) => o.idSolicitacao !== obrigacaoToDelete.idSolicitacao)
      );

      handleClose();
    } catch (error) {
      console.error('Erro ao excluir obrigação:', error);
    } finally {
      setLoading(false);
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
      confirmText={loading ? 'Excluindo...' : 'Excluir'}
      cancelText="Cancelar"
      onConfirm={handleDelete}
      variant="destructive"
    />
  );
}
