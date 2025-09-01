'use client';

import { useState, useEffect } from 'react';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { tramitacoesClient } from '@/api/tramitacoes/client';
import { AreaResponse } from '@/api/areas/types';
import { SpinnerIcon, CaretRightIcon } from '@phosphor-icons/react';
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
        setTramitacoes(response.reverse());
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
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
        className="relative w-full overflow-y-hidden overflow-x-auto max-w-full"
      >
        <div
          className="flex gap-12 pb-2 w-max min-h-full"
        >
          {tramitacoes.map((tramitacao, index) => (
            <div
              key={tramitacao.idTramitacao}
              className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
              style={{
                minWidth: '280px',
                width: '280px',
                flexShrink: 0
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-primary">
                    {index === 0 ? tramitacao.areaOrigem.nmArea : tramitacao.areaDestino.nmArea}
                  </span>
                  {index !== 0 && <CaretRightIcon className="absolute h-8 w-8 text-primary -left-10 top-1/2 -translate-y-1/2" />}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Código:</span> {index === 0 ? tramitacao.areaOrigem.cdArea : tramitacao.areaDestino.cdArea}
                </div>

                {tramitacao.dsObservacao && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Observação:</span>
                    <p className="mt-1 text-gray-700">{tramitacao.dsObservacao}</p>
                  </div>
                )}

                {tramitacao.tramitacaoAcao && tramitacao.tramitacaoAcao.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Responsável:</span>
                    <p className="text-gray-700">{tramitacao.tramitacaoAcao[0].responsavelArea.responsavel.nmResponsavel}</p>
                    <p className="text-gray-500">
                      {formatDate(tramitacao.tramitacaoAcao[0].dtCriacao)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
