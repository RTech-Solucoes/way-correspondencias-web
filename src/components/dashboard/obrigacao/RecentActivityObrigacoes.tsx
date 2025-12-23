'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import dashboardClient from "@/api/dashboard/client";
import { ObrigacaoRecentActivityDTO } from "@/api/dashboard/type";
import CardHeader from "../card-header";
import PaginationRecentActivity from "../RecentActivity/PaginationRecentActivity";
import { formatDateTimeBr } from "@/utils/utils";
import Link from "next/link";
import { Info } from "lucide-react";

interface RecentActivityObrigacoesProps {
  refreshTrigger?: number;
}

const getActivityIcon = (tpAtividade: string) => {
  if (tpAtividade === 'TRAMITACAO') {
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

export default function RecentActivityObrigacoes({ refreshTrigger }: RecentActivityObrigacoesProps) {
  const [listActivity, setListActivity] = useState<ObrigacaoRecentActivityDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardClient.getObrigacoesRecentActivity(currentPage, 10);
        setListActivity(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes de obrigações:", error);
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
        <CardHeader title="Atividades Recentes - Obrigações" />
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
              <div 
                key={`activity-${index}-${activity.cdIdentificacao}`} 
                className="flex items-start space-x-3 bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors overflow-hidden"
              >
                {getActivityIcon(activity.tpAtividade)}
                
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-base text-gray-900 truncate">
                        {activity.nmResponsavel}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                        <Link href={`/obrigacao/${activity.idSolicitacao}/conferencia`}>
                            <Info className="w-4 h-4" />
                        </Link>
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-900 break-all text-right max-w-[130px]">
                        {activity.cdIdentificacao}
                      </span>
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTimeBr(activity.dtCriacao)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 break-words overflow-hidden">
                    {activity.dsAssunto}
                  </p>
                  
                  {activity.dsParecer && activity.tpAtividade === 'PARECER' && (
                    <p className="text-xs text-gray-500 italic line-clamp-2 mt-1 break-words overflow-hidden">
                      &quot;{activity.dsParecer}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

