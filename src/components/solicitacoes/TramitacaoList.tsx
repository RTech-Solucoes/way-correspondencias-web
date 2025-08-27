'use client';

import { useState, useEffect } from 'react';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { tramitacoesClient } from '@/api/tramitacoes/client';
import { AreaResponse } from '@/api/areas/types';
import { SpinnerIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TramitacaoListProps {
  idSolicitacao: number;
  areas: AreaResponse[];
}

export default function TramitacaoList({ idSolicitacao, areas }: TramitacaoListProps) {
  const [tramitacoes, setTramitacoes] = useState<TramitacaoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTramitacoes = async () => {
      try {
        setLoading(true);
        const response = await tramitacoesClient.listarPorSolicitacao(idSolicitacao);
        setTramitacoes(response);
      } catch (error) {
        console.error('Erro ao carregar tramitações:', error);
        toast.error('Erro ao carregar tramitações');
      } finally {
        setLoading(false);
      }
    };

    if (idSolicitacao) {
      loadTramitacoes();
    }
  }, [idSolicitacao]);

  const getAreaName = (idArea?: number) => {
    if (!idArea) return 'Não informado';
    const area = areas.find(a => a.idArea === idArea);
    return area?.nmArea || `Área ${idArea}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando tramitações...</span>
      </div>
    );
  }

  if (tramitacoes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Nenhuma tramitação encontrada para esta solicitação.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      <h5 className="font-semibold text-gray-900 mb-3">Histórico de Tramitações</h5>
      <div
        className="relative w-full"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%'
        }}
      >
        <div
          className="flex gap-12 pb-2"
          style={{
            width: 'max-content',
            minWidth: '100%'
          }}
        >
          {tramitacoes.map((tramitacao, index) => (
            <div
              key={tramitacao.idTramitacao}
              className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
              style={{
                minWidth: '200px',
                width: '200px',
                flexShrink: 0
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-primary">
                    {getAreaName(index === 0 ? tramitacao.idAreaOrigem : tramitacao.idAreaDestino)}
                  </span>
                  {index !== 0 && <ArrowRightIcon className="absolute h-8 w-8 text-primary -left-10 top-1/2 -translate-y-1/2" />}
                </div>
              </div>
              {tramitacoes[index - 1]?.dsObservacao ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Observação:</span> {tramitacoes[index - 1].dsObservacao}
                  </p>
                </div>
              ) : (
                index === 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      Área inicial
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
