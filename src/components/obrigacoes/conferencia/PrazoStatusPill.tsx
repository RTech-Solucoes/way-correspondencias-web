'use client';

import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { cn } from '@/utils/utils';

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
    if (!prazoAtual?.dtPrazoLimite) return false;
    return new Date() > new Date(prazoAtual.dtPrazoLimite);
  }, [prazoAtual]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} às ${time}`;
  };

  if (!prazoAtual?.dtPrazoLimite) return null;

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
        Prazo de resposta: <span className="font-bold">{formatDateTime(prazoAtual.dtPrazoLimite)}</span>
      </span>
    </div>
  );
}

