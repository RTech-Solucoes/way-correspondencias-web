import dashboardClient from "@/api/dashboard/client";
import { DashboardListSummary, DashboardOverview } from "@/api/dashboard/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CardHeader from "../card-header";
import { capitalizeWords, getStatusColorVision, renderIcon } from "../functions";
import PaginationTasksStatus from "./PaginationTasksStatus";

interface TasksStatusBoardProps {
  refreshTrigger?: number;
}

export default function TasksStatusBoard({ refreshTrigger }: TasksStatusBoardProps) {
  const [visionGeral, setVisionGeral] = useState<DashboardOverview[]>([]);
  const [listSummary, setListSummary] = useState<DashboardListSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const sortVisionGeral = (data: DashboardOverview[]) => {
    const statusOrder = [
      "Concluído",
      "Em análise da área técnica",
      "Em aprovação",
      "Pré-análise",
      "Em assinatura Diretoria",
      "Arquivado",
      "Em chancela",
      "Vencido regulatório",
      "Análise regulatória",
      "Vencido área técnica",
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
        const data = await dashboardClient.getOverview();
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
        const response = await dashboardClient.getRecentOverview(currentPage, 5);
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
  }, [refreshTrigger, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Visão Geral de Solicitações"
        description="Status de todas as solicitações contratuais"
      />
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {visionGeral.map((item) => (
            <div key={item.nmStatus} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {renderIcon(item.nmStatus)}
                  <span>{capitalizeWords(item.nmStatus)}</span>
                </div>
                <span className="font-medium">
                  {item.qtStatus} ({item.qtPercentual}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColorVision(item.nmStatus)}`}
                  style={{ width: `${item.qtPercentual}%` }}
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

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Solicitações Recentes</h4>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">Carregando obrigações...</div>
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
