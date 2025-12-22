'use client';

import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { cn, formatDateTimeBr } from '@/utils/utils';

interface PrazoStatusPillProps {
  idStatusAtual?: number;
  prazos?: SolicitacaoPrazoResponse[];
}

export function PrazoStatusPill({ idStatusAtual, prazos = [] }: PrazoStatusPillProps) {
  const prazoAtual = useMemo(() => {
    if (!idStatusAtual || !prazos.length) return null;
    return prazos.find((p) => Number(p.idStatusSolicitacao) === Number(idStatusAtual));
  }, [idStatusAtual, prazos]);

  const isVencido = useMemo(() => {
    if (!prazoAtual?.dtPrazoLimite || (prazoAtual?.nrPrazoInterno ?? 0) <= 0) return false;
    return new Date() > new Date(prazoAtual.dtPrazoLimite);
  }, [prazoAtual]);

  if (!prazoAtual?.dtPrazoLimite || (prazoAtual?.nrPrazoInterno ?? 0) <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm border transition-all',
        isVencido
          ? 'bg-red-50 text-red-700 border-red-100 shadow-red-100/50'
          : 'bg-green-50 text-green-700 border-green-100 shadow-green-100/50'
      )}
    >
      <Clock className={cn('h-4 w-4', isVencido ? 'text-red-600' : 'text-green-600')} />
      <span>
        Prazo de resposta: <span className="font-bold">{formatDateTimeBr(prazoAtual.dtPrazoLimite)}</span>
      </span>
    </div>
  );
}

