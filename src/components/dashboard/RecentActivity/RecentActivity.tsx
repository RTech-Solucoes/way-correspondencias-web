import dashboardClient from "@/api/dashboard/client";
import { IRecentActivity } from "@/api/dashboard/type";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CardHeader from "../card-header";
import PaginationRecentActivity from "./PaginationRecentActivity";

interface RecentActivityProps {
  refreshTrigger?: number;
}

export default function RecentActivity({ refreshTrigger }: RecentActivityProps) {
  const [listActivity, setListActivity] = useState<IRecentActivity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardClient.getRecentActivity(currentPage, 10);
        setListActivity(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
        toast.error("Não foi possível carregar as atividades recentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-center pr-4">
        <CardHeader
          title="Atividade Recente"
        />
        {totalPages > 1 && (
          <PaginationRecentActivity
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>

      <CardContent className="flex-1">
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Carregando atividades...</div>
            </div>
          ) : listActivity.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhuma atividade recente encontrada.</div>
          ) : (
            listActivity.map((activity, index) => (
              <div key={activity.id || `activity-${index}`} className="flex items-start space-x-3 bg-gray-100 rounded-lg p-4">
                <div className="w-full flex flex-col gap-0.5">
                  <div className="text-sm w-full flex justify-between">
                    <span className="font-bold text-base">{activity.nmResponsavel} </span>
                    <div className="text-gray-600 mt-1">{activity.cdIdentificacao} * {activity.tempoDecorrido}</div>
                  </div>
                  <span className="text-gray-600">{activity.dsAssunto}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}