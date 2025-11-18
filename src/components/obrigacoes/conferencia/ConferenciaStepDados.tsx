'use client';

import { Badge } from '@/components/ui/badge';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { ReactNode } from 'react';
import type { ObrigacaoStatusStyle } from '@/utils/obrigacoes/status';
import { getCriticidadeBadgeClasses } from './utils';
import { ConferenciaInfoRow } from './ConferenciaInfoRow';

interface ConferenciaStepDadosProps {
  obrigacao: ObrigacaoDetalheResponse['obrigacao'];
  statusLabel: string;
  statusStyle: ObrigacaoStatusStyle;
}

interface InfoGridItem {
  label: string;
  value: ReactNode;
}

const InfoGridRow = ({ items, border = true }: { items: InfoGridItem[]; border?: boolean }) => (
  <div
    className={`grid gap-8 px-8 py-6 md:grid-cols-2 ${border ? 'border-b border-gray-100' : ''}`}
  >
    {items.map((item) => (
      <div key={item.label} className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</span>
        <div className="text-sm leading-relaxed text-gray-800">{item.value ?? '-'}</div>
      </div>
    ))}
  </div>
);

export function ConferenciaStepDados({ obrigacao, statusLabel, statusStyle }: ConferenciaStepDadosProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Criticidade</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getCriticidadeBadgeClasses(
              obrigacao.tipoCriticidade?.dsTipo,
            )}`}
          >
            {obrigacao.tipoCriticidade?.dsTipo || 'Sem criticidade'}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <div className="px-8 py-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tarefa</span>
            {obrigacao.dsTarefa ? (
              <p className="text-sm leading-relaxed text-gray-700">{obrigacao.dsTarefa}</p>
            ) : (
              <span className="text-sm text-gray-400">Sem descrição para esta obrigação.</span>
            )}
          </div>
        </div>

        <InfoGridRow
          items={[
            { label: 'ID', value: obrigacao.cdIdentificacao },
            {
              label: 'Item',
              value:
                obrigacao.tema?.nmTema
              },
          ]}
        />
        <InfoGridRow
          items={[
            { label: 'Classificação', value: obrigacao.tipoClassificacao?.dsTipo || '-' },
            { label: 'Natureza', value: obrigacao.tipoNatureza?.dsTipo || '-' },
          ]}
        />
        <InfoGridRow
          border={false}
          items={[
            { label: 'Periodicidade', value: obrigacao.tipoPeriodicidade?.dsTipo || '-' },
            {
              label: 'Status',
              value: (
                <Badge
                  className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: statusStyle.backgroundColor,
                    color: statusStyle.textColor,
                  }}
                >
                  <span className="inline-flex h-2 w-2 rounded-full bg-current opacity-75" />
                  {statusLabel}
                </Badge>
              ),
            },
          ]}
        />
        <ConferenciaInfoRow
          label="Observações"
          border={false}
          value={
            obrigacao.dsObservacao?.trim() ? (
              <p className="text-sm leading-relaxed text-gray-700">{obrigacao.dsObservacao.trim()}</p>
            ) : (
              <span className="text-sm text-gray-400">Nenhuma observação registrada.</span>
            )
          }
        />

        {obrigacao.responsavelTecnico && (
        <ConferenciaInfoRow
          label="Responsável Técnico"
          border={false}
            value={obrigacao.responsavelTecnico?.nmResponsavel || '-'}
          />
        )}
        {/*
        <ConferenciaInfoRow
          label="Justificativa de atraso"
          border={false}
          value={
            obrigacao.dsObservacao?.trim() ? (
              <p className="text-sm leading-relaxed text-gray-700">{obrigacao.dsObservacao.trim()}</p>
            ) : (
              <span className="text-sm text-gray-400">Nenhuma justificativa registrada.</span>
            )
          }
        />
        */}
      </div>
    </div>
  );
}

