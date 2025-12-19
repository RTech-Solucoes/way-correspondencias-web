'use client';

import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { AreaSolicitacao } from '@/api/solicitacoes/types';
import { useEffect, useMemo, useState } from 'react';
import areasClient from '@/api/areas/client';
import { TipoEnum } from '@/api/tipos/types';

interface VinculoCardProps {
  area?: string | null;
  responsavel?: string | null;
  cargo?: string | null;
}

const VinculoCard = ({ area, responsavel, cargo }: VinculoCardProps) => (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{area || 'Não informado'}</span>
        </div>
        {area && (
        <div className="text-right">
            <span className="text-sm font-medium text-blue-600">
            {responsavel || 'Responsável não informado'}
            </span>
            <div className="text-xs text-gray-500">
            {cargo || 'Cargo não informado'}
            </div>
        </div>
        )}
  </div>
);

type AreaExecutorInfo = {
  idArea: number;
  nmArea: string;
  nmResponsavel?: string | null;
  nmCargos?: string | null;
};

const mapAreaInfo = (area: AreaSolicitacao | null | undefined, areasExecutor: AreaExecutorInfo[]) => {
  if (!area) {
    return { value: 'Sem área atribuída', responsavel: null, cargo: null };
  }
  const info = areasExecutor.find((executor) => executor.idArea === area.idArea);
  return {
    value: area.nmArea,
    responsavel: info?.nmResponsavel ?? null,
    cargo: info?.nmCargos ?? null,
  };
};

interface ConferenciaStepAreasETemasProps {
  obrigacao: ObrigacaoDetalheResponse['obrigacao'];
  areaAtribuida?: AreaSolicitacao | null;
  areasCondicionantes: AreaSolicitacao[];
}

export function ConferenciaStepAreasETemas({ obrigacao, areaAtribuida, areasCondicionantes }: ConferenciaStepAreasETemasProps) {
  const [areasExecutor, setAreasExecutor] = useState<AreaExecutorInfo[]>([]);

  useEffect(() => {
    const carregarAreasExecutor = async () => {
      try {
        const executor = await areasClient.buscarPorExecutorAvancado();
        setAreasExecutor(executor || []);
      } catch (error) {
        console.error('Erro ao carregar informações das áreas:', error);
      }
    };

    carregarAreasExecutor();
  }, []);

  const areaAtribuidaInfo = useMemo(() => mapAreaInfo(areaAtribuida, areasExecutor), [areaAtribuida, areasExecutor]);
  const areasCondicionantesInfo = useMemo(() => {
    if (!areasCondicionantes || areasCondicionantes.length === 0) return [];

    return areasCondicionantes
      .filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE)
      .map((area) => ({
        idArea: area.idArea,
        ...mapAreaInfo(area, areasExecutor),
      }));
  }, [areasCondicionantes, areasExecutor]);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="px-8 py-6">
        <h2 className="text-lg font-semibold text-gray-900">Temas e áreas</h2>
        <p className="text-sm text-gray-500">Relacionamentos da obrigação com temas e responsáveis.</p>
      </div>

      <div className="flex flex-col gap-4 px-8 pb-8">
        <div className="border-t pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tema</span>
            <div className="p-3 border border-gray-200 rounded-lg text-sm mt-2 font-medium text-sm font-medium text-gray-900">
                {obrigacao.tema?.nmTema || 'Não informado'}
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Área atribuída</span>
          <VinculoCard
          area={areaAtribuidaInfo.value}
          responsavel={areaAtribuidaInfo.responsavel}
          cargo={areaAtribuidaInfo.cargo}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Áreas condicionantes</span>
          {areasCondicionantesInfo.length === 0 ? (
            <span className="text-sm text-gray-400">Nenhuma área condicionante vinculada.</span>
          ) : (
            <div className="flex flex-col gap-3">
              {areasCondicionantesInfo.map((area) => (
                <VinculoCard
                  key={area.idArea}
                  area={area.value}
                  responsavel={area.responsavel}
                  cargo={area.cargo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

