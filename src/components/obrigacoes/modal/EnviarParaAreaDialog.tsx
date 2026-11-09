'use client';

import { AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ObrigacaoResponse } from '@/api/obrigacao/types';
import { getAvisoStatusEnvioArea } from '@/components/obrigacoes/modal/envio-area';

interface EnviarParaAreaDialogProps {
  obrigacao: ObrigacaoResponse | null;
  enviando: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function EnviarParaAreaDialog({ obrigacao, enviando, onConfirm, onCancel }: EnviarParaAreaDialogProps) {
  const identificacao = obrigacao?.cdIdentificacao ? ` ${obrigacao.cdIdentificacao}` : '';

  return (
    <ConfirmationDialog
      open={!!obrigacao}
      onOpenChange={(aberto) => {
        if (!aberto && !enviando) onCancel();
      }}
      title="Enviar para área"
      description={`Deseja enviar a obrigação${identificacao} para a área?`}
      confirmText="Sim, enviar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      closeOnConfirm={false}
      loading={enviando}
    >
      <div className="flex gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
        <div className="space-y-1">
          <p>
            {getAvisoStatusEnvioArea(
              obrigacao?.statusSolicitacao?.idStatusSolicitacao,
              obrigacao?.statusSolicitacao?.nmStatus,
            )}
          </p>
          <p>Depois de enviada, a obrigação não poderá ser enviada novamente.</p>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
