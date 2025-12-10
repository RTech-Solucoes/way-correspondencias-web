import { DashboardListSummary, ObrigacaoAreaTemaDTO } from '@/api/dashboard/type';
import { TipoEnum } from '@/api/tipos/types';
import { formatDateTimeBr } from '@/utils/utils';

interface RecentSummaryProps {
  listSummary: (DashboardListSummary | ObrigacaoAreaTemaDTO)[];
  loading: boolean;
  cdTipoFluxo?: TipoEnum;
}

export default function RecentSummary({ listSummary, loading, cdTipoFluxo }: RecentSummaryProps) {
  return (
    <div className="mt-6 flex flex-col flex-1 min-h-0">
      <h4 className="text-2xl font-semibold leading-none tracking-tight mb-6">
        {cdTipoFluxo === TipoEnum.OBRIGACAO ? 'Obrigações Recentes' : 'Solicitações Recentes'}
      </h4>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Carregando...</div>
            </div>
          ) : listSummary.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhuma tarefa foi realizada recentemente.</div>
          ) : (
            listSummary.map((task, index) => {
              const dtCriacaoFormatada = 'dtCriacaoFormatada' in task ? task.dtCriacaoFormatada : formatDateTimeBr(task.dtCriacao);
              
              return (
                <div key={index} className="flex items-start space-x-3 bg-gray-100 rounded-lg p-4">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="text-sm w-full flex justify-between items-start">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(task as ObrigacaoAreaTemaDTO).areas && (task as ObrigacaoAreaTemaDTO).areas.length > 0 ? (
                          (task as ObrigacaoAreaTemaDTO).areas.map((area, areaIndex) => (
                            <span key={areaIndex} className="flex items-center">
                              {areaIndex > 0 && <span className="text-gray-600 mx-1">•</span>}
                              <span
                                className={
                                  area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA
                                    ? "bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-xs"
                                    : "text-gray-700 text-xs font-semibold"
                                }
                              >
                                {area.nmArea}
                              </span>
                            </span>
                          ))
                        ) : (task as DashboardListSummary).nmArea ? (
                          <span className="font-bold text-base">{(task as DashboardListSummary).nmArea}</span>
                        ) : null}
                      </div>
                      <div className="text-gray-600 mt-1 text-xs flex-shrink-0 ml-2">{dtCriacaoFormatada}</div>
                    </div>
                    <span className="text-gray-600 text-sm">{task.nmTema}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

