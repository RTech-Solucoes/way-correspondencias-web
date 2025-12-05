import dashboardClient from "@/api/dashboard/client";
import { DashboardListSummary, DashboardOverview } from "@/api/dashboard/type";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import CardHeader from "../card-header";
import { capitalizeWords, getStatusColorVision, renderIcon, getStatusBgColor } from "../functions";
import PaginationTasksStatus from "./PaginationTasksStatus";
import { statusList } from "@/api/status-solicitacao/types";
import SolicitacoesPendentes from "../SolicitacoesPendentes";
import { CategoriaEnum, TipoEnum } from "@/api/tipos/types";
import { getObrigacaoStatusStyle } from "@/utils/obrigacoes/status";

interface TasksStatusBoardProps {
  refreshTrigger?: number;
  cdTipoFluxo?: TipoEnum;
  cdTipoStatus?: TipoEnum[];
  title?: string;
  description?: string;
  showPendentes?: boolean;
  showRecent?: boolean;
}

export default function TasksStatusBoard({ 
  refreshTrigger,
  cdTipoFluxo = TipoEnum.CORRESPONDENCIA,
  cdTipoStatus = [TipoEnum.TODOS, TipoEnum.CORRESPONDENCIA],
  title = "Visão Geral de Solicitações",
  description = "Status de todas as solicitações contratuais",
  showPendentes = true,
  showRecent = true,
}: TasksStatusBoardProps) {
  const [visionGeral, setVisionGeral] = useState<DashboardOverview[]>([]);
  const [listSummary, setListSummary] = useState<DashboardListSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Serializar cdTipoStatus para usar como dependência estável
  const cdTipoStatusKey = useMemo(() => cdTipoStatus.join(','), [cdTipoStatus]);

  const sortVisionGeral = (data: DashboardOverview[]) => {
    const statusOrder = [
      statusList.CONCLUIDO.label,
      statusList.EM_ANALISE_AREA_TECNICA.label,
      statusList.EM_APROVACAO.label,
      statusList.PRE_ANALISE.label,
      statusList.EM_ASSINATURA_DIRETORIA.label,
      statusList.ARQUIVADO.label,
      statusList.EM_CHANCELA.label,
      statusList.VENCIDO_REGULATORIO.label,
      statusList.ANALISE_REGULATORIA.label,
      statusList.VENCIDO_AREA_TECNICA.label,
    ];

    return data.sort((a, b) => {
      const indexA = statusOrder.indexOf(a.nmStatus);
      const indexB = statusOrder.indexOf(b.nmStatus);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  };

  useEffect(() => {
    const getOverview = async () => {
      try {
        const data = await dashboardClient.getOverview({
          cdTipoFluxo,
          nmCategoriaFluxo: CategoriaEnum.FLUXO,
          nmCategoriaStatus: CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO,
          cdTipoStatus,
        });

        const sortedData = sortVisionGeral(data);
        setVisionGeral(sortedData);
      } catch (error) {
        console.error("Erro ao buscar overview:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      }
    };

    const getRecentOverview = async () => {
      try {
        setLoading(true);
        const response = await dashboardClient.getRecentOverview(currentPage, 4);
        setListSummary(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Erro ao buscar overview:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    getRecentOverview();
    getOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, currentPage, cdTipoFluxo, cdTipoStatusKey]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (statusName: string): string => {
    return getStatusColorVision(statusName);
  };

  const getStatusColorStyle = (statusName: string): React.CSSProperties => {
    if (cdTipoFluxo === TipoEnum.OBRIGACAO) {
      const normalizedStatus = statusName.toUpperCase().trim();
      const isStatusEspecificoObrigacao = 
        normalizedStatus.includes('NÃO INICIADO') ||
        normalizedStatus.includes('NAO_INICIADO') ||
        normalizedStatus.includes('PENDENTE') ||
        normalizedStatus.includes('EM ANDAMENTO') ||
        normalizedStatus.includes('EM_ANDAMENTO') ||
        (normalizedStatus.includes('EM VALIDAÇÃO') && normalizedStatus.includes('REGULATÓRIO')) ||
        (normalizedStatus.includes('EM_VALIDACAO') && normalizedStatus.includes('REGULATORIO')) ||
        normalizedStatus.includes('ATRASADA') ||
        normalizedStatus.includes('NÃO APLICÁVEL') ||
        normalizedStatus.includes('NAO_APLICAVEL') ||
        normalizedStatus.includes('SUSPENSA');
      
      if (isStatusEspecificoObrigacao) {
        const statusStyle = getObrigacaoStatusStyle(null, statusName);
        return { backgroundColor: statusStyle.backgroundColor };
      }
      
      const bgColor = getStatusBgColor(statusName);
      if (bgColor && bgColor !== "#6b7280") {
        return { backgroundColor: bgColor };
      }
      
      const statusStyle = getObrigacaoStatusStyle(null, statusName);
      return { backgroundColor: statusStyle.backgroundColor };
    }
    return {};
  };

  const getStatusIcon = (statusName: string) => {
    return renderIcon(statusName);
  };

  const totalSolicitacoes = useMemo(() => {
    if (visionGeral.length === 0) return 0;
    return visionGeral.reduce((sum, item) => sum + item.qtStatus, 0);
  }, [visionGeral]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title={title + (totalSolicitacoes > 0 ? ' (' + totalSolicitacoes + ')' : '')}
        description={description}
      />
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {visionGeral.map((item) => (
            <div key={item.nmStatus} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {getStatusIcon(item.nmStatus)}
                  <span>{capitalizeWords(item.nmStatus)}</span>
                </div>
                <span className="font-medium">
                  {item.qtStatus} ({item.qtPercentual}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.qtStatus === 0 ? 'bg-gray-200' : getStatusColor(item.nmStatus)}`}
                  style={{ 
                    width: `${item.qtPercentual}%`,
                    ...(item.qtStatus === 0 ? {} : getStatusColorStyle(item.nmStatus))
                  }}
                ></div>
              </div>
            </div>
          ))}

          {visionGeral.length === 0 && (
            <div className="col-span-2 text-sm text-gray-500 text-center">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {showPendentes && (
          <div className="mt-6">
            <SolicitacoesPendentes
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}
        
        {showRecent && (
          <div className="mt-6">
            <h4 className="text-2xl font-semibold leading-none tracking-tight mb-6">
              {cdTipoFluxo === TipoEnum.OBRIGACAO ? 'Obrigações Recentes' : 'Solicitações Recentes'}
            </h4>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Carregando...</div>
                </div>
              ) : listSummary.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma tarefa foi realizada recentemente.</div>
              ) : (
                listSummary.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-between space-x-3 w-full">
                      <div>
                        <div className="font-medium text-sm">{task.nmArea}</div>
                        <div className="text-xs text-gray-500">{task.nmTema}</div>
                      </div>
                      <div className="text-xs text-gray-500">{task.dtCriacaoFormatada}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 mt-auto">
        {totalPages > 1 ? (
          <PaginationTasksStatus
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            loading={loading}
          />
        ) : (
          <></>
        )}
      </CardFooter>
    </Card>
  )
}
