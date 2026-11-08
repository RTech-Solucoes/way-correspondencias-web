'use client';

import { ShieldCheck } from 'lucide-react';
import type { ObrigacaoConclusaoResponse } from '@/api/obrigacao/types';
import { formatDateBr, formatDateTimeBr } from '@/utils/utils';

interface ConclusaoAdministrativaInfoProps {
  conclusao: ObrigacaoConclusaoResponse;
}

const Campo = ({ label, valor }: { label: string; valor?: string | null }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800">{valor || '-'}</span>
  </div>
);

/** Registro de auditoria da conclusão administrativa, exibido no histórico da obrigação. */
export function ConclusaoAdministrativaInfo({ conclusao }: ConclusaoAdministrativaInfoProps) {
  return (
    <div className="border-b border-gray-100 px-8 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-800">Conclusão registrada pelo fluxo {conclusao.dsFluxoConclusao.toLowerCase()}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            conclusao.concluidaEmAtraso ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {conclusao.concluidaEmAtraso ? 'Concluída em atraso' : 'Concluída no prazo'}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Campo label="Data da conclusão" valor={formatDateBr(conclusao.dtConclusao)} />
        <Campo
          label="Data limite original"
          valor={conclusao.dtLimiteOriginal ? formatDateBr(conclusao.dtLimiteOriginal) : 'Sem data limite'}
        />
        <Campo label="Responsável" valor={conclusao.nmResponsavel} />
        <Campo label="Registrado em" valor={formatDateTimeBr(conclusao.dtAcao)} />
        {conclusao.nmStatusAnterior && <Campo label="Status anterior" valor={conclusao.nmStatusAnterior} />}
      </div>
    </div>
  );
}
