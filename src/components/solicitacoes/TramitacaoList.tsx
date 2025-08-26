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
    <div className="space-y-3">
      <h5 className="font-semibold text-gray-900 mb-3">Histórico de Tramitações</h5>
      <div className="space-y-2">
        {tramitacoes.map((tramitacao) => (
          <div 
            key={tramitacao.idTramitacao}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-blue-600">
                  {getAreaName(tramitacao.idAreaOrigem)}
                </span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-green-600">
                  {getAreaName(tramitacao.idAreaDestino)}
                </span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                ID: {tramitacao.idTramitacao}
              </span>
            </div>
            {tramitacao.dsObservacao && (
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Observação:</span> {tramitacao.dsObservacao}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
