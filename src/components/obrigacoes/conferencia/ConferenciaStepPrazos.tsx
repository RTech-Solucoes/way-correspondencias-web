'use client';

import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { normalizeDate } from './utils';
import { ConferenciaInfoRow } from './ConferenciaInfoRow';

interface ConferenciaStepPrazosProps {
  obrigacao: ObrigacaoDetalheResponse['obrigacao'];
}

export function ConferenciaStepPrazos({ obrigacao }: ConferenciaStepPrazosProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="px-8 py-6">
        <h2 className="text-lg font-semibold text-gray-900">Prazos</h2>
        <p className="text-sm text-gray-500">Controle de datas planejadas e realizadas.</p>
      </div>
      <div className="divide-y divide-gray-100">
        <ConferenciaInfoRow label="Data de início" value={normalizeDate(obrigacao.dtInicio)} />
        <ConferenciaInfoRow label="Data de término" value={normalizeDate(obrigacao.dtTermino)} />
        <ConferenciaInfoRow label="Data limite" value={normalizeDate(obrigacao.dtLimite)} />
        <ConferenciaInfoRow label="Data de conclusão" value={normalizeDate(obrigacao.dtConclusaoTramitacao)} />
        <ConferenciaInfoRow
          label="Duração"
          border={false}
          value={
            obrigacao.nrDuracaoDias
              ? `${obrigacao.nrDuracaoDias} dia${obrigacao.nrDuracaoDias > 1 ? 's' : ''}`
              : '-'
          }
        />
      </div>
    </div>
  );
}

