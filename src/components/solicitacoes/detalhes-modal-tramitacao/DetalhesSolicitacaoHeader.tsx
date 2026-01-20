'use client';

import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClockIcon } from '@phosphor-icons/react';

type DetalhesSolicitacaoHeaderProps = {
  identificador: string;
  criadorLine: string;
  statusText: string;
  prazoLine: string;
  isPrazoVencido: boolean;
};

export function DetalhesSolicitacaoHeader({
  identificador,
  criadorLine,
  statusText,
  prazoLine,
  isPrazoVencido,
}: DetalhesSolicitacaoHeaderProps) {
  return (
    <div className="px-6 pt-6">
      <DialogHeader className="p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <DialogTitle className="text-[20px] font-semibold">
              Solicitação {identificador || ''}
            </DialogTitle>

            <div className="mt-1 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{`Criado em: ${criadorLine}`}</div>
              <span className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-3 py-1 text-xs font-medium">
                {statusText}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4" />
              <span className="text-muted-foreground">Prazo para resposta:</span>
              <span className={`font-medium ${isPrazoVencido && prazoLine !== '—' ? 'text-red-600' : ''}`}>
                {prazoLine}
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>
    </div>
  );
}
