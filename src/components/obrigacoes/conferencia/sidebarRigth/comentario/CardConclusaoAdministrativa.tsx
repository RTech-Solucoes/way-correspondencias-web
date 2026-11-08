'use client';

import { ShieldCheck } from 'lucide-react';
import type { ObrigacaoConclusaoResponse } from '@/api/obrigacao/types';
import { formatDateTimeBr } from '@/utils/utils';
import {
  TITULO_CONCLUSAO_HISTORICO,
  getDetalhesConclusaoHistorico,
  getResumoConclusaoHistorico,
} from '@/components/obrigacoes/conclusao/conclusao-historico';

interface CardConclusaoAdministrativaProps {
  conclusao: ObrigacaoConclusaoResponse;
}

/** Registro da conclusão administrativa no histórico. Vem da auditoria: não pode ser respondido nem excluído. */
export function CardConclusaoAdministrativa({ conclusao }: CardConclusaoAdministrativaProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-gray-900">{conclusao.nmResponsavel || 'Usuário'}</span>
        <span className="shrink-0 text-xs text-gray-400">{formatDateTimeBr(conclusao.dtAcao)}</span>
      </div>

      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
        <ShieldCheck className="h-3.5 w-3.5" />
        {TITULO_CONCLUSAO_HISTORICO}
      </div>

      <p className="mt-2 text-sm text-black">{getResumoConclusaoHistorico(conclusao)}</p>

      <dl className="mt-2 space-y-1 text-xs text-gray-600">
        {getDetalhesConclusaoHistorico(conclusao).map(({ rotulo, valor }) => (
          <div key={rotulo} className="break-words" style={{ overflowWrap: 'anywhere' }}>
            <dt className="inline font-semibold">{rotulo}: </dt>
            <dd className="inline whitespace-pre-wrap">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
