'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { useState } from 'react';
import obrigacaoContratualClient from '@/api/obrigacao-contratual/client';

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
      await obrigacaoContratualClient.deletar(obrigacaoToDelete.idObrigacaoContratual);
      
      setObrigacoes((prev) =>
        prev.filter((o) => o.idObrigacaoContratual !== obrigacaoToDelete.idObrigacaoContratual)
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
      description={`Tem certeza que deseja excluir a obrigação "${obrigacaoToDelete?.dsTarefa}"? Esta ação não pode ser desfeita.`}
      confirmText={loading ? 'Excluindo...' : 'Excluir'}
      cancelText="Cancelar"
      onConfirm={handleDelete}
      variant="destructive"
    />
  );
}
