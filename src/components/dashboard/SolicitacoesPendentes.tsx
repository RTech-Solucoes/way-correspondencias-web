import { useQuery } from '@tanstack/react-query';
import dashboardClient from '@/api/dashboard/client';
import { SolicitacaoResumoResponse } from '@/types/solicitacoes/types';
import Link from 'next/link';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';

interface SolicitacoesPendentesProps {
  refreshTrigger?: number;
}

export default function SolicitacoesPendentes({ refreshTrigger }: SolicitacoesPendentesProps) {
  const { concessionariaSelecionada } = useConcessionaria();
  const idConcessionaria = concessionariaSelecionada?.idConcessionaria;

  const { data: items = [], isLoading: loading } = useQuery<SolicitacaoResumoResponse[]>({
    queryKey: ['solicitacoesPendentes', idConcessionaria, refreshTrigger],
    queryFn: () => dashboardClient.getSolicitacoesPendentes(),
    enabled: !!idConcessionaria,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, 
  });

  const getAreasLabel = (s: SolicitacaoResumoResponse): string => {
    const nmAreas = s.nmAreas as unknown;
    if (Array.isArray(nmAreas)) {
      return nmAreas.filter(Boolean).join(', ');
    }
    if (typeof nmAreas === 'string') {
      return nmAreas
        .split(',')
        .map((area) => area.trim())
        .filter(Boolean)
        .join(', ');
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full mb-12">
      <div className="flex justify-between items-center mb-3 mt-9">
        <h4 className="text-2xl font-semibold leading-none tracking-tight">
          Solicitações Pendentes
        </h4>
        {items?.length ? (
          <div className="text-xs text-gray-500">{items.length} aguardando resposta</div>
        ) : null}
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="text-sm text-gray-500">Carregando solicitações...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhuma solicitação pendente.</div>
        ) : (
          <div className="divide-y  divide-gray-200 max-h-160 overflow-y-auto pr-1">
            {items.map((s) => (
              <div key={s.idSolicitacao} className="py-4">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-900">
                    {s.dsAssunto || 'Sem assunto informado'}
                  </div>
                  <Link
                    className="text-blue-600 ml-2 text-sm font-semibold hover:underline"
                    href={`/solicitacoes?idSolicitacao=${s.idSolicitacao}`}
                  >
                    Verificar
                  </Link>
                </div>
                <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-2 gap-y-1">
                  <span>{s.cdIdentificacao || '-'}</span>
                  {(() => { const label = getAreasLabel(s); return label ? <span>• {label}</span> : null; })()}
                  {s.nmTema ? (
                    <span>• {s.nmTema}</span>
                  ) : null}
                  {s.nmStatus ? (
                    <span className="text-red-600 font-medium">• {s.nmStatus}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


