import { useQuery } from '@tanstack/react-query';
import dashboardClient from '@/api/dashboard/client';
import { ObrigacaoPendenteResponse } from '@/api/dashboard/type';
import Link from 'next/link';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';
import { TipoEnum } from '@/api/tipos/types';

interface ObrigacoesPendentesProps {
  refreshTrigger?: number;
}

export default function ObrigacoesPendentes({ refreshTrigger }: ObrigacoesPendentesProps) {
  const { concessionariaSelecionada } = useConcessionaria();
  const idConcessionaria = concessionariaSelecionada?.idConcessionaria;

  const { data: items = [], isLoading: loading } = useQuery<ObrigacaoPendenteResponse[]>({
    queryKey: ['obrigacoesPendentes', idConcessionaria, refreshTrigger],
    queryFn: () => dashboardClient.getObrigacoesPendentes(),
    enabled: !!idConcessionaria,
    staleTime: Infinity, 
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false, 
    refetchOnMount: true, 
  });

  return (
    <div className="flex flex-col h-full mb-12">
      <div className="flex justify-between items-center mb-3 mt-9">
        <h4 className="text-2xl font-semibold leading-none tracking-tight">
          Obrigações Pendentes
        </h4>
        {items?.length ? (
          <div className="text-xs text-gray-500">{items.length} aguardando ação</div>
        ) : null}
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="text-sm text-gray-500">Carregando obrigações...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhuma obrigação pendente.</div>
        ) : (
          <div className="max-h-[260px] overflow-y-auto pr-1">
            {items.map((obrigacao, index) => (
              <div key={obrigacao.idSolicitacao}>
                <div className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900">
                      {obrigacao.tarefa || 'Sem tarefa informada'}
                    </div>
                    <Link
                      className="text-blue-600 ml-2 text-sm font-semibold hover:underline"
                      href={`/obrigacao?idObrigacao=${obrigacao.idSolicitacao}`}
                    >
                      Verificar
                    </Link>
                  </div>
                  <div className="mt-1 text-xs flex flex-wrap gap-x-2 gap-y-1 items-center">
                    <span className="text-gray-600">{obrigacao.cdIdentificacao || '-'}</span>
                    {obrigacao.areas && obrigacao.areas.length > 0 && (
                      <>
                        <span className="text-gray-600">•</span>
                        {obrigacao.areas.map((area, areaIndex) => {
                          const isAtribuida = area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA;
                          return (
                            <span 
                              key={areaIndex}
                              className={
                                isAtribuida 
                                  ? "bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded"
                                  : "text-gray-900 font-semibold"
                              }
                            >
                              {isAtribuida ? '' : '• '}{area.nmArea}
                            </span>
                          );
                        })}
                      </>
                    )}
                    {obrigacao.nmTema ? (
                      <span className="text-gray-600">• {obrigacao.nmTema}</span>
                    ) : null}
                    {obrigacao.nmStatus ? (
                      <span className="text-orange-600 font-medium">• {obrigacao.nmStatus}</span>
                    ) : null}
                  </div>
                </div>
                {index < items.length - 1 && (
                  <div className="border-t border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


