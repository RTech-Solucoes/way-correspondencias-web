'use client';

import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { ReactNode } from 'react';
import type { ObrigacaoStatusStyle } from '@/utils/obrigacoes/status';
import { getCriticidadeBadgeClasses } from './utils';
import { ConferenciaInfoRow } from './ConferenciaInfoRow';
import { TipoEnum } from '@/api/tipos/types';

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

const ObrigacaoCard = ({
  cdIdentificacao,
  onClick,
}: {
  cdIdentificacao: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
  >
    <span>{cdIdentificacao}</span>
    <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
  </button>
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
            { 
              label: 'Classificação', 
              value: obrigacao.tipoClassificacao?.dsTipo || '-'
            },
            { 
              label: 'Natureza', 
              value: obrigacao.tipoNatureza?.dsTipo || '-' 
            },
          ]}
        />
        {obrigacao.tipoClassificacao?.cdTipo === TipoEnum.CONDICIONADA && 
         obrigacao.obrigacaoPrincipal?.cdIdentificacao && 
         obrigacao.obrigacaoPrincipal?.idSolicitacao && (
          <ConferenciaInfoRow
            label="Obrigação Principal"
            value={
              <ObrigacaoCard
                cdIdentificacao={obrigacao.obrigacaoPrincipal.cdIdentificacao}
                onClick={() => {
                  window.open(
                    `/obrigacao/${obrigacao.obrigacaoPrincipal!.idSolicitacao}/conferencia`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
              />
            }
          />
        )}
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

