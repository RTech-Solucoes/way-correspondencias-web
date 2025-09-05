import dashboardClient from "@/api/dashboard/client";
import { SolicitacaoPrazo } from "@/api/dashboard/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatarDataHora } from "@/utils/FormattDate";
import { ClockIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CardHeader from "../card-header";
import { getStatusColorVision } from "../functions";
import PaginationNextDeadlines from "./PaginationNextDeadlines";
import PaginationRecentActivity from "../RecentActivity/PaginationRecentActivity";


interface NextDeadlinesProps {
  refreshTrigger?: number;
}

export default function NextDeadlines({ refreshTrigger }: NextDeadlinesProps) {

  const [listDeadline, setListDeadline] = useState<SolicitacaoPrazo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getRecentDeadline = async () => {
      try {
        const response = await dashboardClient.getRecentDeadline(currentPage, 10);
        setListDeadline(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Erro ao buscar prazos:", error);
        toast.error("Não foi possível carregar os próximos prazos.");
      } finally {
        setLoading(false);
      }
    };

    getRecentDeadline();
  }, [refreshTrigger, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-center pr-4">
        <CardHeader
          title="Próximos Prazos"
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
      <CardContent>
        <div className="space-y-4">
          {listDeadline.map((deadline, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${getStatusColorVision(deadline.nmStatus)}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{deadline.nmTema}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatarDataHora(deadline.dtFim)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}