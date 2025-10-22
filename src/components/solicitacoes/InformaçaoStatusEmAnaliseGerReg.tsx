'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { SolicitacaoDetalheResponse, SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { STATUS_LIST, statusList } from '@/api/status-solicitacao/types';
import { hoursToDaysAndHours } from '@/utils/utils';
import { ResponsavelResponse } from '@/api/responsaveis/types';

interface PrazosConfiguradosSectionProps {
  solicitacao: SolicitacaoDetalheResponse | null;
  statusListPrazos: StatusSolicitacaoResponse[];
  prazosSolicitacaoPorStatus: SolicitacaoPrazoResponse[];
  responsaveis: ResponsavelResponse[];
  isAnaliseGerenteRegulatorio: boolean;
}

export default function InformaçaoStatusEmAnaliseGerReg({
  solicitacao,
  statusListPrazos,
  prazosSolicitacaoPorStatus,
  responsaveis,
  isAnaliseGerenteRegulatorio
}: PrazosConfiguradosSectionProps) {
  const prazosConfigurados = useMemo(() => {
    const statusFiltrados = statusListPrazos.length > 0 
      ? statusListPrazos.map(status => ({
          codigo: status.idStatusSolicitacao,
          nome: status.nmStatus
        })) 
      : STATUS_LIST.map(status => ({
          codigo: status.id,
          nome: status.label
        }));

    const statusOcultos = [
      statusList.PRE_ANALISE.id,
      statusList.VENCIDO_REGULATORIO.id,
      statusList.VENCIDO_AREA_TECNICA.id,
      statusList.ARQUIVADO.id,
    ];

    const opcaoStatusResumo = statusFiltrados.filter(status => 
      !statusOcultos.includes(status.codigo)
    );

    return opcaoStatusResumo
      .map((status) => {
        const prazoFromSolicitacao = prazosSolicitacaoPorStatus.find(
          p => p.idStatusSolicitacao === status.codigo
        )?.nrPrazoInterno;
        const horas = (prazoFromSolicitacao ?? 0);
        return { status, horas };
      })
      .filter(item => (item.horas || 0) > 0)
      .map(({ status, horas }) => (
        <div key={status.codigo} className="flex justify-between items-center p-2 bg-white border rounded-lg shadow-sm">
          <span className="font-medium">{status.nome}</span>
          <span className="text-gray-600">
            {solicitacao?.solicitacao?.flExcepcional === 'S' 
              ? `${horas} horas` 
              : `${hoursToDaysAndHours(horas)} dias`
            }
          </span>
        </div>
      ));
  }, [statusListPrazos, prazosSolicitacaoPorStatus, solicitacao?.solicitacao?.flExcepcional]);

  return (
    <>
      {isAnaliseGerenteRegulatorio && (
        <section className="space-y-3">
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold">Validadores/Assinantes</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <div className="space-y-3">
                {solicitacao?.solicitacoesAssinantes.map(assinante => {
                  const responsavel = responsaveis.find(r => r.idResponsavel === assinante.idResponsavel);
                  return responsavel ? (
                    <div key={assinante.idResponsavel} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{responsavel?.nmResponsavel}</span>
                        <span className="text-xs text-gray-500">{responsavel?.nmPerfil}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-blue-600">
                          {responsavel?.nmCargo || 'Sem cargo'}
                        </span>
                        {responsavel && (
                          <div className="text-xs text-gray-500">
                            {responsavel.dsEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold">Prazos Configurados por Status</Label>
          <div className="mt-2 space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            {prazosConfigurados}
          </div>
        </div>
      </section>
    </>
  );
}
