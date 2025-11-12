'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import type { ObrigacaoDetalheResponse, ObrigacaoResumoResponse } from '@/api/obrigacao/types';
import obrigacaoClient from '@/api/obrigacao/client';
import { ConferenciaInfoRow } from './ConferenciaInfoRow';
import type { ReactNode } from 'react';

interface ConferenciaStepVinculosProps {
  obrigacao: ObrigacaoDetalheResponse['obrigacao'];
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

export function ConferenciaStepVinculos({ obrigacao }: ConferenciaStepVinculosProps) {
  const [obrigacoesCondicionadas, setObrigacoesCondicionadas] = useState<ObrigacaoResumoResponse[]>([]);
  const [loadingCondicionadas, setLoadingCondicionadas] = useState(true);

  useEffect(() => {
    const carregarObrigacoesCondicionadas = async () => {
      if (!obrigacao.idSolicitacao) {
        setLoadingCondicionadas(false);
        return;
      }

      try {
        const response = await obrigacaoClient.buscarObrigacoesRelacionadas(obrigacao.idSolicitacao);
        setObrigacoesCondicionadas(response.obrigacoesCondicionadas || []);
      } catch (error) {
        console.error('Erro ao carregar obrigações condicionadas:', error);
        setObrigacoesCondicionadas([]);
      } finally {
        setLoadingCondicionadas(false);
      }
    };

    carregarObrigacoesCondicionadas();
  }, [obrigacao.idSolicitacao]);

  const handleObrigacaoClick = (idSolicitacao: number) => {
    window.open(`/obrigacao/${idSolicitacao}/conferencia`, '_blank', 'noopener,noreferrer');
  };

  const handleSolicitacaoClick = (idSolicitacao: number) => {
    window.open(`/solicitacoes?idSolicitacao=${idSolicitacao}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="px-8 py-6">
        <h2 className="text-lg font-semibold text-gray-900">Vínculos</h2>
        <p className="text-sm text-gray-500">Relacionamentos da obrigação com outros registros.</p>
      </div>
      <div className="divide-y divide-gray-100">
        <InfoGridRow
          items={[
            {
              label: 'Obrigação recusada pelo Verificador ou ANTT',
              value:
                obrigacao.obrigacaoRecusada?.cdIdentificacao && obrigacao.obrigacaoRecusada?.idSolicitacao ? (
                  <ObrigacaoCard
                    cdIdentificacao={obrigacao.obrigacaoRecusada.cdIdentificacao}
                    onClick={() => handleObrigacaoClick(obrigacao.obrigacaoRecusada!.idSolicitacao)}
                  />
                ) : (
                  '-'
                ),
            },            {
              label: 'Vincular correspondência',
              value:
                obrigacao.correspondencia?.cdIdentificacao && obrigacao.correspondencia?.idSolicitacao ? (
                  <ObrigacaoCard
                    cdIdentificacao={obrigacao.correspondencia.cdIdentificacao}
                    onClick={() => handleSolicitacaoClick(obrigacao.correspondencia!.idSolicitacao)}
                  />
                ) : (
                  '-'
                ),
            },
          ]}
        />

        <InfoGridRow
          items={[
            { label: 'Agência reguladora (ANTT)', value: obrigacao.dsAntt?.trim() || '-' },
            { label: 'TAC', value: obrigacao.dsTac?.trim() || '-' },
          ]}
        />

        <InfoGridRow
          items={[
            { label: 'Outras informações', value: obrigacao.dsProtocoloExterno?.trim() || '-' },
          ]}
        />

        <ConferenciaInfoRow
          label="Obrigações condicionadas"
          border={false}
          value={
            loadingCondicionadas ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">Carregando...</span>
              </div>
            ) : obrigacoesCondicionadas.length === 0 ? (
              <span className="text-sm text-gray-400">Nenhuma obrigação condicionada vinculada.</span>
            ) : (
              <div className="flex flex-wrap gap-3">
                {obrigacoesCondicionadas.map((obrigacaoCond) => (
                  <ObrigacaoCard
                    key={obrigacaoCond.idSolicitacao}
                    cdIdentificacao={obrigacaoCond.cdIdentificacao}
                    onClick={() => handleObrigacaoClick(obrigacaoCond.idSolicitacao)}
                  />
                ))}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}

